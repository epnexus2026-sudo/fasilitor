/**
 * Sertifikasyon ücretleri ve materyal fiyatlandırması.
 * Kaynak: Yönetmelik Md. 5.1, 5.3, 5.4 · Md. 12.6 bölgesel bantlar.
 */
import { OYUN_INDEKS, FIYAT_BANTLARI } from '../data/catalog.ts';
import type { AliciTuru, FiyatKademesi } from './types.ts';

export type UcretKalemi =
  | 'k0_uyelik'
  | 'k1_online'
  | 'k1_hibrit'
  | 'k1_kurum_ici'
  | 'k1_ogrenci'
  | 'k1_kurucu_kohort'
  | 'k1_yeniden_katilim'
  | 'k2'
  | 'k3'
  | 'basili_sertifika'
  | 'k1_yenileme'
  | 'k2_yenileme'
  | 'print_and_play'
  | 'olcme_kiti';

/** Md. 5.1 ücret tablosu (₺). */
export const UCRETLER: Record<UcretKalemi, { ad: string; tutar: number }> = {
  k0_uyelik: { ad: 'Kademe 0 üyelik', tutar: 0 },
  k1_online: { ad: 'Kademe 1 — online', tutar: 3900 },
  k1_hibrit: { ad: 'Kademe 1 — hibrit (yüz yüze atölyeli)', tutar: 5400 },
  k1_kurum_ici: { ad: 'Kademe 1 — kurum içi (20 kişiye kadar)', tutar: 48000 },
  k1_ogrenci: { ad: 'Kademe 1 — öğrenci / yeni mezun', tutar: 2600 },
  k1_kurucu_kohort: { ad: 'Kademe 1 — Kurucu Kohort (ilk 50)', tutar: 1950 },
  k1_yeniden_katilim: { ad: 'Kademe 1 — kademe düşmüş üye yeniden katılım', tutar: 2340 },
  k2: { ad: 'Kademe 2', tutar: 6500 },
  k3: { ad: 'Kademe 3 (davetle)', tutar: 0 },
  basili_sertifika: { ad: 'Basılı sertifika + kimlik kartı', tutar: 450 },
  k1_yenileme: { ad: 'Kademe 1 yenileme (2 yılda bir)', tutar: 1200 },
  k2_yenileme: { ad: 'Kademe 2 yenileme (3 yılda bir)', tutar: 1800 },
  print_and_play: { ad: 'Print-and-play PDF (tek oyun)', tutar: 150 },
  olcme_kiti: { ad: 'Ölçme-değerlendirme kiti', tutar: 900 },
};

/** Md. 5.1 — Kurucu Kohort yalnız ilk 50 kişiyle sınırlıdır. */
export const KURUCU_KOHORT_KONTENJANI = 50;

/** Md. 11.2 — Oyuncu rütbesi Kademe 1'de %10 indirim açar. */
export const RUTBE_INDIRIMI: Record<string, number> = {
  kasif: 0,
  oyuncu: 0.1,
  rehber: 0.1,
  usta: 0.1,
  efsane: 0.1,
};

export interface SertifikaUcretiGirdisi {
  kalem: UcretKalemi;
  /** Md. 11.2 rütbe indirimi (yalnız Kademe 1 kalemlerinde uygulanır). */
  rutbeKodu?: string;
  /** Md. 11.3 — 8.000 NX harcandıysa Kademe 2'de %20 indirim. */
  nxIndirimiUygulandi?: boolean;
  /** Kurucu Kohort kaleminde doluluk denetimi için mevcut kayıt sayısı. */
  kurucuKohortDoluluk?: number;
}

export interface UcretSonucu {
  kalem: UcretKalemi;
  ad: string;
  listeFiyati: number;
  indirimler: Array<{ ad: string; tutar: number }>;
  odenecek: number;
  hata?: string;
}

export function sertifikaUcretiHesapla(g: SertifikaUcretiGirdisi): UcretSonucu {
  const t = UCRETLER[g.kalem];
  const indirimler: Array<{ ad: string; tutar: number }> = [];

  if (g.kalem === 'k1_kurucu_kohort') {
    const doluluk = g.kurucuKohortDoluluk ?? 0;
    if (doluluk >= KURUCU_KOHORT_KONTENJANI) {
      return {
        kalem: g.kalem, ad: t.ad, listeFiyati: UCRETLER.k1_online.tutar,
        indirimler: [], odenecek: UCRETLER.k1_online.tutar,
        hata: `Kurucu Kohort kontenjanı doldu (${KURUCU_KOHORT_KONTENJANI}); online fiyat uygulanır.`,
      };
    }
  }

  let tutar = t.tutar;
  const kademe1Kalemi = g.kalem.startsWith('k1_') || g.kalem === 'k1_online';

  if (kademe1Kalemi && g.rutbeKodu) {
    const oran = RUTBE_INDIRIMI[g.rutbeKodu] ?? 0;
    if (oran > 0) {
      const d = Math.round(tutar * oran);
      indirimler.push({ ad: `Rütbe indirimi (%${Math.round(oran * 100)})`, tutar: d });
      tutar -= d;
    }
  }
  if (g.kalem === 'k2' && g.nxIndirimiUygulandi) {
    const d = Math.round(tutar * 0.2);
    indirimler.push({ ad: 'NX karşılığı %20 indirim', tutar: d });
    tutar -= d;
  }

  return { kalem: g.kalem, ad: t.ad, listeFiyati: t.tutar, indirimler, odenecek: Math.max(0, tutar) };
}

/** Md. 5.3 — alıcı türüne göre uygulanan fiyat kademesi ve minimum sipariş. */
export const ALICI_KURALLARI: Record<
  AliciTuru,
  { kademe: FiyatKademesi; minimumAdet: number; ekIndirim: number; ad: string }
