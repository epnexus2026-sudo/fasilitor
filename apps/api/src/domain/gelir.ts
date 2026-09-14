/**
 * Gelir paylaşımı ve telif hesapları.
 * Kaynak: Yönetmelik Md. 5.2 (paylaşım tablosu), Md. 10.6 (turnuva),
 *         Md. 13.6-13.11 + EK-C (katmanlı fikri mülkiyet modeli), Md. 12.4.
 */
import type { TelifTuru } from './types.ts';

export type GelirKaynagi =
  | 'fasilitator_kursu'
  | 'turnuva'
  | 'okul_lisansi'
  | 'kademe1_egitimi'
  | 'kademe2_egitimi'
  | 'country_lead_egitimi';

export interface PaylasimOrani {
  kaynak: GelirKaynagi;
  ad: string;
  fasilitator: number;
  epnexus: number;
  operasyon: number;
  not: string;
}

/** Md. 5.2 — ağın temel sözleşmesi. */
export const PAYLASIM: Record<GelirKaynagi, PaylasimOrani> = {
  fasilitator_kursu: {
    kaynak: 'fasilitator_kursu', ad: 'Fasilitatörün kendi kursu/atölyesi',
    fasilitator: 1.0, epnexus: 0, operasyon: 0,
    not: 'EPNEXUS pay almaz (Md. 5.2 gerekçesi: denetlenemez, tahsil edilemez, küskünlük üretir).',
  },
  turnuva: {
    kaynak: 'turnuva', ad: 'EPNEXUS Ligi turnuvası',
    fasilitator: 0.4, epnexus: 0.3, operasyon: 0.3,
    not: 'Düzenleyen K2/K3. Zarar hâlinde EPNEXUS payı alınmaz (Md. 10.6).',
  },
  okul_lisansi: {
    kaynak: 'okul_lisansi', ad: 'Okul lisansı yönlendirmesi',
    fasilitator: 0.15, epnexus: 0.85, operasyon: 0,
    not: 'Yönlendirme komisyonu.',
  },
  kademe1_egitimi: {
    kaynak: 'kademe1_egitimi', ad: 'Kademe 1 eğitimi',
    fasilitator: 0.4, epnexus: 0.6, operasyon: 0,
    not: 'Yalnız Kademe 3 (Master) eğitmene ödenir.',
  },
  kademe2_egitimi: {
    kaynak: 'kademe2_egitimi', ad: 'Kademe 2 eğitimi',
    fasilitator: 0, epnexus: 1.0, operasyon: 0,
    not: 'Tamamı EPNEXUS.',
  },
  country_lead_egitimi: {
    kaynak: 'country_lead_egitimi', ad: 'Country Lead eğitim geliri',
    fasilitator: 0.45, epnexus: 0.55, operasyon: 0,
    not: 'Md. 12.4 — %40-50 bandı, ülke sözleşmesiyle belirlenir; varsayılan %45.',
  },
};

export interface PaylasimSonucu {
  kaynak: GelirKaynagi;
  netGelir: number;
  fasilitatorPayi: number;
  epnexusPayi: number;
  operasyonRezervi: number;
  uyarilar: string[];
}

