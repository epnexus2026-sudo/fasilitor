/**
 * Kademe merdiveni ve geçiş koşulları — Yönetmelik Madde 3.
 * Geri düşme Md. 3.3, yenileme Md. 6.2.
 */
import type { Kademe } from './types.ts';

export interface GecisKosulu {
  hedef: 1 | 2 | 3;
  basvuruSekli: 'serbest' | 'basvuru_secim' | 'davet';
  kontenjan: number | null;
  egitimSaati: number;
  sinavBaraji: number;
  /** Oyun Atölyesi çıktısının jüri rubriği barajı (EK-3, 100 puan). */
  tasarimBaraji: number;
  onOnayliUygulama: number;
  turnuva: number;
  mentorluk: number;
  rubrikOrtalamasi: number | null;
  kalibrasyonUyumu: number | null;
  ucret: number;
}

/** Md. 3.2 geçiş koşulları tablosu + Oyun Atölyesi barajları. */
export const GECIS_KOSULLARI: Record<1 | 2 | 3, GecisKosulu> = {
  1: {
    hedef: 1,
    basvuruSekli: 'serbest',
    kontenjan: null,
    egitimSaati: 27,
    sinavBaraji: 70,
    tasarimBaraji: 60,
    onOnayliUygulama: 3,
    turnuva: 0,
    mentorluk: 0,
    rubrikOrtalamasi: null,
    kalibrasyonUyumu: null,
    ucret: 3900,
  },
  2: {
    hedef: 2,
    basvuruSekli: 'basvuru_secim',
    kontenjan: 30,
    egitimSaati: 18,
    sinavBaraji: 75,
    tasarimBaraji: 70,
    onOnayliUygulama: 10,
    turnuva: 1,
    mentorluk: 1,
    rubrikOrtalamasi: 3.0,
    kalibrasyonUyumu: 80,
    ucret: 6500,
  },
  3: {
    hedef: 3,
    basvuruSekli: 'davet',
    kontenjan: 30,
    egitimSaati: 59,
    sinavBaraji: 85,
    tasarimBaraji: 80,
    onOnayliUygulama: 0,
    turnuva: 2,
    mentorluk: 20,
    rubrikOrtalamasi: null,
    kalibrasyonUyumu: 85,
    ucret: 0,
  },
};

/** Md. 6.2 — geçerlilik süreleri (yıl). */
export const GECERLILIK_YILI: Record<1 | 2 | 3, number> = { 1: 2, 2: 3, 3: 2 };

/** Md. 6.4 — yenileme koşulu karşılanmazsa tanınan ek süre (ay). */
export const EK_SURE_AY = 3;

/** Md. 6.3 — yenileme hatırlatma günleri. */
export const HATIRLATMA_GUNLERI = [90, 30, 7] as const;

export interface AdayDurumu {
  kademe: Kademe;
  onayliUygulama: number;
  turnuvaSayisi: number;
  mentorlukSayisi: number;
  rubrikOrtalamasi: number | null;
  kalibrasyonUyumu: number | null;
  sinavPuani: number | null;
  tasarimPuani: number | null;
  tamamlananModulSaati: number;
  davetVarMi: boolean;
  /** Kademe 2 için: bitirme projesi A (işletme dosyası) ve B (özgün prototip) puanları. */
  bitirmeA: number | null;
  bitirmeB: number | null;
  aktifMi: boolean;
}

export interface EksikKosul {
  alan: string;
  gereken: string;
  mevcut: string;
}

export interface GecisDegerlendirmesi {
  hedef: 1 | 2 | 3;
  uygun: boolean;
  eksikler: EksikKosul[];
  tamamlanmaYuzdesi: number;
}

function ekle(
  eksikler: EksikKosul[],
  kosul: boolean,
  alan: string,
  gereken: string,
  mevcut: string,
): boolean {
  if (!kosul) eksikler.push({ alan, gereken, mevcut });
  return kosul;
}

/**
 * Bir üyenin bir üst kademeye geçiş koşullarını karşılayıp karşılamadığını
 * Md. 3.2 tablosuna göre değerlendirir.
 */
