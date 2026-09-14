/**
 * Yönetim: yaptırımlar, yenileme taraması, mentorluk, kalibrasyon, pano.
 * Md. 6.3-6.4, Md. 7, Md. 8, Md. 14.
 */
import { Yonlendirici, aktifKullanici, enAzKademe, epnexusEkibi, gerekliKullanici, type Baglam } from '../lib/http.ts';
import { govdeDogrula, d } from '../lib/dogrula.ts';
import { tek, tumu, calistir, denetimYaz, islem } from '../db/index.ts';
import { kimlikUret, simdi } from '../lib/id.ts';
import { hatalar } from '../lib/hata.ts';
import {
  yaptirimUygula, dogrudanIptal, BASAMAKLAR, DOGRUDAN_IPTAL,
  type YaptirimBasamagi, type DogrudanIptalSebebi,
} from '../domain/yaptirim.ts';
import { yenilemeDurumu, aktiflikOzeti, kaliteDurumu, durumGuncelle, uyeGetir } from '../services/uyeServisi.ts';
import { hatirlatmaGerekli } from '../domain/yenileme.ts';
import { nxYaz } from '../services/nxServisi.ts';
import type { Kademe } from '../domain/types.ts';

export const yonetimRotalari = new Yonlendirici();

/** Md. 8 — yaptırım uygulama. Basamak 2'den itibaren savunma süresi işler. */
yonetimRotalari.post('/yaptirim', async (ctx: Baglam) => {
  const uygulayan = epnexusEkibi(ctx);
  const g = govdeDogrula(await ctx.govde(), {
    uyeId: d.metin({ min: 3, maks: 60 }),
    basamak: d.secenek(['gorusme', 'yazili_uyari', 'mentor_atamasi', 'aski', 'kademe_dususu', 'iptal'] as const),
    sebep: d.metin({ min: 10, maks: 2000 }),
    dogrudanIptalSebebi: d.istege_bagli(
      d.secenek(['uydurma_veri', 'kvkk_fotograf', 'cocuk_guvenligi'] as const),
    ),
  });

  const uye = uyeGetir(g.uyeId);
  const now = new Date();

  const sonuc = g.dogrudanIptalSebebi
    ? dogrudanIptal(g.dogrudanIptalSebebi as DogrudanIptalSebebi, now)
    : yaptirimUygula(g.basamak as YaptirimBasamagi, uye.kademe as Kademe, now);

  islem(() => {
    calistir(
      `INSERT INTO yaptirimlar (id, uye_id, basamak, sebep, dogrudan_iptal_sebebi,
         savunma_son_tarihi, itiraz_durumu, uygulayan_id, tarih)
       VALUES (?,?,?,?,?,?,'yok',?,?)`,
      kimlikUret('yaptirim'), uye.id, g.basamak, g.sebep, g.dogrudanIptalSebebi ?? null,
      sonuc.savunmaSonuTarihi, uygulayan.id, simdi(),
    );
    durumGuncelle(uye.id, sonuc.yeniDurum, sonuc.yeniKademe, uygulayan.id);
    if (sonuc.dizindenCikar) {
      calistir('UPDATE uyeler SET dizinde_yayinla = 0 WHERE id = ?', uye.id);
    }
    if (sonuc.yeniDurum === 'iptal' || sonuc.yeniDurum === 'askida') {
      calistir(
        "UPDATE sertifikalar SET durum = ? WHERE uye_id = ? AND durum = 'gecerli'",
        sonuc.yeniDurum === 'iptal' ? 'iptal' : 'askida', uye.id,
      );
    }
  });

  denetimYaz(uygulayan.id, 'yaptirim', uye.id, { basamak: g.basamak, sonuc });
  return {
    uyeId: uye.id,
    basamak: BASAMAKLAR[g.basamak as YaptirimBasamagi],
    sonuc,
    savunmaHakki: sonuc.savunmaSonuTarihi
      ? `Md. 8.1 — yazılı bildirim ve 10 iş günü savunma süresi tanınmıştır (son: ${sonuc.savunmaSonuTarihi}).`
      : 'Bu basamakta savunma süreci işlemez (gelişim odaklı görüşme).',
  };
});

