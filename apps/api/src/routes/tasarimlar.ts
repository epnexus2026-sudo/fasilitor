/**
 * Oyun Atölyesi: tasarım teslimi, jüri değerlendirmesi, Oyun Havuzu.
 * Kaynak: Oyun Atölyesi Programı + Yönetmelik Md. 13.6-13.11 (katmanlı hak modeli).
 */
import { Yonlendirici, aktifKullanici, enAzKademe, gerekliKullanici, type Baglam } from '../lib/http.ts';
import { govdeDogrula, d } from '../lib/dogrula.ts';
import { tek, tumu, calistir, denetimYaz, islem } from '../db/index.ts';
import { kimlikUret, simdi } from '../lib/id.ts';
import { hatalar } from '../lib/hata.ts';
import { nxYaz } from '../services/nxServisi.ts';
import {
  juriDegerlendir, juriTarafsizlikKontrol, juriPuanToplami, havuzAra,
  havuzErisimDegerlendir, JURI_YAPISI, KADEME_OLGUNLUK, KADEME_TELIF,
  OLGUNLUK_TANIMI, HAK_KATMANLARI,
} from '../domain/oyunhavuzu.ts';
import { telifHesapla, ilkTeklifSonTarihi } from '../domain/gelir.ts';
import { MEKANIKLER } from '../data/catalog.ts';
import type { JuriRubrigi, Kademe } from '../domain/types.ts';

export const tasarimRotalari = new Yonlendirici();

interface TasarimSatiri {
  id: string; tasarimci_id: string; ad: string; kademe: number; alan: string;
  sinif_duzeyi: number; meb_kazanim: string; mekanikler: string; oyuncu_sayisi: string;
  sure_dk: number; bilesen_karmasikligi: string; test_edilen_ogrenci: number; dil: string;
  ozet: string; kaynak_beyani: string | null; teslim_no: number; durum: string;
  olgunluk: string | null; rubrik_puani: number | null; revizyon_son: string | null;
  ilk_teklif_bildirimi: string | null; ekc_sozlesme_tarihi: string | null;
  telif_turu: string | null; olusturuldu: string;
}

function bicimle(t: TasarimSatiri, tasarimciAdi?: string) {
  return {
    id: t.id,
    ad: t.ad,
    tasarimci: { id: t.tasarimci_id, adSoyad: tasarimciAdi ?? null },
    kademe: t.kademe,
    etiketler: {
      alan: t.alan,
      sinifDuzeyi: t.sinif_duzeyi,
      mebKazanim: t.meb_kazanim,
      mekanikler: JSON.parse(t.mekanikler) as string[],
      oyuncuSayisi: t.oyuncu_sayisi,
      sureDk: t.sure_dk,
      bilesenKarmasikligi: t.bilesen_karmasikligi,
      testEdilenOgrenci: t.test_edilen_ogrenci,
      rubrikPuani: t.rubrik_puani,
      olgunluk: t.olgunluk,
      dil: t.dil,
    },
    ozet: t.ozet,
    kaynakBeyani: t.kaynak_beyani,
    teslimNo: t.teslim_no,
    durum: t.durum,
    revizyonSonTarihi: t.revizyon_son,
    olgunlukTanimi: t.olgunluk ? OLGUNLUK_TANIMI[t.olgunluk as keyof typeof OLGUNLUK_TANIMI] : null,
    fikriMulkiyet: {
      sahip: 'Tasarımcı (Md. 13.6 — değiştirilemez madde)',
      katmanlar: HAK_KATMANLARI,
      ilkTeklifBildirimi: t.ilk_teklif_bildirimi,
      ekcSozlesmesi: t.ekc_sozlesme_tarihi,
      telifTuru: t.telif_turu,
    },
    olusturuldu: t.olusturuldu,
  };
}

function tasarimGetir(id: string): TasarimSatiri {
  const t = tek<TasarimSatiri>('SELECT * FROM tasarimlar WHERE id = ?', id);
  if (!t) throw hatalar.bulunamadi('Tasarım bulunamadı.');
  return t;
}

