/**
 * Sertifika düzenleme ve kamuya açık doğrulama.
 * Md. 6.1 (QR doğrulamalı, Open Badges 3.0), Md. 4.4 (kararı Master verir),
 * Md. 14.4 (mentor kendi menteesinin kararını veremez).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Yonlendirici, enAzKademe, gerekliKullanici, type Baglam } from '../lib/http.ts';
import { govdeDogrula, d } from '../lib/dogrula.ts';
import { tek, tumu, calistir, denetimYaz, islem } from '../db/index.ts';
import { hatalar } from '../lib/hata.ts';
import { config } from '../config.ts';
import {
  sertifikaNoUret, sertifikaOlustur, sertifikaDogrula, openBadgeUret,
  dogrulamaUrl, dogrulamaEtiketi, etiketDogrula, sablonAlanlari, sablonDoldur,
  type Sertifika,
} from '../domain/sertifika.ts';
import { gecerlilikSonu } from '../domain/kademe.ts';
import { ilerlemeDurumu, uyeGetir } from '../services/uyeServisi.ts';

export const sertifikaRotalari = new Yonlendirici();

interface SertifikaSatiri {
  no: string; uye_id: string; ad_soyad: string; kademe: number;
  verilis: string; gecerlilik: string; durum: string;
  kurucu_kohort: number; karar_veren_master: string | null; universite_sem: string | null;
  /** Karar veren Master'ın görünen adı (JOIN ile gelir). */
  master_adi?: string | null;
}

function nesneye(s: SertifikaSatiri): Sertifika {
  return {
    no: s.no, uyeId: s.uye_id, adSoyad: s.ad_soyad, kademe: s.kademe as 1 | 2 | 3,
    verilis: s.verilis, gecerlilik: s.gecerlilik, durum: s.durum as Sertifika['durum'],
    kurucuKohort: s.kurucu_kohort === 1,
    // Sertifikada ve şablonda Master'ın adı görünür; veritabanında kimliği tutulur.
    kararVerenMaster: s.master_adi ?? s.karar_veren_master,
    universiteSem: s.universite_sem,
  };
}

const SERTIFIKA_SECIMI = `SELECT s.*, m.ad_soyad AS master_adi
       FROM sertifikalar s
       LEFT JOIN uyeler m ON m.id = s.karar_veren_master`;

function sertifikaBul(no: string): Sertifika | null {
  const s = tek<SertifikaSatiri>(`${SERTIFIKA_SECIMI} WHERE s.no = ?`, no.toUpperCase());
  return s ? nesneye(s) : null;
}

/** Kamuya açık: epnexusgames.com/dogrula/<no> karşılığı. */
sertifikaRotalari.get('/dogrula/:no', (ctx: Baglam) => {
  const no = ctx.params.no!;
  const etiket = ctx.sorgu.get('e');
  const s = sertifikaBul(no);
  const sonuc = sertifikaDogrula(s);

  // QR bağlantısındaki imza etiketi varsa doğrulanır (sahte QR'a karşı).
  if (etiket && s && !etiketDogrula(s.no, etiket, config.gizliAnahtar)) {
    return { bulundu: true, gecerli: false, durum: null, unvan: null,
      mesaj: 'Doğrulama bağlantısının imzası geçersiz.', sertifika: null };
  }
  return sonuc;
});

sertifikaRotalari.get('/:no/openbadge', (ctx: Baglam) => {
  const s = sertifikaBul(ctx.params.no!);
  if (!s) throw hatalar.bulunamadi('Sertifika bulunamadı.');
  return openBadgeUret(s, {
    issuerId: config.issuerId, issuerAd: config.issuerAd, dogrulamaTabani: config.dogrulamaTabani,
  });
});

/** Basılacak sertifika HTML'i — docs/03_Sertifika şablonundan üretilir. */
sertifikaRotalari.get('/:no/html', (ctx: Baglam) => {
  const s = sertifikaBul(ctx.params.no!);
  if (!s) throw hatalar.bulunamadi('Sertifika bulunamadı.');
  const sablonYolu = resolve(config.belgeKoku, '03_Sertifika/EPNEXUS_Sertifika_SABLON.html');
  let sablon: string;
  try {
    sablon = readFileSync(sablonYolu, 'utf8');
  } catch {
    throw hatalar.bulunamadi('Sertifika şablonu bulunamadı (docs/03_Sertifika).');
  }
  const html = sablonDoldur(sablon, sablonAlanlari(s));
  ctx.yanit.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  ctx.yanit.end(html);
  return undefined;
});

sertifikaRotalari.get('/', (ctx: Baglam) => {
  const k = gerekliKullanici(ctx);
  const satirlar = tumu<SertifikaSatiri>(
    `${SERTIFIKA_SECIMI} WHERE s.uye_id = ? ORDER BY s.verilis DESC`, k.id,
  );
  return {
    sertifikalar: satirlar.map((s) => {
      const n = nesneye(s);
      return {
        ...n,
        dogrulamaUrl: dogrulamaUrl(n.no, config.dogrulamaTabani),
        qrEtiketi: dogrulamaEtiketi(n.no, config.gizliAnahtar),
      };
    }),
  };
});