export function gecisDegerlendir(aday: AdayDurumu): GecisDegerlendirmesi {
  const hedef = (aday.kademe + 1) as 1 | 2 | 3 | 4;
  if (hedef > 3) {
    return { hedef: 3, uygun: false, eksikler: [{ alan: 'kademe', gereken: 'Kademe 3 üstü yoktur', mevcut: 'Kademe 3' }], tamamlanmaYuzdesi: 100 };
  }
  const k = GECIS_KOSULLARI[hedef as 1 | 2 | 3];
  const eksikler: EksikKosul[] = [];
  const sonuclar: boolean[] = [];

  sonuclar.push(
    ekle(eksikler, aday.tamamlananModulSaati >= k.egitimSaati, 'egitim',
      `${k.egitimSaati} saat`, `${aday.tamamlananModulSaati} saat`),
  );
  sonuclar.push(
    ekle(eksikler, (aday.sinavPuani ?? -1) >= k.sinavBaraji, 'sinav',
      `≥%${k.sinavBaraji}`, aday.sinavPuani === null ? 'girilmedi' : `%${aday.sinavPuani}`),
  );
  sonuclar.push(
    ekle(eksikler, (aday.tasarimPuani ?? -1) >= k.tasarimBaraji, 'oyun_tasarimi',
      `≥${k.tasarimBaraji}/100`, aday.tasarimPuani === null ? 'teslim edilmedi' : `${aday.tasarimPuani}/100`),
  );
  if (k.onOnayliUygulama > 0) {
    sonuclar.push(
      ekle(eksikler, aday.onayliUygulama >= k.onOnayliUygulama, 'uygulama',
        `${k.onOnayliUygulama} onaylı rapor`, `${aday.onayliUygulama} rapor`),
    );
  }
  if (k.turnuva > 0) {
    sonuclar.push(
      ekle(eksikler, aday.turnuvaSayisi >= k.turnuva, 'turnuva',
        `${k.turnuva} turnuva`, `${aday.turnuvaSayisi} turnuva`),
    );
  }
  if (k.mentorluk > 0) {
    sonuclar.push(
      ekle(eksikler, aday.mentorlukSayisi >= k.mentorluk, 'mentorluk',
        `${k.mentorluk} oturum`, `${aday.mentorlukSayisi} oturum`),
    );
  }
  if (k.rubrikOrtalamasi !== null) {
    sonuclar.push(
      ekle(eksikler, (aday.rubrikOrtalamasi ?? -1) >= k.rubrikOrtalamasi, 'rubrik',
        `≥${k.rubrikOrtalamasi.toFixed(1)}/4`,
        aday.rubrikOrtalamasi === null ? 'veri yok' : aday.rubrikOrtalamasi.toFixed(2)),
    );
  }
  if (k.kalibrasyonUyumu !== null) {
    sonuclar.push(
      ekle(eksikler, (aday.kalibrasyonUyumu ?? -1) >= k.kalibrasyonUyumu, 'kalibrasyon',
        `≥%${k.kalibrasyonUyumu}`,
        aday.kalibrasyonUyumu === null ? 'katılım yok' : `%${aday.kalibrasyonUyumu}`),
    );
  }
  if (hedef === 2) {
    sonuclar.push(ekle(eksikler, (aday.bitirmeA ?? -1) >= 70, 'bitirme_a', '≥70 işletme dosyası',
      aday.bitirmeA === null ? 'teslim edilmedi' : String(aday.bitirmeA)));
    sonuclar.push(ekle(eksikler, (aday.bitirmeB ?? -1) >= 70, 'bitirme_b', '≥70 özgün prototip',
      aday.bitirmeB === null ? 'teslim edilmedi' : String(aday.bitirmeB)));
  }
  if (k.basvuruSekli === 'davet') {
    sonuclar.push(ekle(eksikler, aday.davetVarMi, 'davet', 'EPNEXUS daveti',
      aday.davetVarMi ? 'var' : 'yok'));
  }
  sonuclar.push(ekle(eksikler, aday.aktifMi, 'aktiflik', 'aktif üyelik',
    aday.aktifMi ? 'aktif' : 'pasif/askıda'));

  const saglanan = sonuclar.filter(Boolean).length;
  return {
    hedef: hedef as 1 | 2 | 3,
    uygun: eksikler.length === 0,
    eksikler,
    tamamlanmaYuzdesi: sonuclar.length === 0 ? 100 : Math.round((saglanan / sonuclar.length) * 100),
  };
}

/** Md. 3.3 — sıfırlanmaz, bir alt kademeye düşülür. */
export function altKademe(kademe: Kademe): Kademe {
  return (kademe > 0 ? kademe - 1 : 0) as Kademe;
}

export function gecerlilikSonu(kademe: 1 | 2 | 3, baslangic: Date): Date {
  const d = new Date(baslangic);
  d.setUTCFullYear(d.getUTCFullYear() + GECERLILIK_YILI[kademe]);
  return d;
}
