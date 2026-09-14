/**
 * EPNEXUS Fasilitatör Ağı — ortak alan tipleri.
 * Kaynak: Fasilitatör Ağı Yönetmeliği v1.1 (docs/02_Belgeler_Kaynak_MD/02_Fasilitator_Agi_Yonetmeligi.md)
 */

/** Kademe 0 Kâşif · 1 Fasilitatör · 2 Kıdemli · 3 Master (Yönetmelik Md. 3.1) */
export type Kademe = 0 | 1 | 2 | 3;

export const KADEME_UNVAN: Record<Kademe, string> = {
  0: 'Kâşif',
  1: 'Fasilitatör',
  2: 'Kıdemli Fasilitatör',
  3: 'Master Fasilitatör',
};

/** EK-A A.1'de tanımlı, sözleşmeyle kullanımına izin verilen resmî unvanlar. */
export const KADEME_MARKA_UNVANI: Record<Kademe, string | null> = {
  0: null,
  1: 'Sertifikalı EPNEXUS Oyun Fasilitatörü',
  2: 'EPNEXUS Kıdemli Fasilitatörü',
  3: 'EPNEXUS Master Fasilitatörü',
};

/** Md. 8 yaptırım basamakları ve Md. 6.4 askı/iptal halleri. */
export type UyeDurumu = 'aktif' | 'askida' | 'iptal' | 'ek_sure';

/** Md. 7.2 rapor onay akışı: fasilitatör → K2 ön onay → K3 onay → NX. */
export type RaporDurumu =
  | 'taslak'
  | 'gonderildi'
  | 'on_onayli'
  | 'onayli'
  | 'duzeltme_istendi'
  | 'reddedildi';

/** Oyun Atölyesi Programı § 6.2 olgunluk düzeyleri. */
export type Olgunluk = 'tohum' | 'prototip' | 'yayin_adayi' | 'yayinlanmis';

/** Oyun Atölyesi Programı § 5.2 jüri kararları. */
export type JuriKarari = 'kabul' | 'revizyonla_kabul' | 'yeniden_tasarim' | 'red';

/** Md. 5.2 telif katmanları. */
export type TelifTuru = 'ozgun' | 'ortak_gelistirme' | 'varyant';

/** Md. 5.3 materyal fiyat kademeleri. */
export type FiyatKademesi = 'perakende' | 'f100' | 'f500' | 'f1000';

export type AliciTuru =
  | 'veli'
  | 'fasilitator_k1'
  | 'fasilitator_k2'
  | 'fasilitator_k3'
  | 'okul'
  | 'bayi';

/** Md. 9 talep yönlendirme durumları. */
export type TalepDurumu = 'yeni' | 'atandi' | 'kabul' | 'red' | 'zaman_asimi' | 'epnexus';

/** EPNEXUS Kazanım Gözlem Rubriği — 4 boyut × 4 düzey (Md. 2 tanımlar). */
export interface RubrikPuani {
  /** Kazanımın oyunda gözlenmesi */
  kazanim: number;
  /** Matematiksel söylem / akıl yürütme */
  soylem: number;
  /** Katılım ve iş birliği */
  katilim: number;
  /** Fasilitasyon kalitesi */
  fasilitasyon: number;
}

export const RUBRIK_BOYUTLARI: Array<keyof RubrikPuani> = [
  'kazanim',
  'soylem',
  'katilim',
  'fasilitasyon',
];

export const RUBRIK_BOYUT_ADLARI: Record<keyof RubrikPuani, string> = {
  kazanim: 'Kazanımın gözlenmesi',
  soylem: 'Matematiksel söylem',
  katilim: 'Katılım ve iş birliği',
  fasilitasyon: 'Fasilitasyon kalitesi',
};

/** Oyun Atölyesi EK-3 — 100 puanlık jüri rubriği boyutları. */
export interface JuriRubrigi {
  mekanik_kazanim: number;
  oynanabilirlik: number;
  karar_kalitesi: number;
  geri_bildirim: number;
  test_kaniti: number;
  revizyon: number;
  uretilebilirlik: number;
}

export interface Uye {
  id: string;
  ad_soyad: string;
  eposta: string;
  il: string;
  ilce: string;
  kademe: Kademe;
  durum: UyeDurumu;
  kurucu_kohort: boolean;
  /** ISO tarih — sertifika geçerlilik sonu (K0'da null). */
  kademe_gecerlilik: string | null;
  olusturuldu: string;
}
