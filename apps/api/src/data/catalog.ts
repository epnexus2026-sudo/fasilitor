/**
 * EPNEXUS ürün ve program kataloğu.
 * Kaynak: Ürün Kataloğu (Ağustos 2026), Yönetmelik Md. 5.3, Kademe 1/2/3 müfredatları.
 * Bu dosya salt veridir; kural hesapları domain/ altındadır.
 */
import type { Kademe } from '../domain/types.ts';

export interface Oyun {
  id: string;
  ad: string;
  sinif: number;
  mebKazanim: string[];
  epnKod: string[];
  konu: string;
  ozet: string;
  icerik: string;
  fiyat: { f100: number; f500: number; f1000: number };
  renk: string;
}

export const OYUNLAR: Oyun[] = [
  {
    id: 'hazine',
    ad: 'Hazineleri Topla',
    sinif: 5,
    mebKazanim: ['MAT.5.2.1'],
    epnKod: ['EPN-ALG-EXP-004'],
    konu: 'Eşitliğin korunumu',
    ozet:
      'Oyuncular Hazine Avcısı taşlarının hedef sayılarına ulaşmak için 1–5 değerli mücevherleri yatay ve dikey doğrultuda yerleştirir.',
    icerik: '50 mücevher taşı · 2 oyun zemini · 60 Hazine Avcısı taşı · 20 oyun kartı',
    fiyat: { f100: 1400, f500: 900, f1000: 800 },
    renk: '#0D6157',
  },
  {
    id: 'harmonia',
    ad: 'Harmonia',
    sinif: 6,
    mebKazanim: ['MAT.5.2.3', 'MAT.6.2.2'],
    epnKod: ['EPN-ALG-PAT-006', 'EPN-ALG-PAT-007'],
    konu: 'Örüntüler ve genelleme',
    ozet:
      'Oyuncular sırayla iki kart seçerek örüntülerin cevaplarını bulur, doğru eşleşmeyi belirler ve kart üzerindeki numara kadar ilerler.',
    icerik: '1 oyun zemini · örüntü kartları · soru ve şans kartları · fethetme taşları',
    fiyat: { f100: 1500, f500: 800, f1000: 600 },
    renk: '#7A4FA3',
  },
  {
    id: 'salur',
    ad: "Salur Kazan'ın Maceraları",
    sinif: 7,
    mebKazanim: ['MAT.7.2.4'],
    epnKod: ['EPN-CMP-ALG-003'],
    konu: 'Tam sayılarla işlem süreçleri',
    ozet:
      'Oyuncular zar, soru ve şans kartlarıyla ilerler; tam sayılarla dört işlem ve işlem önceliği içeren görevleri çözer.',
    icerik: '1 oyun zemini · 4 piyon · soru ve şans kartları · 1 zar',
    fiyat: { f100: 1500, f500: 850, f1000: 650 },
    renk: '#A8751B',
  },
  {
    id: 'afrodisias',
    ad: 'Afrodisias',
    sinif: 8,
    mebKazanim: ['MAT.7.1.5', 'MAT.7.1.6', 'MAT.7.1.7'],
    epnKod: ['EPN-NUM-RAT-001', 'EPN-PRO-GEN-024', 'EPN-PRO-MOD-009'],
    konu: 'Oran ve orantı',
    ozet:
      "Çırak heykeltıraş olarak Tetrapylon'u yeniden inşa edersiniz; görev seviyesi seçilir, doğru çözüm mermer ve altın kazandırır.",
    icerik: '1 zemin · 4 piyon · 1 zar · 160 mermer blok · 124 altın jeton · 60 görev kartı',
    fiyat: { f100: 1800, f500: 950, f1000: 750 },
    renk: '#A93C2E',
  },
];

export const OYUN_INDEKS = new Map(OYUNLAR.map((o) => [o.id, o]));

export interface EgitimModulu {
  kod: string;
  ad: string;
  saat: number;
  format: string;
  kademe: Kademe;
  nx: number;
}