tasarimRotalari.post('/', async (ctx: Baglam) => {
  const k = aktifKullanici(ctx);
  const g = govdeDogrula(await ctx.govde(), {
    ad: d.metin({ min: 2, maks: 120 }),
    kademe: d.tamsayi({ min: 1, maks: 3 }),
    alan: d.metin({ min: 2, maks: 40 }),
    sinifDuzeyi: d.tamsayi({ min: 1, maks: 12 }),
    mebKazanim: d.metin({ min: 3, maks: 120 }),
    mekanikler: d.dizi(d.metin({ min: 2, maks: 40 }), { min: 1, maks: 6 }),
    oyuncuSayisi: d.metin({ min: 1, maks: 20 }),
    sureDk: d.tamsayi({ min: 5, maks: 180 }),
    bilesenKarmasikligi: d.secenek(['dusuk', 'orta', 'yuksek'] as const),
    testEdilenOgrenci: d.tamsayi({ min: 0, maks: 5000 }),
    dil: d.istege_bagli(d.metin({ min: 2, maks: 10 })),
    ozet: d.metin({ min: 20, maks: 4000 }),
    /** Md. 13.10 — kaynak beyanı zorunludur; beyansız dosya puanlanmadan geri gönderilir. */
    kaynakBeyani: d.metin({ min: 10, maks: 4000 }),
  });

  if (g.kademe > k.kademe + 1) {
    throw hatalar.yasak(`Kademe ${g.kademe} tasarım çıktısı için önce o kademenin programına gelmelisiniz.`);
  }
  const bilinmeyen = g.mekanikler.filter((m) => !(MEKANIKLER as readonly string[]).includes(m));
  if (bilinmeyen.length > 0) {
    throw hatalar.gecersizIstek(
      `Mekanik kütüphanesinde olmayan mekanik(ler): ${bilinmeyen.join(', ')}.`,
      { kutuphane: MEKANIKLER },
    );
  }

  const id = kimlikUret('tasarim');
  calistir(
    `INSERT INTO tasarimlar (id, tasarimci_id, ad, kademe, alan, sinif_duzeyi, meb_kazanim, mekanikler,
      oyuncu_sayisi, sure_dk, bilesen_karmasikligi, test_edilen_ogrenci, dil, ozet, kaynak_beyani,
      teslim_no, durum, telif_turu, olusturuldu)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,'taslak',?,?)`,
    id, k.id, g.ad, g.kademe, g.alan, g.sinifDuzeyi, g.mebKazanim, JSON.stringify(g.mekanikler),
    g.oyuncuSayisi, g.sureDk, g.bilesenKarmasikligi, g.testEdilenOgrenci, g.dil ?? 'tr',
    g.ozet, g.kaynakBeyani, KADEME_TELIF[g.kademe as 1 | 2 | 3], simdi(),
  );
  return bicimle(tasarimGetir(id));
});

tasarimRotalari.post('/:id/juriye-gonder', (ctx: Baglam) => {
  const k = aktifKullanici(ctx);
  const t = tasarimGetir(ctx.params.id!);
  if (t.tasarimci_id !== k.id) throw hatalar.yasak('Yalnız kendi tasarımınızı gönderebilirsiniz.');
  if (!['taslak', 'revizyonla_kabul'].includes(t.durum)) {
    throw hatalar.cakisma(`'${t.durum}' durumundaki tasarım jüriye gönderilemez.`);
  }
  if (t.durum === 'revizyonla_kabul' && t.teslim_no >= 2) {
    throw hatalar.cakisma('Revizyon tekrar hakkı bir kezdir (§ 5.2).');
  }
  const yeniTeslim = t.durum === 'revizyonla_kabul' ? t.teslim_no + 1 : t.teslim_no;
  calistir("UPDATE tasarimlar SET durum = 'juride', teslim_no = ? WHERE id = ?", yeniTeslim, t.id);
  const yapisi = JURI_YAPISI[t.kademe as 1 | 2 | 3];
  return { tasarim: bicimle(tasarimGetir(t.id)), juri: yapisi };
});