/** Md. 8.1 / 14.2 — savunma ve itiraz kaydı. */
yonetimRotalari.post('/yaptirim/:id/savunma', async (ctx: Baglam) => {
  const k = aktifKullanici(ctx);
  const g = govdeDogrula(await ctx.govde(), { savunma: d.metin({ min: 10, maks: 5000 }) });
  const y = tek<{ id: string; uye_id: string; savunma_son_tarihi: string | null }>(
    'SELECT id, uye_id, savunma_son_tarihi FROM yaptirimlar WHERE id = ?', ctx.params.id!,
  );
  if (!y) throw hatalar.bulunamadi('Yaptırım kaydı bulunamadı.');
  if (y.uye_id !== k.id) throw hatalar.yasak('Yalnız kendi savunmanızı sunabilirsiniz.');
  if (y.savunma_son_tarihi && new Date(y.savunma_son_tarihi) < new Date()) {
    throw hatalar.cakisma('Savunma süresi dolmuştur; itiraz yolu açıktır (Md. 14.2).');
  }
  calistir(
    "UPDATE yaptirimlar SET savunma_metni = ?, itiraz_durumu = 'beklemede' WHERE id = ?",
    g.savunma, y.id,
  );
  return { mesaj: 'Savunmanız kaydedildi; karar 15 iş günü içinde bildirilir (Md. 14.2).' };
});

yonetimRotalari.get('/yaptirimlarim', (ctx: Baglam) => {
  const k = gerekliKullanici(ctx);
  return { yaptirimlar: tumu('SELECT * FROM yaptirimlar WHERE uye_id = ? ORDER BY tarih DESC', k.id) };
});

/**
 * Md. 6.3-6.4 — yenileme taraması.
 * 90/30/7 gün hatırlatmaları üretir, ek süresi dolanları bir alt kademeye düşürür.
 */
yonetimRotalari.post('/yenileme-tara', (ctx: Baglam) => {
  const ekip = epnexusEkibi(ctx);
  const uyeler = tumu<{ id: string; ad_soyad: string; kademe: number }>(
    "SELECT id, ad_soyad, kademe FROM uyeler WHERE kademe > 0 AND durum <> 'iptal'",
  );
  const now = new Date();
  const hatirlatmalar: unknown[] = [];
  const dususler: unknown[] = [];
  const ekSureler: unknown[] = [];

  for (const u of uyeler) {
    const durum = yenilemeDurumu(u.id, now);
    if (!durum.asama) continue;

    if (durum.asama.asama === 'hatirlatma') {
      const esik = hatirlatmaGerekli(durum.asama.kalanGun) ?? durum.asama.esik;
      const yazildi = calistir(
        'INSERT OR IGNORE INTO hatirlatmalar (uye_id, esik_gun, gonderim) VALUES (?,?,?)',
        u.id, esik, now.toISOString().slice(0, 10),
      );
      if (yazildi.changes > 0) {
        hatirlatmalar.push({ uyeId: u.id, adSoyad: u.ad_soyad, esikGun: esik, kalanGun: durum.asama.kalanGun });
      }
    } else if (durum.asama.asama === 'ek_sure') {
      calistir("UPDATE uyeler SET durum = 'ek_sure' WHERE id = ? AND durum = 'aktif'", u.id);
      ekSureler.push({
        uyeId: u.id, adSoyad: u.ad_soyad,
        bitis: durum.asama.bitisTarihi, eksikler: durum.eksikler,
      });
    } else if (durum.asama.asama === 'dusus') {
      const yeni = durum.asama.yeniKademe;
      islem(() => {
        durumGuncelle(u.id, 'aktif', yeni, ekip.id);
        calistir(
          "UPDATE sertifikalar SET durum = 'suresi_doldu' WHERE uye_id = ? AND durum = 'gecerli'", u.id,
        );
        calistir(
          `INSERT INTO yaptirimlar (id, uye_id, basamak, sebep, itiraz_durumu, uygulayan_id, tarih)
           VALUES (?,?,'kademe_dususu',?,'yok',?,?)`,
          kimlikUret('yaptirim'), u.id,
          `Md. 6.4 — yenileme koşulu karşılanmadı: ${durum.eksikler.join('; ')}`,
          ekip.id, simdi(),
        );
      });
      dususler.push({ uyeId: u.id, adSoyad: u.ad_soyad, eskiKademe: u.kademe, yeniKademe: yeni });
    }
  }

  return {
    taranan: uyeler.length,
    hatirlatmalar,
    ekSureler,
    dususler,
    not: 'Md. 3.3 — kademe düşüşünde üye sıfırlanmaz; Kademe 1’ini kaybeden Kâşif olarak kalır ve bir sonraki kohorta %40 indirimle katılabilir.',
  };
});

