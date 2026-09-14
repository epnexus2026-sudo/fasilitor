/** Talep yönlendirme — Yönetmelik Md. 9. */
import { Yonlendirici, aktifKullanici, epnexusEkibi, gerekliKullanici, type Baglam } from '../lib/http.ts';
import { govdeDogrula, d } from '../lib/dogrula.ts';
import { tek, tumu, calistir, denetimYaz, islem } from '../db/index.ts';
import { kimlikUret, simdi } from '../lib/id.ts';
import { hatalar } from '../lib/hata.ts';
import {
  talepAta, yanitsizlikIsle, yanitAlindi, YUK_PENCERESI_GUN,
  type AdayFasilitator, type Talep,
} from '../domain/yonlendirme.ts';
import { rubrikOrtalamasiUye } from '../services/uyeServisi.ts';

export const talepRotalari = new Yonlendirici();

interface TalepSatiri {
  id: string; kaynak: string; iletisim_ad: string; iletisim_eposta: string; telefon: string | null;
  il: string; ilce: string; okul_adi: string | null; aciklama: string; durum: string;
  atanan_uye_id: string | null; atama_kurali: string | null; atama_gerekcesi: string | null;
  yanit_son_tarihi: string | null; kademe2_acigi: number; olusturuldu: string; guncellendi: string;
}

/** Md. 9.2 — atama havuzu; il bazında aday fasilitatörler. */
function havuzKur(il: string, disla: string[] = []): AdayFasilitator[] {
  const pencere = new Date(Date.now() - YUK_PENCERESI_GUN * 86_400_000).toISOString();
  const uyeler = tumu<{
    id: string; ad_soyad: string; kademe: number; il: string; ilce: string;
    durum: string; yonlendirme_disi_bitis: string | null;
  }>(
    // rol = 'uye': EPNEXUS ekip hesapları yönlendirme havuzuna girmez.
    `SELECT id, ad_soyad, kademe, il, ilce, durum, yonlendirme_disi_bitis
       FROM uyeler WHERE il = ? AND kademe >= 1 AND rol = 'uye'`,
    il,
  );

  return uyeler
    .filter((u) => !disla.includes(u.id))
    .map((u) => ({
      uyeId: u.id,
      adSoyad: u.ad_soyad,
      kademe: u.kademe as AdayFasilitator['kademe'],
      il: u.il,
      ilce: u.ilce,
      aktifMi: u.durum === 'aktif',
      rubrikOrtalamasi: rubrikOrtalamasiUye(u.id),
      son90GunTalep: tek<{ n: number }>(
        'SELECT COUNT(*) AS n FROM talepler WHERE atanan_uye_id = ? AND olusturuldu >= ?',
        u.id, pencere,
      )?.n ?? 0,
      yonlendirmeDisiBitis: u.yonlendirme_disi_bitis,
      mevcutOkullar: tumu<{ okul_adi: string }>(
        'SELECT okul_adi FROM uye_okullari WHERE uye_id = ?', u.id,
      ).map((o) => o.okul_adi),
    }));
}

function atamayiUygula(t: TalepSatiri, komsuIlceler: string[], disla: string[] = []) {
  const talep: Talep = {
    id: t.id, il: t.il, ilce: t.ilce, okulAdi: t.okul_adi, komsuIlceler,
  };
  const sonuc = talepAta(talep, havuzKur(t.il, disla));

  calistir(
    `UPDATE talepler SET durum = ?, atanan_uye_id = ?, atama_kurali = ?, atama_gerekcesi = ?,
       yanit_son_tarihi = ?, kademe2_acigi = ?, guncellendi = ? WHERE id = ?`,
    sonuc.atanan ? 'atandi' : 'epnexus',
    sonuc.atanan?.uyeId ?? null,
    sonuc.kural,
    sonuc.gerekce,
    sonuc.yanitSonTarihi,
    sonuc.kademe2Acigi ? 1 : 0,
    simdi(),
    t.id,
  );
  denetimYaz(null, 'talep_atama', t.id, { kural: sonuc.kural, atanan: sonuc.atanan?.uyeId ?? null });
  return sonuc;
}