/** § 5 — jüri değerlendirmesi; EK-3 rubriği ve barajlar uygulanır. */
tasarimRotalari.post('/:id/juri', async (ctx: Baglam) => {
  const juri = enAzKademe(ctx, 3);
  const g = govdeDogrula(await ctx.govde(), {
    mekanikKazanim: d.tamsayi({ min: 0, maks: 25 }),
    oynanabilirlik: d.tamsayi({ min: 0, maks: 20 }),
    kararKalitesi: d.tamsayi({ min: 0, maks: 15 }),
    geriBildirim: d.tamsayi({ min: 0, maks: 10 }),
    testKaniti: d.tamsayi({ min: 0, maks: 15 }),
    revizyon: d.tamsayi({ min: 0, maks: 10 }),
    uretilebilirlik: d.tamsayi({ min: 0, maks: 5 }),
    gerekceler: (v, alan) => {
      if (typeof v !== 'object' || v === null) throw hatalar.gecersizIstek(`${alan}: gerekçe nesnesi bekleniyor.`);
      return v as Record<string, string>;
    },
    etikIhlal: d.istege_bagli(d.mantik()),
  });

  const t = tasarimGetir(ctx.params.id!);
  if (t.durum !== 'juride') throw hatalar.cakisma("Yalnız 'juride' durumundaki tasarım değerlendirilir.");

  // § 5.1 + Md. 14.4 tarafsızlık denetimi.
  const mentorluklar = tumu<{ mentee_id: string }>(
    'SELECT mentee_id FROM mentorluklar WHERE mentor_id = ?', juri.id,
  ).map((m) => m.mentee_id);
  const juriUye = tek<{ okul: string | null }>('SELECT okul FROM uyeler WHERE id = ?', juri.id);
  const tasarimci = tek<{ okul: string | null; ad_soyad: string }>(
    'SELECT okul, ad_soyad FROM uyeler WHERE id = ?', t.tasarimci_id,
  );
  const tarafsizlik = juriTarafsizlikKontrol({
    juriUyeId: juri.id,
    tasarimciId: t.tasarimci_id,
    juriMentorlukYaptiklari: mentorluklar,
    juriKurumu: juriUye?.okul ?? null,
    tasarimciKurumu: tasarimci?.okul ?? null,
  });
  if (!tarafsizlik.uygun) throw hatalar.yasak(tarafsizlik.sebep!);

  const puanlar: JuriRubrigi = {
    mekanik_kazanim: g.mekanikKazanim,
    oynanabilirlik: g.oynanabilirlik,
    karar_kalitesi: g.kararKalitesi,
    geri_bildirim: g.geriBildirim,
    test_kaniti: g.testKaniti,
    revizyon: g.revizyon,
    uretilebilirlik: g.uretilebilirlik,
  };

  const sonuc = juriDegerlendir({
    kademe: t.kademe as 1 | 2 | 3,
    puanlar,
    gerekceler: g.gerekceler,
    kaynakBeyaniVar: Boolean(t.kaynak_beyani?.trim()),
    etikIhlal: g.etikIhlal ?? false,
    teslimNo: t.teslim_no,
  });

  if (sonuc.eksikGerekceler.length > 0 && sonuc.karar !== 'puanlanmadi') {
    throw hatalar.gecersizIstek(
      'EK-3 — her boyut için en az bir cümle yazılı gerekçe zorunludur.',
      { eksik: sonuc.eksikGerekceler },
    );
  }

  islem(() => {
    calistir(
      `INSERT INTO juri_degerlendirmeleri
        (tasarim_id, juri_uye_id, mekanik_kazanim, oynanabilirlik, karar_kalitesi, geri_bildirim,
         test_kaniti, revizyon, uretilebilirlik, gerekceler, karar, toplam_puan, tarih)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT(tasarim_id, juri_uye_id) DO UPDATE SET
         mekanik_kazanim = excluded.mekanik_kazanim, oynanabilirlik = excluded.oynanabilirlik,
         karar_kalitesi = excluded.karar_kalitesi, geri_bildirim = excluded.geri_bildirim,
         test_kaniti = excluded.test_kaniti, revizyon = excluded.revizyon,
         uretilebilirlik = excluded.uretilebilirlik, gerekceler = excluded.gerekceler,
         karar = excluded.karar, toplam_puan = excluded.toplam_puan, tarih = excluded.tarih`,
      t.id, juri.id, puanlar.mekanik_kazanim, puanlar.oynanabilirlik, puanlar.karar_kalitesi,
      puanlar.geri_bildirim, puanlar.test_kaniti, puanlar.revizyon, puanlar.uretilebilirlik,
      JSON.stringify(g.gerekceler), sonuc.karar, juriPuanToplami(puanlar), simdi(),
    );

    calistir(
      'UPDATE tasarimlar SET durum = ?, rubrik_puani = ?, olgunluk = ?, revizyon_son = ? WHERE id = ?',
      sonuc.karar, sonuc.toplamPuan,
      sonuc.havuzaGirer ? KADEME_OLGUNLUK[t.kademe as 1 | 2 | 3] : t.olgunluk,
      sonuc.revizyonSonTarihi, t.id,
    );
  });

  // Md. 11.1 — onaylı oyun varyantı paylaşımı 250 NX.
  let nx = null;
  if (sonuc.karar === 'kabul') {
    nx = nxYaz(t.tasarimci_id, 'oyun_varyanti', { anahtar: t.id, aciklama: `Kabul edilen tasarım: ${t.ad}` });
  }

  denetimYaz(juri.id, 'juri_degerlendirme', t.id, { karar: sonuc.karar, puan: sonuc.toplamPuan });
  return { sonuc, tasarim: bicimle(tasarimGetir(t.id), tasarimci?.ad_soyad), nx };
});