/** Md. 4.3 / 7.1 — mentorluk kaydı. */
yonetimRotalari.post('/mentorluk', async (ctx: Baglam) => {
  const mentor = enAzKademe(ctx, 2);
  const g = govdeDogrula(await ctx.govde(), {
    menteeId: d.metin({ min: 3, maks: 60 }),
    tur: d.secenek(['oturum', 'karsilama', 'tasarim', 'zorunlu_atama'] as const),
    not: d.istege_bagli(d.metin({ maks: 4000 })),
  });
  if (g.menteeId === mentor.id) throw hatalar.gecersizIstek('Kendinize mentorluk kaydı açamazsınız.');
  uyeGetir(g.menteeId);

  const id = kimlikUret('mentorluk');
  calistir(
    'INSERT INTO mentorluklar (id, mentor_id, mentee_id, tur, not_metni, tarih) VALUES (?,?,?,?,?,?)',
    id, mentor.id, g.menteeId, g.tur, g.not ?? '', simdi(),
  );
  return { id, mesaj: 'Mentorluk kaydı oluşturuldu.', uyari: 'Md. 14.4 — mentorluk yaptığınız kişinin sertifika kararını veremez, tasarımını değerlendiremezsiniz.' };
});

/** Md. 7.1/3 — kalibrasyon oturumu; K3 lider, K2 katılımcı, 6 ayda bir. */
yonetimRotalari.post('/kalibrasyon', async (ctx: Baglam) => {
  const lider = enAzKademe(ctx, 3);
  const g = govdeDogrula(await ctx.govde(), {
    aciklama: d.metin({ min: 3, maks: 500 }),
    katilimlar: d.dizi((v, alan) => {
      const o = v as Record<string, unknown>;
      if (typeof o?.uyeId !== 'string') throw hatalar.gecersizIstek(`${alan}: uyeId zorunlu.`);
      const uyum = Number(o.uyumYuzdesi);
      if (!Number.isInteger(uyum) || uyum < 0 || uyum > 100) {
        throw hatalar.gecersizIstek(`${alan}: uyumYuzdesi 0-100 arası tam sayı olmalı.`);
      }
      return { uyeId: o.uyeId, uyumYuzdesi: uyum };
    }, { min: 1, maks: 100 }),
  });

  const id = kimlikUret('kalibrasyon');
  islem(() => {
    calistir(
      'INSERT INTO kalibrasyonlar (id, lider_id, tarih, aciklama) VALUES (?,?,?,?)',
      id, lider.id, simdi(), g.aciklama,
    );
    for (const k of g.katilimlar) {
      calistir(
        'INSERT OR REPLACE INTO kalibrasyon_katilimlari (kalibrasyon_id, uye_id, uyum_yuzdesi) VALUES (?,?,?)',
        id, k.uyeId, k.uyumYuzdesi,
      );
    }
  });

  return {
    id,
    katilimlar: g.katilimlar.map((k) => ({
      ...k,
      // Md. 4.3 — Kademe 2 için uyum eşiği %80, Kademe 3 geçişi için %85.
      k2Esigi: k.uyumYuzdesi >= 80,
      k3Esigi: k.uyumYuzdesi >= 85,
    })),
  };
});

/** Md. 4 / 6.2 — atölye, etkinlik, kohort gibi yenileme sayaçlarını besleyen kayıtlar. */
yonetimRotalari.post('/etkinlik', async (ctx: Baglam) => {
  const k = aktifKullanici(ctx);
  const g = govdeDogrula(await ctx.govde(), {
    tur: d.secenek(['atolye', 'etkinlik', 'bolge_bulusmasi', 'kohort', 'urun_kurulu', 'juri'] as const),
    ad: d.metin({ min: 2, maks: 160 }),
    katilimci: d.istege_bagli(d.tamsayi({ min: 0, maks: 5000 })),
    tarih: d.istege_bagli(d.tarih()),
  });
  // Md. 4.4 — Kademe 1 eğitimi (kohort) yalnız Master tarafından verilir.
  if (g.tur === 'kohort' && k.kademe < 3 && k.rol !== 'epnexus') {
    throw hatalar.yasak('Md. 4.4 — Kademe 1 eğitimi verme yetkisi yalnız Master Fasilitatördedir.');
  }
  const id = kimlikUret('etkinlik');
  calistir(
    'INSERT INTO etkinlikler (id, uye_id, tur, ad, katilimci, tarih) VALUES (?,?,?,?,?,?)',
    id, k.id, g.tur, g.ad, g.katilimci ?? 0, g.tarih ?? simdi(),
  );
  return { id, aktiflik: aktiflikOzeti(k.id) };
});

/** Md. 11.1 — webinar katılımı 75 NX. */
yonetimRotalari.post('/webinar-katilim', async (ctx: Baglam) => {
  const k = aktifKullanici(ctx);
  const g = govdeDogrula(await ctx.govde(), { etkinlikKodu: d.metin({ min: 2, maks: 60 }) });
  return nxYaz(k.id, 'webinar_katilim', { anahtar: g.etkinlikKodu, aciklama: `Webinar: ${g.etkinlikKodu}` });
});