/** Kamuya açık: okul/kurum/veli talep formu. */
talepRotalari.post('/', async (ctx: Baglam) => {
  const g = govdeDogrula(await ctx.govde(), {
    kaynak: d.secenek(['okul', 'kurum', 'veli'] as const),
    iletisimAd: d.metin({ min: 2, maks: 120 }),
    iletisimEposta: d.eposta(),
    telefon: d.istege_bagli(d.metin({ maks: 30 })),
    il: d.metin({ min: 2, maks: 60 }),
    ilce: d.metin({ min: 2, maks: 60 }),
    okulAdi: d.istege_bagli(d.metin({ maks: 160 })),
    aciklama: d.istege_bagli(d.metin({ maks: 2000 })),
    komsuIlceler: d.istege_bagli(d.dizi(d.metin({ maks: 60 }), { maks: 20 })),
  });

  const id = kimlikUret('talep');
  const t = simdi();
  calistir(
    `INSERT INTO talepler (id, kaynak, iletisim_ad, iletisim_eposta, telefon, il, ilce, okul_adi,
       aciklama, durum, olusturuldu, guncellendi)
     VALUES (?,?,?,?,?,?,?,?,?,'yeni',?,?)`,
    id, g.kaynak, g.iletisimAd, g.iletisimEposta.toLowerCase(), g.telefon ?? null,
    g.il, g.ilce, g.okulAdi ?? null, g.aciklama ?? '', t, t,
  );

  const satir = tek<TalepSatiri>('SELECT * FROM talepler WHERE id = ?', id)!;
  const atama = atamayiUygula(satir, g.komsuIlceler ?? []);

  return {
    talepId: id,
    mesaj: atama.atanan
      ? 'Talebiniz bölgenizdeki fasilitatöre iletildi; 48 saat içinde dönüş yapılacaktır.'
      : 'Bölgenizde uygun fasilitatör bulunamadı; talebiniz doğrudan EPNEXUS ekibine iletildi.',
    atama: {
      kural: atama.kural,
      gerekce: atama.gerekce,
      atananAd: atama.atanan?.adSoyad ?? null,
      yanitSonTarihi: atama.yanitSonTarihi,
      kademe2Acigi: atama.kademe2Acigi,
    },
  };
});

/** Fasilitatörün kendisine atanan talepleri. */
talepRotalari.get('/bana-atanan', (ctx: Baglam) => {
  const k = gerekliKullanici(ctx);
  const satirlar = tumu<TalepSatiri>(
    "SELECT * FROM talepler WHERE atanan_uye_id = ? ORDER BY olusturuldu DESC LIMIT 100", k.id,
  );
  return { talepler: satirlar };
});

/** Md. 9.4 — 48 saat içinde kabul/ret. */
talepRotalari.post('/:id/yanit', async (ctx: Baglam) => {
  const k = aktifKullanici(ctx);
  const g = govdeDogrula(await ctx.govde(), {
    karar: d.secenek(['kabul', 'red'] as const),
    komsuIlceler: d.istege_bagli(d.dizi(d.metin({ maks: 60 }), { maks: 20 })),
  });
  const t = tek<TalepSatiri>('SELECT * FROM talepler WHERE id = ?', ctx.params.id!);
  if (!t) throw hatalar.bulunamadi('Talep bulunamadı.');
  if (t.atanan_uye_id !== k.id) throw hatalar.yasak('Bu talep size atanmamış.');
  if (t.durum !== 'atandi') throw hatalar.cakisma(`Talep '${t.durum}' durumunda; yanıt alınamaz.`);

  const gecikti = t.yanit_son_tarihi ? new Date(t.yanit_son_tarihi) < new Date() : false;

  if (g.karar === 'kabul' && !gecikti) {
    islem(() => {
      calistir("UPDATE talepler SET durum = 'kabul', guncellendi = ? WHERE id = ?", simdi(), t.id);
      const sifirla = yanitAlindi();
      calistir('UPDATE uyeler SET yanitsiz_sayac = ? WHERE id = ?', sifirla.yeniSayac, k.id);
    });
    denetimYaz(k.id, 'talep_kabul', t.id);
    return { durum: 'kabul', mesaj: 'Talebi üstlendiniz; iletişim bilgileri paylaşıldı.',
      iletisim: { ad: t.iletisim_ad, eposta: t.iletisim_eposta, telefon: t.telefon } };
  }

  // Ret ya da gecikmiş yanıt: talep sıradaki adaya geçer.
  const yeniden = atamayiUygula(t, g.komsuIlceler ?? [], [k.id]);
  if (gecikti) {
    const uye = tek<{ yanitsiz_sayac: number }>('SELECT yanitsiz_sayac FROM uyeler WHERE id = ?', k.id);
    const sonuc = yanitsizlikIsle(uye?.yanitsiz_sayac ?? 0);
    calistir(
      'UPDATE uyeler SET yanitsiz_sayac = ?, yonlendirme_disi_bitis = ? WHERE id = ?',
      sonuc.yeniSayac, sonuc.dislamaBitis, k.id,
    );
    denetimYaz(k.id, 'talep_gecikme', t.id, sonuc);
    return { durum: 'zaman_asimi', yanitsizlik: sonuc, yenidenAtama: yeniden.kural };
  }
  denetimYaz(k.id, 'talep_red', t.id);
  return { durum: 'red', yenidenAtama: { kural: yeniden.kural, atanan: yeniden.atanan?.adSoyad ?? null } };
});