/** § 6 — Oyun Havuzu araması. "Havuzun değeri arşivde değil, aranabilirliğindedir." */
tasarimRotalari.get('/havuz', (ctx: Baglam) => {
  const k = gerekliKullanici(ctx);
  if (k.kademe < 1 && k.rol !== 'epnexus') {
    throw hatalar.yasak('Oyun Havuzu sertifikalı fasilitatörlere açıktır (§ 6.2).');
  }
  const satirlar = tumu<TasarimSatiri & { tasarimci_adi: string }>(
    `SELECT t.*, u.ad_soyad AS tasarimci_adi FROM tasarimlar t
       JOIN uyeler u ON u.id = t.tasarimci_id
      WHERE t.olgunluk IS NOT NULL
      ORDER BY t.rubrik_puani DESC NULLS LAST`,
  );

  const kayitlar = satirlar.map((t) => ({
    id: t.id, ad: t.ad, alan: t.alan, sinifDuzeyi: t.sinif_duzeyi,
    mebKazanim: t.meb_kazanim, mekanikler: JSON.parse(t.mekanikler) as string[],
    oyuncuSayisi: t.oyuncu_sayisi, sureDk: t.sure_dk,
    bilesenKarmasikligi: t.bilesen_karmasikligi as 'dusuk' | 'orta' | 'yuksek',
    testEdilenOgrenci: t.test_edilen_ogrenci, rubrikPuani: t.rubrik_puani ?? 0,
    olgunluk: t.olgunluk as keyof typeof OLGUNLUK_TANIMI, dil: t.dil,
  }));

  const s = ctx.sorgu;
  const sonuc = havuzAra(kayitlar, {
    alan: s.get('alan') ?? undefined,
    sinifDuzeyi: s.get('sinif') ? Number(s.get('sinif')) : undefined,
    olgunluk: (s.get('olgunluk') as keyof typeof OLGUNLUK_TANIMI) ?? undefined,
    dil: s.get('dil') ?? undefined,
    mekanik: s.get('mekanik') ?? undefined,
    maksSureDk: s.get('maksSure') ? Number(s.get('maksSure')) : undefined,
    minRubrik: s.get('minRubrik') ? Number(s.get('minRubrik')) : undefined,
  });

  const adlar = new Map(satirlar.map((t) => [t.id, t.tasarimci_adi]));
  return {
    toplam: sonuc.length,
    kayitlar: sonuc.map((x) => ({ ...x, tasarimci: adlar.get(x.id) ?? null })),
    hatirlatma: 'Havuzdaki tasarımlar tasarımcılarına aittir; ticari kullanım ve çoğaltma yasaktır (Md. 13.8).',
  };
});