/** Ağ panosu — Sistem Kılavuzu § 3.4 hedefleriyle karşılaştırmalı. */
yonetimRotalari.get('/pano', (ctx: Baglam) => {
  const k = gerekliKullanici(ctx);
  if (k.kademe < 3 && k.rol !== 'epnexus') {
    throw hatalar.yasak('Ağ panosu Kademe 3 ve EPNEXUS ekibine açıktır.');
  }
  const say = (sql: string, ...p: unknown[]) => tek<{ n: number }>(sql, ...p)?.n ?? 0;
  const doksanGunOnce = new Date(Date.now() - 90 * 86_400_000).toISOString();

  const kademeSayilari = [0, 1, 2, 3].map((kd) => ({
    kademe: kd,
    toplam: say('SELECT COUNT(*) AS n FROM uyeler WHERE kademe = ? AND rol = ?', kd, 'uye'),
    aktif: say("SELECT COUNT(*) AS n FROM uyeler WHERE kademe = ? AND durum = 'aktif' AND rol = 'uye'", kd),
  }));

  // Sistem Kılavuzu § 3.4 — en kritik metrik: 90 gün sonra hâlâ aktif fasilitatör oranı ≥%55.
  const doksanGunOncekiler = say(
    "SELECT COUNT(*) AS n FROM uyeler WHERE kademe >= 1 AND olusturuldu <= ?", doksanGunOnce,
  );
  const halaAktif = say(
    `SELECT COUNT(DISTINCT u.id) AS n FROM uyeler u
       JOIN uygulama_raporlari r ON r.uye_id = u.id AND r.durum = 'onayli' AND r.tarih >= ?
      WHERE u.kademe >= 1 AND u.olusturuldu <= ?`,
    doksanGunOnce, doksanGunOnce,
  );

  return {
    hedefler: { kademe0: 5000, kademe1: 250, kademe2: 30, kademe3: 25, ciro: 3_160_000, aktiflikOrani: 0.55 },
    kademeSayilari,
    kurucuKohort: {
      kontenjan: 50,
      dolu: say('SELECT COUNT(*) AS n FROM uyeler WHERE kurucu_kohort = 1'),
    },
    sertifikalar: {
      gecerli: say("SELECT COUNT(*) AS n FROM sertifikalar WHERE durum = 'gecerli'"),
      askida: say("SELECT COUNT(*) AS n FROM sertifikalar WHERE durum = 'askida'"),
      iptal: say("SELECT COUNT(*) AS n FROM sertifikalar WHERE durum = 'iptal'"),
    },
    raporlar: {
      bekleyenOnOnay: say("SELECT COUNT(*) AS n FROM uygulama_raporlari WHERE durum = 'gonderildi'"),
      bekleyenOnay: say("SELECT COUNT(*) AS n FROM uygulama_raporlari WHERE durum = 'on_onayli'"),
      onayli: say("SELECT COUNT(*) AS n FROM uygulama_raporlari WHERE durum = 'onayli'"),
    },
    tasarimlar: {
      juride: say("SELECT COUNT(*) AS n FROM tasarimlar WHERE durum = 'juride'"),
      havuzda: say('SELECT COUNT(*) AS n FROM tasarimlar WHERE olgunluk IS NOT NULL'),
    },
    talepler: {
      bekleyen: say("SELECT COUNT(*) AS n FROM talepler WHERE durum = 'atandi'"),
      kabul: say("SELECT COUNT(*) AS n FROM talepler WHERE durum = 'kabul'"),
      epnexusaDusen: say("SELECT COUNT(*) AS n FROM talepler WHERE durum = 'epnexus'"),
    },
    kritikMetrik: {
      ad: '90 gün sonra hâlâ aktif fasilitatör oranı',
      hedef: 0.55,
      taban: doksanGunOncekiler,
      halaAktif,
      oran: doksanGunOncekiler > 0 ? Number((halaAktif / doksanGunOncekiler).toFixed(3)) : null,
    },
    kademe2Acigi: tumu(
      'SELECT il, ilce, COUNT(*) AS talep FROM talepler WHERE kademe2_acigi = 1 GROUP BY il, ilce ORDER BY talep DESC LIMIT 10',
    ),
    dogrudanIptalHalleri: DOGRUDAN_IPTAL,
  };
});

yonetimRotalari.get('/kalite/:uyeId', (ctx: Baglam) => {
  const k = enAzKademe(ctx, 2);
  const hedef = ctx.params.uyeId!;
  if (hedef !== k.id && k.kademe < 3 && k.rol !== 'epnexus') {
    throw hatalar.yasak('Başka üyenin kalite dosyasını görmek için Kademe 3 yetkisi gerekir.');
  }
  return {
    uye: uyeGetir(hedef).ad_soyad,
    kalite: kaliteDurumu(hedef),
    aktiflik: aktiflikOzeti(hedef),
    yenileme: yenilemeDurumu(hedef),
  };
});