/**
 * Md. 9.4 — süresi geçmiş atamaları tarar ve sıradakine devreder.
 * Zamanlanmış görev olarak da çağrılabilir (EPNEXUS ekibi).
 */
talepRotalari.post('/zaman-asimi-tara', (ctx: Baglam) => {
  epnexusEkibi(ctx);
  const gecmisler = tumu<TalepSatiri>(
    "SELECT * FROM talepler WHERE durum = 'atandi' AND yanit_son_tarihi < ?", simdi(),
  );
  const sonuclar = gecmisler.map((t) => {
    const eskiAtanan = t.atanan_uye_id!;
    const uye = tek<{ yanitsiz_sayac: number }>('SELECT yanitsiz_sayac FROM uyeler WHERE id = ?', eskiAtanan);
    const y = yanitsizlikIsle(uye?.yanitsiz_sayac ?? 0);
    calistir(
      'UPDATE uyeler SET yanitsiz_sayac = ?, yonlendirme_disi_bitis = ? WHERE id = ?',
      y.yeniSayac, y.dislamaBitis, eskiAtanan,
    );
    const yeni = atamayiUygula(t, [], [eskiAtanan]);
    return { talepId: t.id, eskiAtanan, yanitsizlik: y, yeniKural: yeni.kural, yeniAtanan: yeni.atanan?.uyeId ?? null };
  });
  return { taranan: gecmisler.length, sonuclar };
});

/** Md. 9.2/5 — Kademe 2 açığı olan bölgeler. */
talepRotalari.get('/kademe2-acigi', (ctx: Baglam) => {
  gerekliKullanici(ctx);
  return {
    bolgeler: tumu(
      `SELECT il, ilce, COUNT(*) AS talep_sayisi FROM talepler
        WHERE kademe2_acigi = 1 GROUP BY il, ilce ORDER BY talep_sayisi DESC`,
    ),
    not: 'Bu bölgelerde fasilitatör bulunamadı; Kademe 2 yetiştirme önceliği taşır (Md. 9.2/5).',
  };
});

/** Md. 9.5 — fasilitatörün çalıştığı okulu kaydetmesi (bölge çakışması denetimi). */
talepRotalari.post('/okullarim', async (ctx: Baglam) => {
  const k = aktifKullanici(ctx);
  const g = govdeDogrula(await ctx.govde(), { okulAdi: d.metin({ min: 2, maks: 160 }) });
  const sahip = tek<{ uye_id: string }>(
    'SELECT uye_id FROM uye_okullari WHERE okul_adi = ? AND uye_id <> ?', g.okulAdi, k.id,
  );
  if (sahip) {
    throw hatalar.cakisma(
      'Md. 9.5 — bu okulla çalışan başka bir fasilitatör var; meslektaşın okulu hedef alınamaz (EK-A A.2/5).',
    );
  }
  calistir(
    'INSERT OR IGNORE INTO uye_okullari (uye_id, okul_adi, baslangic) VALUES (?,?,?)',
    k.id, g.okulAdi, simdi(),
  );
  return { okullar: tumu('SELECT okul_adi, baslangic FROM uye_okullari WHERE uye_id = ?', k.id) };
});