/** Kademe 1 — 27 saat, 8 modül (Müfredat 03). */
export const MODULLER_K1: EgitimModulu[] = [
  { kod: 'M1', ad: 'Oyun Temelli Öğrenmenin Temeli', saat: 3, format: 'Asenkron', kademe: 1, nx: 100 },
  { kod: 'M2', ad: 'EPNEXUS Müfredat Çerçevesi ve Kazanım Kodları', saat: 4, format: '2 sa asenkron + 2 sa canlı', kademe: 1, nx: 100 },
  { kod: 'M3', ad: 'Dört Oyunun Uygulamalı Öğretimi', saat: 6, format: '2 sa asenkron + 4 sa canlı atölye', kademe: 1, nx: 100 },
  { kod: 'M4', ad: 'Sınıf Yönetimi ve Farklılaştırma', saat: 3, format: '2 sa asenkron + 1 sa canlı', kademe: 1, nx: 100 },
  { kod: 'M5', ad: 'Oyunla Ölçme-Değerlendirme', saat: 3, format: 'Asenkron', kademe: 1, nx: 100 },
  { kod: 'M6', ad: 'Turnuva, Etkinlik ve Hakemlik', saat: 3, format: '2 sa asenkron + 1 sa canlı', kademe: 1, nx: 100 },
  { kod: 'M7', ad: 'Fasilitatörün Ticari ve Etik Tarafı', saat: 2, format: 'Asenkron', kademe: 1, nx: 100 },
  { kod: 'M8', ad: 'Oyun Tasarımına Giriş: Varyant Üretimi', saat: 3, format: 'Asenkron', kademe: 1, nx: 100 },
];

/** Kademe 2 — 18 saatlik kamp (Müfredat 04). */
export const MODULLER_K2: EgitimModulu[] = [
  { kod: 'KM1', ad: 'Uzman Pedagoji: Kavram Yanılgıları ve Veri Okuma', saat: 3, format: '2 sa asenkron + 1 sa kamp', kademe: 2, nx: 100 },
  { kod: 'KM2', ad: 'Program Tasarımı: Satılabilir Ürün Kurmak', saat: 3, format: '1 sa asenkron + 2 sa kamp', kademe: 2, nx: 100 },
  { kod: 'KM3', ad: 'Turnuva Direktörlüğü ve Hakem Kurulu', saat: 3, format: '1 sa asenkron + 2 sa kamp', kademe: 2, nx: 100 },
  { kod: 'KM4', ad: 'Kurumsal Satış ve İş Geliştirme', saat: 3, format: '1 sa asenkron + 2 sa kamp', kademe: 2, nx: 100 },
  { kod: 'KM5', ad: 'Atölye İşletmeciliği: Hukuk, Vergi, KVKK', saat: 2, format: '1 sa asenkron + 1 sa panel', kademe: 2, nx: 100 },
  { kod: 'KM6', ad: 'Mentorluk, Kalibrasyon ve Marka Temsili', saat: 2, format: '2 sa kamp', kademe: 2, nx: 100 },
  { kod: 'KM7', ad: 'İleri Oyun Tasarımı: Özgün Prototip', saat: 2, format: 'Asenkron', kademe: 2, nx: 100 },
];

/** Kademe 3 — 27 sa program + 8 sa gölge + 24 sa ko-eğitmenlik (Müfredat 05). */
export const MODULLER_K3: EgitimModulu[] = [
  { kod: 'MM1', ad: 'Yetişkin Öğreneni Anlamak', saat: 3, format: 'Asenkron', kademe: 3, nx: 100 },
  { kod: 'MM2', ad: 'Eğitim Tasarımı ve Mikro Öğretim', saat: 4, format: '1 sa asenkron + 3 sa kamp', kademe: 3, nx: 100 },
  { kod: 'MM3', ad: 'Kamp ve Kohort Yönetimi', saat: 3, format: '1 sa asenkron + 2 sa kamp', kademe: 3, nx: 100 },
  { kod: 'MM4', ad: 'Yüksek Bahisli Değerlendirme', saat: 4, format: '1 sa asenkron + 3 sa kamp', kademe: 3, nx: 100 },
  { kod: 'MM5', ad: 'Marka Sesi ve İçerik Standardı', saat: 2, format: '1 sa asenkron + 1 sa kamp', kademe: 3, nx: 100 },
  { kod: 'MM6', ad: 'Eğitmenlik İşletmesi', saat: 4, format: '1 sa asenkron + 3 sa kamp', kademe: 3, nx: 100 },
  { kod: 'MM7', ad: 'Ürün Kurulu ve Ar-Ge Döngüsü', saat: 4, format: '4 sa kamp', kademe: 3, nx: 100 },
  { kod: 'MM8', ad: 'Tasarım Mentorluğu ve Oyun Jürisi', saat: 3, format: '1 sa asenkron + 2 sa kamp', kademe: 3, nx: 100 },
];