/** Md. 13.8 — havuzdaki bir tasarım için kullanım izni sorgusu. */
tasarimRotalari.post('/:id/kullanim-izni', async (ctx: Baglam) => {
  const k = gerekliKullanici(ctx);
  const g = govdeDogrula(await ctx.govde(), {
    eylem: d.secenek(['sinifta_kullan', 'ticari_kullan', 'cogalt', 'turev_uret', 'urunlestir'] as const),
  });
  const t = tasarimGetir(ctx.params.id!);
  const karar = havuzErisimDegerlendir({
    eylem: g.eylem,
    talepEdenKademe: k.kademe as Kademe,
    talepEdenTasarimciMi: t.tasarimci_id === k.id,
    ekcSozlesmesiVar: Boolean(t.ekc_sozlesme_tarihi),
  });
  if (karar.izin && karar.tasarimciyaBildirim) {
    denetimYaz(k.id, 'havuz_kullanim_bildirimi', t.id, { eylem: g.eylem });
  }
  return { ...karar, tasarimciId: t.tasarimci_id };
});

/** Md. 13.7 Katman 3 — tasarımcı başka yayıncıya gideceğini bildirir; EPNEXUS'un 90 günü başlar. */
tasarimRotalari.post('/:id/ilk-teklif-bildirimi', (ctx: Baglam) => {
  const k = aktifKullanici(ctx);
  const t = tasarimGetir(ctx.params.id!);
  if (t.tasarimci_id !== k.id) throw hatalar.yasak('Bu bildirimi yalnız tasarımcı yapabilir.');
  const bildirim = new Date();
  calistir('UPDATE tasarimlar SET ilk_teklif_bildirimi = ? WHERE id = ?', bildirim.toISOString(), t.id);
  denetimYaz(k.id, 'ilk_teklif_bildirimi', t.id);
  return {
    bildirimTarihi: bildirim.toISOString(),
    epnexusSonTeklifTarihi: ilkTeklifSonTarihi(bildirim).toISOString(),
    aciklama: 'EPNEXUS 90 gün içinde teklif verebilir; vermezse tasarımcı serbesttir (Md. 13.7/3).',
  };
});

/** Md. 13.7 Katman 4 — EK-C yayın sözleşmesi ve telif hesabı. */
tasarimRotalari.post('/:id/ekc-sozlesme', async (ctx: Baglam) => {
  const k = enAzKademe(ctx, 3);
  const g = govdeDogrula(await ctx.govde(), {
    telifTuru: d.secenek(['ozgun', 'ortak_gelistirme', 'varyant'] as const),
    tasarimciOnayi: d.mantik(),
  });
  if (!g.tasarimciOnayi) {
    throw hatalar.gecersizIstek('Md. 13.6 — tasarımcı onayı olmadan yayın sözleşmesi kaydedilemez.');
  }
  const t = tasarimGetir(ctx.params.id!);
  const tarih = simdi();
  calistir(
    "UPDATE tasarimlar SET ekc_sozlesme_tarihi = ?, telif_turu = ?, olgunluk = 'yayinlanmis' WHERE id = ?",
    tarih, g.telifTuru, t.id,
  );
  denetimYaz(k.id, 'ekc_sozlesme', t.id, { telifTuru: g.telifTuru });
  return { tasarim: bicimle(tasarimGetir(t.id)), sozlesmeTarihi: tarih };
});

tasarimRotalari.get('/:id/telif', (ctx: Baglam) => {
  gerekliKullanici(ctx);
  const t = tasarimGetir(ctx.params.id!);
  const netSatis = Number(ctx.sorgu.get('netSatis') ?? 0);
  const gelistirme = Number(ctx.sorgu.get('gelistirmeUcreti') ?? 0);
  return telifHesapla(
    (t.telif_turu ?? 'varyant') as 'ozgun' | 'ortak_gelistirme' | 'varyant',
    netSatis,
    Boolean(t.ekc_sozlesme_tarihi),
    gelistirme,
  );
});

tasarimRotalari.get('/', (ctx: Baglam) => {
  const k = gerekliKullanici(ctx);
  const satirlar = tumu<TasarimSatiri>(
    'SELECT * FROM tasarimlar WHERE tasarimci_id = ? ORDER BY olusturuldu DESC', k.id,
  );
  return { tasarimlar: satirlar.map((t) => bicimle(t, k.adSoyad)) };
});

tasarimRotalari.get('/:id', (ctx: Baglam) => {
  gerekliKullanici(ctx);
  const t = tasarimGetir(ctx.params.id!);
  const tasarimci = tek<{ ad_soyad: string }>('SELECT ad_soyad FROM uyeler WHERE id = ?', t.tasarimci_id);
  return bicimle(t, tasarimci?.ad_soyad);
});
