/**
 * Yaptırım basamakları ve doğrudan iptal halleri.
 * Kaynak: Yönetmelik Md. 8 (basamaklar), Md. 6.4 (askı/iptal), Md. 14 (itiraz).
 */
import type { Kademe, UyeDurumu } from './types.ts';
import { altKademe } from './kademe.ts';

export type YaptirimBasamagi =
  | 'gorusme'
  | 'yazili_uyari'
  | 'mentor_atamasi'
  | 'aski'
  | 'kademe_dususu'
  | 'iptal';

export interface BasamakTanimi {
  basamak: YaptirimBasamagi;
  sira: number;
  ad: string;
  neZaman: string;
  uygulayan: string;
  sonuc: string;
  /** Md. 8.1 — 2. basamaktan itibaren yazılı bildirim + 10 iş günü savunma. */
  savunmaHakki: boolean;
  dosyayaIslenir: boolean;
}

export const BASAMAKLAR: Record<YaptirimBasamagi, BasamakTanimi> = {
  gorusme: {
    basamak: 'gorusme', sira: 1, ad: 'Görüşme',
    neZaman: 'İlk performans düşüşü veya küçük ihlal',
    uygulayan: 'Mentor (K2)', sonuc: 'Kayıtsız, gelişim odaklı',
    savunmaHakki: false, dosyayaIslenir: false,
  },
  yazili_uyari: {
    basamak: 'yazili_uyari', sira: 2, ad: 'Yazılı uyarı',
    neZaman: 'Tekrar veya marka ihlali',
    uygulayan: 'EPNEXUS', sonuc: 'Dosyaya işlenir',
    savunmaHakki: true, dosyayaIslenir: true,
  },
  mentor_atamasi: {
    basamak: 'mentor_atamasi', sira: 3, ad: 'Mentor ataması',
    neZaman: 'Rubrik veya geri bildirim eşiği altı',
    uygulayan: 'K3', sonuc: 'Zorunlu, 3 ay',
    savunmaHakki: true, dosyayaIslenir: true,
  },
  aski: {
    basamak: 'aski', sira: 4, ad: 'Askı (3-6 ay)',
    neZaman: 'Uyarıya rağmen devam',
    uygulayan: 'EPNEXUS', sonuc: 'Unvan ve haklar donar, dizinden çıkarılır',
    savunmaHakki: true, dosyayaIslenir: true,
  },
  kademe_dususu: {
    basamak: 'kademe_dususu', sira: 5, ad: 'Kademe düşüşü',
    neZaman: 'Yenileme veya yükümlülük karşılanmadı',
    uygulayan: 'Sistem + EPNEXUS', sonuc: 'Bir alt kademe',
    savunmaHakki: true, dosyayaIslenir: true,
  },
  iptal: {
    basamak: 'iptal', sira: 6, ad: 'İptal',
    neZaman: "Md. 6.4'teki doğrudan iptal halleri",
    uygulayan: 'EPNEXUS', sonuc: 'Unvan geri alınır, dizinden silinir',
    savunmaHakki: true, dosyayaIslenir: true,
  },
};

/** Md. 6.4 — savunma beklenmeden uygulanan doğrudan iptal sebepleri. */
export type DogrudanIptalSebebi = 'uydurma_veri' | 'kvkk_fotograf' | 'cocuk_guvenligi';

export const DOGRUDAN_IPTAL: Record<DogrudanIptalSebebi, { ad: string; kalici: boolean; yasalBildirim: boolean }> = {
  uydurma_veri: { ad: 'Yapılmamış uygulamanın raporlanması', kalici: false, yasalBildirim: false },
  kvkk_fotograf: { ad: 'Fotoğraf/KVKK politikası ihlali', kalici: false, yasalBildirim: false },
  cocuk_guvenligi: { ad: 'Çocuk güvenliğiyle ilgili ihlal', kalici: true, yasalBildirim: true },
};

/** Md. 8.1 — savunma süresi (iş günü). */
export const SAVUNMA_IS_GUNU = 10;
/** Md. 14.2 — yaptırıma itiraz kararı bildirim süresi (iş günü). */
export const ITIRAZ_KARAR_IS_GUNU = 15;
/** Md. 7.4 — şikâyet sonuçlandırma süresi (iş günü). */
export const SIKAYET_IS_GUNU = 10;

export interface YaptirimSonucu {
  yeniDurum: UyeDurumu;
  yeniKademe: Kademe;
  savunmaSonuTarihi: string | null;
  dizindenCikar: boolean;
  aciklama: string;
}

function isGunuEkle(baslangic: Date, isGunu: number): Date {
  const d = new Date(baslangic);
  let kalan = isGunu;
  while (kalan > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    const gun = d.getUTCDay();
    if (gun !== 0 && gun !== 6) kalan--;
  }
  return d;
}

/** Bir yaptırım basamağının üyenin durumuna etkisini hesaplar. */
export function yaptirimUygula(
  basamak: YaptirimBasamagi,
  mevcutKademe: Kademe,
  simdi: Date,
): YaptirimSonucu {
  const t = BASAMAKLAR[basamak];
  const savunmaSonu = t.savunmaHakki ? isGunuEkle(simdi, SAVUNMA_IS_GUNU).toISOString() : null;

  switch (basamak) {
    case 'aski':
      return { yeniDurum: 'askida', yeniKademe: mevcutKademe, savunmaSonuTarihi: savunmaSonu, dizindenCikar: true, aciklama: t.sonuc };
    case 'kademe_dususu':
      return { yeniDurum: 'aktif', yeniKademe: altKademe(mevcutKademe), savunmaSonuTarihi: savunmaSonu, dizindenCikar: false, aciklama: t.sonuc };
    case 'iptal':
      return { yeniDurum: 'iptal', yeniKademe: 0, savunmaSonuTarihi: savunmaSonu, dizindenCikar: true, aciklama: t.sonuc };
    default:
      return { yeniDurum: 'aktif', yeniKademe: mevcutKademe, savunmaSonuTarihi: savunmaSonu, dizindenCikar: false, aciklama: t.sonuc };
  }
}

/**
 * Md. 6.4 — doğrudan iptal. Savunma karardan **sonra** itiraz yoluyla alınır
 * (Md. 8.1 son cümle), bu yüzden karar anında uygulanır.
 */
export function dogrudanIptal(sebep: DogrudanIptalSebebi, simdi: Date): YaptirimSonucu {
  const t = DOGRUDAN_IPTAL[sebep];
  return {
    yeniDurum: 'iptal',
    yeniKademe: 0,
    savunmaSonuTarihi: isGunuEkle(simdi, SAVUNMA_IS_GUNU).toISOString(),
    dizindenCikar: true,
    aciklama: t.kalici ? `${t.ad} — kalıcı iptal` : t.ad,
  };
}

/** Md. 3.3 — Kademe 1'ini kaybeden üye bir sonraki kohorta %40 indirimle katılabilir. */
export const KADEME_DUSMUS_INDIRIMI = 0.4;