export const MODULLER: Record<1 | 2 | 3, EgitimModulu[]> = {
  1: MODULLER_K1,
  2: MODULLER_K2,
  3: MODULLER_K3,
};

export const TUM_MODULLER = [...MODULLER_K1, ...MODULLER_K2, ...MODULLER_K3];

/** Oyun Atölyesi § 3 mekanik kütüphanesi — tasarım etiketleme için. */
export const MEKANIKLER = [
  'set-toplama',
  'alan-kontrolu',
  'eslestirme',
  'yol-ilerleme',
  'deste-insasi',
  'blok-yerlestirme',
  'acik-arttirma',
  'isci-yerlestirme',
  'desen-olusturma',
  'risk-secimi',
  'kaynak-yonetimi',
  'tahmin-blof',
] as const;

export type Mekanik = (typeof MEKANIKLER)[number];

export interface Rozet {
  kod: string;
  emoji: string;
  ad: string;
  kosul: string;
  nadir: boolean;
}

export const ROZETLER: Rozet[] = [
  { kod: 'usta_hazine', emoji: '💎', ad: 'Hazineleri Topla Ustası', kosul: '5 onaylı uygulama', nadir: false },
  { kod: 'usta_harmonia', emoji: '🧩', ad: 'Harmonia Ustası', kosul: '5 onaylı uygulama', nadir: false },
  { kod: 'usta_salur', emoji: '⚔️', ad: 'Salur Kazan Ustası', kosul: '5 onaylı uygulama', nadir: false },
  { kod: 'usta_afrodisias', emoji: '🏛️', ad: 'Afrodisias Ustası', kosul: '5 onaylı uygulama', nadir: false },
  { kod: 'kazanim_tamsayilar', emoji: '🔢', ad: 'Tam Sayılar', kosul: 'Kazanım rozeti', nadir: false },
  { kod: 'kazanim_oran', emoji: '📐', ad: 'Oran & Orantı', kosul: 'Kazanım rozeti', nadir: false },
  { kod: 'mufredat_meb', emoji: '🇹🇷', ad: 'MEB / Maarif', kosul: 'Müfredat rozeti', nadir: false },
  { kod: 'mufredat_cambridge', emoji: '🌍', ad: 'Cambridge', kosul: 'Müfredat rozeti', nadir: false },
  { kod: 'kurucu', emoji: '🥇', ad: 'Kurucu Fasilitatör', kosul: 'İlk 50 kişi · bir daha verilmez', nadir: true },
  { kod: 'ilk_turnuva', emoji: '🏆', ad: 'İlk Turnuva', kosul: '2027 sezonu', nadir: true },
  { kod: 'sinir_otesi', emoji: '✈️', ad: 'Sınır Ötesi', kosul: 'Yurt dışı uygulama', nadir: true },
  { kod: 'seri_8', emoji: '🔥', ad: '8 Hafta Seri', kosul: 'Kesintisiz aktiflik', nadir: false },
];

/** Md. 12.2 — YTÜ yurt dışı ofisleri üzerinden öncelikli ülkeler. */
export const ONCELIKLI_ULKELER = [
  'Hollanda',
  'Kuzey Makedonya',
  'Özbekistan',
  'BAE (Dubai)',
  'Birleşik Krallık (Londra)',
] as const;

/** Md. 12.6 — bölgesel fiyatlandırma bantları. */
export const FIYAT_BANTLARI = {
  A: { ad: 'Türkiye', carpan: 1 },
  B: { ad: 'Orta Asya ve Balkanlar', carpan: 0.6 },
  C: { ad: 'Körfez ve Batı Avrupa', carpan: 1.8 },
} as const;
