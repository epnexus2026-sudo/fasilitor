/**
 * Üye durumu, aktiflik sayaçları ve kademe ilerlemesi.
 * Md. 3.2 (geçiş), Md. 4 (yükümlülük), Md. 6 (yenileme), Md. 7 (kalite).
 */
import { tek, tumu, calistir, denetimYaz } from '../db/index.ts';
import { gecisDegerlendir, type AdayDurumu, type GecisDegerlendirmesi } from '../domain/kademe.ts';
import { yenilemeDegerlendir, yenilemeAsamasi, type AktiflikOzeti, type YenilemeAsamasi } from '../domain/yenileme.ts';
import { rubrikOrtalamasiCok, ardisikDusukRubrik, geriBildirimIslemi, type KaliteIslemi } from '../domain/rubrik.ts';
import { TUM_MODULLER, MODULLER } from '../data/catalog.ts';
import type { Kademe, RubrikPuani, UyeDurumu } from '../domain/types.ts';
import { hatalar } from '../lib/hata.ts';

export interface UyeSatiri {
  id: string;
  ad_soyad: string;
  eposta: string;
  il: string;
  ilce: string;
  okul: string | null;
  brans: string | null;
  kademe: number;
  durum: UyeDurumu;
  rol: 'uye' | 'epnexus';
  kurucu_kohort: number;
  kademe_gecerlilik: string | null;
  yanitsiz_sayac: number;
  yonlendirme_disi_bitis: string | null;
  dizinde_yayinla: number;
  ek_a_imza_tarihi: string | null;
  olusturuldu: string;
}

export function uyeGetir(id: string): UyeSatiri {
  const u = tek<UyeSatiri>('SELECT * FROM uyeler WHERE id = ?', id);
  if (!u) throw hatalar.bulunamadi('Üye bulunamadı.');
  return u;
}

export function uyeVarMi(id: string): boolean {
  return tek('SELECT 1 AS v FROM uyeler WHERE id = ?', id) !== null;
}

const YIL_MS = 365 * 86_400_000;

/** Son 12 aydaki aktiflik sayaçları — yenileme koşulu buna bakar (Md. 6.2). */
export function aktiflikOzeti(uyeId: string, simdi = new Date()): AktiflikOzeti {
  const birYilOnce = new Date(simdi.getTime() - YIL_MS).toISOString();

  const onayli = tek<{ n: number }>(
    "SELECT COUNT(*) AS n FROM uygulama_raporlari WHERE uye_id = ? AND durum = 'onayli' AND tarih >= ?",
    uyeId, birYilOnce,
  )?.n ?? 0;

  const etkinlikSay = (tur: string) =>
    tek<{ n: number }>(
      'SELECT COUNT(*) AS n FROM etkinlikler WHERE uye_id = ? AND tur = ? AND tarih >= ?',
      uyeId, tur, birYilOnce,
    )?.n ?? 0;

  const mentorluk = tek<{ n: number }>(
    'SELECT COUNT(*) AS n FROM mentorluklar WHERE mentor_id = ? AND tarih >= ?',
    uyeId, birYilOnce,
  )?.n ?? 0;

  const kalibrasyon = tek<{ n: number }>(
    `SELECT COUNT(*) AS n FROM kalibrasyon_katilimlari kk
       JOIN kalibrasyonlar k ON k.id = kk.kalibrasyon_id
      WHERE kk.uye_id = ? AND k.tarih >= ?`,
    uyeId, birYilOnce,
  )?.n ?? 0;

  const juri = tek<{ n: number }>(
    'SELECT COUNT(*) AS n FROM juri_degerlendirmeleri WHERE juri_uye_id = ? AND tarih >= ?',
    uyeId, birYilOnce,
  )?.n ?? 0;

  const turnuva = tek<{ n: number }>(
    "SELECT COUNT(*) AS n FROM turnuvalar WHERE duzenleyen_id = ? AND durum IN ('tamamlandi','raporlandi') AND tarih >= ?",
    uyeId, birYilOnce,
  )?.n ?? 0;

  return {
    onayliUygulama: onayli,
    atolye: etkinlikSay('atolye'),
    etkinlik: etkinlikSay('etkinlik') + etkinlikSay('bolge_bulusmasi') + turnuva,
    mentorluk,
    kohort: etkinlikSay('kohort'),
    kalibrasyon,
    urunKurulu: etkinlikSay('urun_kurulu'),
    juriDosyasi: juri,
  };
}

