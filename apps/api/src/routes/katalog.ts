/** Kamuya açık başvuru verisi: oyunlar, kademe tablosu, ücretler, kurallar. */
import { Yonlendirici, type Baglam } from '../lib/http.ts';
import { OYUNLAR, MODULLER, ROZETLER, MEKANIKLER, ONCELIKLI_ULKELER } from '../data/catalog.ts';
import { GECIS_KOSULLARI, GECERLILIK_YILI } from '../domain/kademe.ts';
import { UCRETLER, ALICI_KURALLARI, KURUCU_KOHORT_KONTENJANI } from '../domain/ucret.ts';
import { PAYLASIM, TELIF_ORANLARI } from '../domain/gelir.ts';
import { NX_KURALLARI, RUTBELER, NX_HARCAMA } from '../domain/nx.ts';
import { JURI_RUBRIGI, TASARIM_BARAJI, OLGUNLUK_TANIMI, JURI_YAPISI, HAK_KATMANLARI } from '../domain/oyunhavuzu.ts';
import { YENILEME_KOSULLARI, MASTER_YUKUMLULUK } from '../domain/yenileme.ts';
import { BASAMAKLAR, DOGRUDAN_IPTAL } from '../domain/yaptirim.ts';
import { RUBRIK_BOYUT_ADLARI, KADEME_UNVAN, KADEME_MARKA_UNVANI } from '../domain/types.ts';
import { BILDIRIM_HAFTA, MASA_BASINA_HAKEM, RAPOR_GUN } from '../domain/turnuva.ts';
import { YANIT_SURESI_SAAT, YANITSIZ_SINIRI, DISLAMA_GUN } from '../domain/yonlendirme.ts';
import { tek } from '../db/index.ts';
import { config } from '../config.ts';

export const katalogRotalari = new Yonlendirici();

katalogRotalari.get('/oyunlar', () => ({ oyunlar: OYUNLAR }));

katalogRotalari.get('/kademeler', () => ({
  kademeler: [0, 1, 2, 3].map((k) => ({
    kademe: k,
    unvan: KADEME_UNVAN[k as 0 | 1 | 2 | 3],
    markaUnvani: KADEME_MARKA_UNVANI[k as 0 | 1 | 2 | 3],
    gecerlilikYili: k === 0 ? null : GECERLILIK_YILI[k as 1 | 2 | 3],
    gecisKosulu: k === 0 ? null : GECIS_KOSULLARI[k as 1 | 2 | 3],
    yenilemeKosulu: k === 0 ? null : YENILEME_KOSULLARI[k as 1 | 2 | 3],
    moduller: k === 0 ? [] : MODULLER[k as 1 | 2 | 3],
  })),
  masterYukumlulugu: MASTER_YUKUMLULUK,
}));

katalogRotalari.get('/ucretler', () => {
  const kurucuDoluluk = tek<{ n: number }>(
    'SELECT COUNT(*) AS n FROM uyeler WHERE kurucu_kohort = 1',
  )?.n ?? 0;
  return {
    sertifikasyon: UCRETLER,
    kurucuKohort: {
      kontenjan: KURUCU_KOHORT_KONTENJANI,
      dolu: kurucuDoluluk,
      kalan: Math.max(0, KURUCU_KOHORT_KONTENJANI - kurucuDoluluk),
    },
    materyalKurallari: ALICI_KURALLARI,
    oyunFiyatlari: OYUNLAR.map((o) => ({ id: o.id, ad: o.ad, fiyat: o.fiyat })),
  };
});

katalogRotalari.get('/gelir-paylasimi', () => ({
  paylasim: PAYLASIM,
  telif: TELIF_ORANLARI,
  not: 'Fasilitatörün kendi kursundan EPNEXUS pay almaz (%0) — Yönetmelik Md. 5.2.',
}));

katalogRotalari.get('/nx', () => ({
  kazanim: NX_KURALLARI,
  rutbeler: RUTBELER,
  harcama: NX_HARCAMA,
  ilkeler: [
    'NX satın alınamaz.',
    'NX üyeler arasında devredilemez.',
    'Sahte rapor tespit edilirse ilgili NX geri alınır.',
    'Rütbe toplam kazanıma, harcanabilir bakiye kazanım eksi harcamaya bakar.',
  ],
}));

katalogRotalari.get('/oyun-atolyesi', () => ({
  juriRubrigi: JURI_RUBRIGI,
  barajlar: TASARIM_BARAJI,
  juriYapisi: JURI_YAPISI,
  olgunlukDuzeyleri: OLGUNLUK_TANIMI,
  hakKatmanlari: HAK_KATMANLARI,
  mekanikler: MEKANIKLER,
}));

katalogRotalari.get('/kurallar', () => ({
  rubrikBoyutlari: RUBRIK_BOYUT_ADLARI,
  yaptirimBasamaklari: BASAMAKLAR,
  dogrudanIptal: DOGRUDAN_IPTAL,
  turnuva: {
    bildirimHaftasi: BILDIRIM_HAFTA,
    masaBasinaHakem: MASA_BASINA_HAKEM,
    raporGun: RAPOR_GUN,
    tieBreakSirasi: ['Buchholz', 'doğrudan karşılaşma', 'çözülen görev kartı', 'kura'],
  },
  talepYonlendirme: {
    yanitSuresiSaat: YANIT_SURESI_SAAT,
    yanitsizSiniri: YANITSIZ_SINIRI,
    dislamaGun: DISLAMA_GUN,
    atamaSirasi: [
      'İlçede aktif Kademe 2/3',
      'Aynı ilçede aktif Kademe 1 (rubrik ≥3,0)',
      'Komşu ilçede aktif Kademe 2/3',
      'İlde aktif fasilitatör',
      'Fasilitatör yoksa EPNEXUS yürütür; bölge Kademe 2 açığı işaretlenir',
    ],
  },
  rozetler: ROZETLER,
  oncelikliUlkeler: ONCELIKLI_ULKELER,
  /**
   * Sistem Kılavuzu § 4 Ay 1 koşulu: SEM protokolü yoksa
   * "MEB'de geçerli" ifadesi kullanılmaz.
   */
  semProtokolu: config.universiteSem,
  sertifikaIfadesi: config.universiteSem
    ? `${config.universiteSem} iş birliğiyle düzenlenmiştir.`
    : 'Bu sertifika EPNEXUS tarafından düzenlenen bir katılım ve yetkinlik belgesidir; MEB denklik/geçerlilik iddiası taşımaz.',
}));