/**
 * Md. 4.4 — sertifika kararını Master Fasilitatör verir.
 * Md. 14.4 — bir Master, mentorluk yaptığı kişinin sertifika kararını veremez.
 */
sertifikaRotalari.post('/duzenle', async (ctx: Baglam) => {
  const master = enAzKademe(ctx, 3);
  const g = govdeDogrula(await ctx.govde(), {
    uyeId: d.metin({ min: 3, maks: 60 }),
    kademe: d.tamsayi({ min: 1, maks: 3 }),
    kosullariGecersizSay: d.istege_bagli(d.mantik()),
  });
  const kademe = g.kademe as 1 | 2 | 3;
  const uye = uyeGetir(g.uyeId);

  if (uye.id === master.id) throw hatalar.yasak('Kendi sertifikanıza karar veremezsiniz (Md. 14.4).');

  const mentorluk = tek(
    'SELECT 1 AS v FROM mentorluklar WHERE mentor_id = ? AND mentee_id = ?', master.id, uye.id,
  );
  if (mentorluk) {
    throw hatalar.yasak('Md. 14.4 — mentorluk yaptığınız kişinin sertifika kararını veremezsiniz. Bu kuralın istisnası yoktur.');
  }
  // EK-A sertifika verilmeden önce imzalanır.
  if (!uye.ek_a_imza_tarihi) {
    throw hatalar.gecersizIstek('EK-A Marka ve Etik Sözleşmesi imzalanmadan sertifika düzenlenemez.');
  }

  const degerlendirme = ilerlemeDurumu(uye.id);
  if (!degerlendirme.uygun && !g.kosullariGecersizSay) {
    throw hatalar.gecersizIstek('Md. 3.2 geçiş koşulları karşılanmadı.', degerlendirme.eksikler);
  }

  const yil = new Date().getUTCFullYear();
  const sonSira = tek<{ n: number }>(
    'SELECT COUNT(*) AS n FROM sertifikalar WHERE kademe = ? AND verilis LIKE ?',
    kademe, `${yil}%`,
  )?.n ?? 0;
  const no = sertifikaNoUret(kademe, yil, sonSira + 1);
  const verilis = new Date();
  const s = sertifikaOlustur({
    no: no.tam, uyeId: uye.id, adSoyad: uye.ad_soyad, kademe, verilis,
    kurucuKohort: uye.kurucu_kohort === 1,
    kararVerenMaster: master.adSoyad,
    universiteSem: config.universiteSem,
  });

  islem(() => {
    calistir(
      `INSERT INTO sertifikalar (no, uye_id, ad_soyad, kademe, verilis, gecerlilik, durum,
        kurucu_kohort, karar_veren_master, universite_sem)
       VALUES (?,?,?,?,?,?,'gecerli',?,?,?)`,
      s.no, s.uyeId, s.adSoyad, s.kademe, s.verilis, s.gecerlilik,
      s.kurucuKohort ? 1 : 0, master.id, s.universiteSem,
    );
    calistir(
      'UPDATE uyeler SET kademe = ?, kademe_gecerlilik = ?, guncellendi = ? WHERE id = ?',
      kademe, gecerlilikSonu(kademe, verilis).toISOString(), new Date().toISOString(), uye.id,
    );
  });

  denetimYaz(master.id, 'sertifika_duzenle', s.no, { uyeId: uye.id, kademe });
  return {
    sertifika: s,
    dogrulamaUrl: dogrulamaUrl(s.no, config.dogrulamaTabani),
    qrEtiketi: dogrulamaEtiketi(s.no, config.gizliAnahtar),
    openBadge: openBadgeUret(s, { issuerId: config.issuerId, issuerAd: config.issuerAd, dogrulamaTabani: config.dogrulamaTabani }),
  };
});

/** Md. 6.4 — askı ve iptal. */
sertifikaRotalari.post('/:no/durum', async (ctx: Baglam) => {
  const k = enAzKademe(ctx, 3);
  const g = govdeDogrula(await ctx.govde(), {
    durum: d.secenek(['gecerli', 'askida', 'iptal'] as const),
    gerekce: d.metin({ min: 10, maks: 1000 }),
  });
  const s = sertifikaBul(ctx.params.no!);
  if (!s) throw hatalar.bulunamadi('Sertifika bulunamadı.');

  calistir('UPDATE sertifikalar SET durum = ?, iptal_gerekcesi = ? WHERE no = ?', g.durum, g.gerekce, s.no);
  denetimYaz(k.id, 'sertifika_durum', s.no, { durum: g.durum, gerekce: g.gerekce });
  return sertifikaDogrula(sertifikaBul(s.no));
});