export function rubrikGecmisi(uyeId: string, limit = 20): RubrikPuani[] {
  return tumu<{ rb_kazanim: number; rb_soylem: number; rb_katilim: number; rb_fasilitasyon: number }>(
    `SELECT rb_kazanim, rb_soylem, rb_katilim, rb_fasilitasyon
       FROM uygulama_raporlari
      WHERE uye_id = ? AND durum = 'onayli'
      ORDER BY tarih DESC LIMIT ?`,
    uyeId, limit,
  ).map((r) => ({
    kazanim: r.rb_kazanim, soylem: r.rb_soylem, katilim: r.rb_katilim, fasilitasyon: r.rb_fasilitasyon,
  }));
}

export function rubrikOrtalamasiUye(uyeId: string): number | null {
  return rubrikOrtalamasiCok(rubrikGecmisi(uyeId));
}

/** Md. 7.3 — öğrenci/veli QR anketi ortalaması (5 üzerinden). */
export function geriBildirimOrtalamasi(uyeId: string): number | null {
  const r = tek<{ ort: number | null }>(
    `SELECT AVG((g.s1 + g.s2 + g.s3 + g.s4 + g.s5) / 5.0) AS ort
       FROM geri_bildirimler g
       JOIN uygulama_raporlari u ON u.id = g.rapor_id
      WHERE u.uye_id = ?`,
    uyeId,
  );
  return r?.ort ?? null;
}

export interface KaliteDurumu {
  rubrikOrtalamasi: number | null;
  geriBildirimOrtalamasi: number | null;
  geriBildirimIslemi: KaliteIslemi | null;
  ardisikDusukRubrik: boolean;
  uyarilar: string[];
}

export function kaliteDurumu(uyeId: string): KaliteDurumu {
  const gecmis = rubrikGecmisi(uyeId);
  const rubrikOrt = rubrikOrtalamasiCok(gecmis);
  const gbOrt = geriBildirimOrtalamasi(uyeId);
  const ardisik = ardisikDusukRubrik(gecmis);
  const islem = gbOrt === null ? null : geriBildirimIslemi(gbOrt);

  const uyarilar: string[] = [];
  if (ardisik) uyarilar.push('Md. 6.4 — üst üste 3 uygulamada rubrik <2,5: mentor ataması gerekir.');
  if (islem === 'mentor_atamasi') uyarilar.push('Md. 7.3 — geri bildirim 3,0-3,4: mentor ataması zorunlu.');
  if (islem === 'aski_degerlendirmesi') uyarilar.push('Md. 7.3 — geri bildirim <3,0: askı değerlendirmesi.');
  if (islem === 'mentor_onerisi') uyarilar.push('Md. 7.3 — geri bildirim 3,5-3,9: mentor önerilir.');

  return {
    rubrikOrtalamasi: rubrikOrt,
    geriBildirimOrtalamasi: gbOrt,
    geriBildirimIslemi: islem,
    ardisikDusukRubrik: ardisik,
    uyarilar,
  };
}

export function tamamlananModulSaati(uyeId: string, hedefKademe: 1 | 2 | 3): number {
  const kodlar = new Set(MODULLER[hedefKademe].map((m) => m.kod));
  const tamamlanan = tumu<{ modul_kodu: string }>(
    'SELECT modul_kodu FROM modul_ilerlemesi WHERE uye_id = ?',
    uyeId,
  );
  return tamamlanan
    .filter((t) => kodlar.has(t.modul_kodu))
    .reduce((s, t) => s + (TUM_MODULLER.find((m) => m.kod === t.modul_kodu)?.saat ?? 0), 0);
}