> = {
  veli: { kademe: 'perakende', minimumAdet: 1, ekIndirim: 0, ad: 'Veli / bireysel' },
  fasilitator_k1: { kademe: 'perakende', minimumAdet: 1, ekIndirim: 0.15, ad: 'Kademe 1 fasilitatör' },
  fasilitator_k2: { kademe: 'f500', minimumAdet: 5, ekIndirim: 0, ad: 'Kademe 2 fasilitatör' },
  fasilitator_k3: { kademe: 'f500', minimumAdet: 5, ekIndirim: 0, ad: 'Kademe 3 fasilitatör' },
  okul: { kademe: 'f500', minimumAdet: 20, ekIndirim: 0, ad: 'Okul / kurum' },
  bayi: { kademe: 'f1000', minimumAdet: 100, ekIndirim: 0, ad: 'Bayi / kitabevi' },
};

/** Md. 11.2 — Rehber ve üzeri rütbe materyalde ek %5 açar. */
export const RUTBE_MATERYAL_EK: Record<string, number> = {
  kasif: 0, oyuncu: 0, rehber: 0.05, usta: 0.05, efsane: 0.05,
};

export interface SiparisSatiri {
  oyunId: string;
  adet: number;
}

export interface SiparisSatirSonucu {
  oyunId: string;
  oyunAdi: string;
  adet: number;
  birimListe: number;
  birimFiyat: number;
  toplam: number;
}

export interface SiparisSonucu {
  aliciTuru: AliciTuru;
  fiyatKademesi: FiyatKademesi;
  satirlar: SiparisSatirSonucu[];
  araToplam: number;
  nxIndirimi: number;
  genelToplam: number;
  toplamAdet: number;
  uyarilar: string[];
}

function birimFiyat(oyunId: string, kademe: FiyatKademesi): number {
  const oyun = OYUN_INDEKS.get(oyunId);
  if (!oyun) throw new Error(`Bilinmeyen oyun: ${oyunId}`);
  // Perakende = liste (100'lü) fiyatı.
  if (kademe === 'perakende' || kademe === 'f100') return oyun.fiyat.f100;
  return kademe === 'f500' ? oyun.fiyat.f500 : oyun.fiyat.f1000;
}

/**
 * Md. 5.3 — sipariş fiyatlandırması. Minimum sipariş **karma** olabilir
 * (okulda 20 adet, K2/K3'te 5 adet toplam üzerinden denetlenir).
 */
export function siparisHesapla(opts: {
  aliciTuru: AliciTuru;
  satirlar: readonly SiparisSatiri[];
  rutbeKodu?: string;
  /** Md. 11.3 — 3.000 NX karşılığı 500 ₺ indirim kaç kez uygulanıyor. */
  nxIndirimAdedi?: number;
  bant?: keyof typeof FIYAT_BANTLARI;
}): SiparisSonucu {
  const kural = ALICI_KURALLARI[opts.aliciTuru];
  const uyarilar: string[] = [];
  const toplamAdet = opts.satirlar.reduce((s, r) => s + r.adet, 0);

  if (toplamAdet < kural.minimumAdet) {
    uyarilar.push(
      `${kural.ad} için minimum sipariş ${kural.minimumAdet} adettir (girilen: ${toplamAdet}); perakende fiyat uygulandı.`,
    );
  }
  const kademe: FiyatKademesi =
    toplamAdet < kural.minimumAdet ? 'perakende' : kural.kademe;

  const ekIndirim =
    kural.ekIndirim + (opts.rutbeKodu ? (RUTBE_MATERYAL_EK[opts.rutbeKodu] ?? 0) : 0);
  const bantCarpani = opts.bant ? FIYAT_BANTLARI[opts.bant].carpan : 1;

  const satirlar: SiparisSatirSonucu[] = opts.satirlar.map((r) => {
    const oyun = OYUN_INDEKS.get(r.oyunId);
    if (!oyun) throw new Error(`Bilinmeyen oyun: ${r.oyunId}`);
    const liste = birimFiyat(r.oyunId, 'perakende');
    const taban = birimFiyat(r.oyunId, kademe);
    const fiyat = Math.round(taban * (1 - ekIndirim) * bantCarpani);
    return {
      oyunId: r.oyunId, oyunAdi: oyun.ad, adet: r.adet,
      birimListe: liste, birimFiyat: fiyat, toplam: fiyat * r.adet,
    };
  });

  const araToplam = satirlar.reduce((s, r) => s + r.toplam, 0);
  const nxIndirimi = Math.min((opts.nxIndirimAdedi ?? 0) * 500, araToplam);

  return {
    aliciTuru: opts.aliciTuru,
    fiyatKademesi: kademe,
    satirlar,
    araToplam,
    nxIndirimi,
    genelToplam: araToplam - nxIndirimi,
    toplamAdet,
    uyarilar,
  };
}

/** Md. 5.4 — iade politikası. */
export type IadeDurumu = 'tam_iade' | 'devir_hakki' | 'yok';

export function iadeDegerlendir(ilkModulTamamlandiMi: boolean, dahaOnceDevredildiMi: boolean): {
  durum: IadeDurumu;
  aciklama: string;
} {
  if (!ilkModulTamamlandiMi) {
    return { durum: 'tam_iade', aciklama: 'Eğitim başlamadan iptal — tam iade.' };
  }
  if (dahaOnceDevredildiMi) {
    return { durum: 'yok', aciklama: 'Devir hakkı bir kez kullanılabilir; yeniden devredilemez.' };
  }
  return { durum: 'devir_hakki', aciklama: 'İade yok; bir sonraki kohorta devir hakkı verilir (bir kez).' };
}