export function gelirPaylas(
  kaynak: GelirKaynagi,
  netGelir: number,
  opts: { duzenleyenKademe?: number; countryLeadOrani?: number } = {},
): PaylasimSonucu {
  const p = PAYLASIM[kaynak];
  const uyarilar: string[] = [];

  // Md. 10.6 — zarar hâlinde EPNEXUS payı alınmaz, zarar düzenleyiciye yüklenmez.
  if (netGelir <= 0) {
    if (kaynak === 'turnuva') {
      uyarilar.push('Zarar hâlinde EPNEXUS payı alınmaz; zarar EPNEXUS ile birlikte değerlendirilir (Md. 10.6).');
    }
    return { kaynak, netGelir, fasilitatorPayi: 0, epnexusPayi: 0, operasyonRezervi: 0, uyarilar };
  }

  // Md. 10.1 — il/ilçe turnuvasını yalnız Kademe 2 ve üzeri düzenleyebilir.
  if (kaynak === 'turnuva' && opts.duzenleyenKademe !== undefined && opts.duzenleyenKademe < 2) {
    uyarilar.push('İl/ilçe turnuvasını yalnız Kademe 2 ve üzeri düzenleyebilir (Md. 10.1).');
  }
  // Md. 4.4 — Kademe 1 eğitimi gelir payı yalnız Master'a ödenir.
  if (kaynak === 'kademe1_egitimi' && opts.duzenleyenKademe !== undefined && opts.duzenleyenKademe < 3) {
    uyarilar.push('Kademe 1 eğitimi gelir payı yalnız Kademe 3 (Master) eğitmene ödenir (Md. 5.2).');
  }

  let fasilitatorOrani = p.fasilitator;
  if (kaynak === 'country_lead_egitimi' && opts.countryLeadOrani !== undefined) {
    const o = opts.countryLeadOrani;
    if (o < 0.4 || o > 0.5) {
      uyarilar.push('Country Lead payı Md. 12.4 uyarınca %40-50 bandında olmalıdır.');
    }
    fasilitatorOrani = Math.min(0.5, Math.max(0.4, o));
  }

  const fasilitatorPayi = Math.round(netGelir * fasilitatorOrani);
  const operasyonRezervi = Math.round(netGelir * p.operasyon);
  const epnexusPayi = netGelir - fasilitatorPayi - operasyonRezervi;

  return { kaynak, netGelir, fasilitatorPayi, epnexusPayi, operasyonRezervi, uyarilar };
}

/** Md. 5.2 / EK-C — telif oranları (net satış üzerinden). */
export const TELIF_ORANLARI: Record<TelifTuru, { oran: number; ad: string; not: string }> = {
  ozgun: { oran: 0.1, ad: 'Özgün tasarım', not: 'Kutuda tasarımcı adı zorunlu.' },
  ortak_gelistirme: { oran: 0.06, ad: 'Ortak geliştirme', not: 'Katkı oranı sözleşmede; ayrıca geliştirme ücreti ödenir.' },
  varyant: { oran: 0.04, ad: 'Varyant', not: 'Mekanik EPNEXUS’a, içerik tasarımcıya aittir.' },
};

export interface TelifSonucu {
  tur: TelifTuru;
  netSatis: number;
  oran: number;
  telif: number;
  epnexusPayi: number;
  manevirHak: string;
}

/**
 * Md. 13.7 Katman 4 — ürünleştirme yalnız EK-C sözleşmesiyle yapılır.
 * Sözleşme yoksa telif hesabı üretilmez; bu kural Md. 13.6 uyarınca değiştirilemez.
 */
export function telifHesapla(
  tur: TelifTuru,
  netSatis: number,
  sozlesmeImzalandiMi: boolean,
  gelistirmeUcreti = 0,
): TelifSonucu | { hata: string } {
  if (!sozlesmeImzalandiMi) {
    return {
      hata:
        'EK-C Oyun Yayın Sözleşmesi imzalanmadan ürünleştirme ve telif hesabı yapılamaz (Md. 13.6).',
    };
  }
  const t = TELIF_ORANLARI[tur];
  const telif = Math.round(netSatis * t.oran) + (tur === 'ortak_gelistirme' ? gelistirmeUcreti : 0);
  return {
    tur,
    netSatis,
    oran: t.oran,
    telif,
    epnexusPayi: netSatis - telif,
    manevirHak: 'Tasarımcının adı türeyen her üründe anılır; bu haktan feragat istenmez (Md. 13.7/5).',
  };
}

/** Md. 13.7 Katman 3 — EPNEXUS'un ilk teklif hakkı süresi (gün). */
export const ILK_TEKLIF_HAKKI_GUN = 90;

export function ilkTeklifSonTarihi(bildirimTarihi: Date): Date {
  const d = new Date(bildirimTarihi);
  d.setUTCDate(d.getUTCDate() + ILK_TEKLIF_HAKKI_GUN);
  return d;
}