export function adayDurumu(uyeId: string): AdayDurumu {
  const uye = uyeGetir(uyeId);
  const hedef = Math.min(uye.kademe + 1, 3) as 1 | 2 | 3;
  const aktiflik = aktiflikOzeti(uyeId);

  const sinav = tek<{ puan: number }>(
    'SELECT MAX(puan) AS puan FROM sinav_sonuclari WHERE uye_id = ? AND kademe = ?',
    uyeId, hedef,
  );
  const tasarim = tek<{ puan: number | null }>(
    `SELECT MAX(rubrik_puani) AS puan FROM tasarimlar
      WHERE tasarimci_id = ? AND kademe = ? AND durum = 'kabul'`,
    uyeId, hedef,
  );
  const kalibrasyon = tek<{ uyum: number | null }>(
    `SELECT MAX(kk.uyum_yuzdesi) AS uyum FROM kalibrasyon_katilimlari kk WHERE kk.uye_id = ?`,
    uyeId,
  );
  const toplamOnayli = tek<{ n: number }>(
    "SELECT COUNT(*) AS n FROM uygulama_raporlari WHERE uye_id = ? AND durum = 'onayli'",
    uyeId,
  )?.n ?? 0;
  const davet = tek<{ n: number }>(
    "SELECT COUNT(*) AS n FROM etkinlikler WHERE uye_id = ? AND tur = 'kohort' AND ad LIKE 'Kademe 3 daveti%'",
    uyeId,
  )?.n ?? 0;

  // Kademe 2 bitirme projesi: A işletme dosyası etkinlik kaydında, B tasarım puanında tutulur.
  const bitirmeA = tek<{ n: number }>(
    "SELECT MAX(katilimci) AS n FROM etkinlikler WHERE uye_id = ? AND tur = 'kohort' AND ad = 'Bitirme A'",
    uyeId,
  )?.n ?? null;

  return {
    kademe: uye.kademe as Kademe,
    onayliUygulama: toplamOnayli,
    turnuvaSayisi: aktiflik.etkinlik,
    mentorlukSayisi: aktiflik.mentorluk,
    rubrikOrtalamasi: rubrikOrtalamasiUye(uyeId),
    kalibrasyonUyumu: kalibrasyon?.uyum ?? null,
    sinavPuani: sinav?.puan ?? null,
    tasarimPuani: tasarim?.puan ?? null,
    tamamlananModulSaati: tamamlananModulSaati(uyeId, hedef),
    davetVarMi: davet > 0,
    bitirmeA,
    bitirmeB: tasarim?.puan ?? null,
    aktifMi: uye.durum === 'aktif',
  };
}

export function ilerlemeDurumu(uyeId: string): GecisDegerlendirmesi {
  return gecisDegerlendir(adayDurumu(uyeId));
}

export interface YenilemeDurumu {
  kademe: Kademe;
  gecerlilik: string | null;
  asama: YenilemeAsamasi | null;
  kosulKarsilandi: boolean;
  eksikler: string[];
  aciklama: string;
}

export function yenilemeDurumu(uyeId: string, simdi = new Date()): YenilemeDurumu {
  const uye = uyeGetir(uyeId);
  if (uye.kademe === 0 || !uye.kademe_gecerlilik) {
    return {
      kademe: uye.kademe as Kademe, gecerlilik: null, asama: null,
      kosulKarsilandi: true, eksikler: [],
      aciklama: 'Kademe 0 üyeliğinde yenileme koşulu yoktur.',
    };
  }
  const kademe = uye.kademe as 1 | 2 | 3;
  const degerlendirme = yenilemeDegerlendir(kademe, aktiflikOzeti(uyeId, simdi));
  const asama = yenilemeAsamasi(kademe, new Date(uye.kademe_gecerlilik), simdi, degerlendirme.karsilandi);

  return {
    kademe, gecerlilik: uye.kademe_gecerlilik, asama,
    kosulKarsilandi: degerlendirme.karsilandi,
    eksikler: degerlendirme.eksikler,
    aciklama: degerlendirme.kosul.aciklama,
  };
}

export function durumGuncelle(uyeId: string, durum: UyeDurumu, kademe?: Kademe, aktor?: string): void {
  if (kademe === undefined) {
    calistir('UPDATE uyeler SET durum = ?, guncellendi = ? WHERE id = ?', durum, new Date().toISOString(), uyeId);
  } else {
    calistir(
      'UPDATE uyeler SET durum = ?, kademe = ?, guncellendi = ? WHERE id = ?',
      durum, kademe, new Date().toISOString(), uyeId,
    );
  }
  denetimYaz(aktor ?? null, 'uye_durum_guncelle', uyeId, { durum, kademe });
}
