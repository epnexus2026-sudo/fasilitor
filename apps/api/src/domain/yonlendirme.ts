/**
 * Talep yönlendirme — Yönetmelik Madde 9.
 *
 * Md. 9.1: Ağın üyesine sunduğu en somut ekonomik değer budur.
 * Md. 9.2: Atama sırası ilçe K2/K3 → ilçe K1 (rubrik ≥3,0) → komşu ilçe K2/K3 → il → EPNEXUS.
 * Md. 9.3: Eşitlikte son 90 günde en az talep almış olana (yük dengeleme).
 * Md. 9.4: 48 saat yanıt süresi; üst üste 3 yanıtsız → 90 gün yönlendirme dışı.
 * Md. 9.5: Bir okulla çalışan fasilitatör varsa o okul başkasına yönlendirilmez.
 */
import type { Kademe } from './types.ts';
import { RUBRIK_HEDEF } from './rubrik.ts';

/** Md. 9.4 — atanan fasilitatörün kabul/ret bildirim süresi. */
export const YANIT_SURESI_SAAT = 48;
/** Md. 9.4 — üst üste yanıtsızlık sınırı ve dışlama süresi. */
export const YANITSIZ_SINIRI = 3;
export const DISLAMA_GUN = 90;
/** Md. 9.3 — yük dengeleme penceresi. */
export const YUK_PENCERESI_GUN = 90;

export interface AdayFasilitator {
  uyeId: string;
  adSoyad: string;
  kademe: Kademe;
  il: string;
  ilce: string;
  aktifMi: boolean;
  rubrikOrtalamasi: number | null;
  /** Son 90 günde atanan talep sayısı (Md. 9.3). */
  son90GunTalep: number;
  /** Md. 9.4 — dışlama bitiş tarihi (ISO) ya da null. */
  yonlendirmeDisiBitis: string | null;
  /** Md. 9.5 — fasilitatörün hâlihazırda çalıştığı okullar. */
  mevcutOkullar: readonly string[];
}

export interface Talep {
  id: string;
  il: string;
  ilce: string;
  okulAdi: string | null;
  /** Md. 9.2 adım 3 için: talebin ilçesine komşu ilçeler. */
  komsuIlceler: readonly string[];
}

export type AtamaKurali =
  | 'ilce_k2_k3'
  | 'ilce_k1'
  | 'komsu_ilce_k2_k3'
  | 'il_geneli'
  | 'mevcut_okul_sahibi'
  | 'epnexus';

export interface AtamaSonucu {
  talepId: string;
  atanan: AdayFasilitator | null;
  kural: AtamaKurali;
  /** Md. 9.2 adım 5 — bölge Kademe 2 açığı olarak işaretlenir. */
  kademe2Acigi: boolean;
  gerekce: string;
  /** Md. 9.4 — kabul/ret için son an. */
  yanitSonTarihi: string | null;
  elenenler: Array<{ uyeId: string; sebep: string }>;
}

function uygunMu(a: AdayFasilitator, simdi: Date): { ok: boolean; sebep?: string } {
  if (!a.aktifMi) return { ok: false, sebep: 'Aktif değil (Md. 9.1 — talep yalnız aktif üyeye gider).' };
  if (a.kademe < 1) return { ok: false, sebep: 'Kademe 0 üyeye talep yönlendirilmez.' };
  if (a.yonlendirmeDisiBitis && new Date(a.yonlendirmeDisiBitis) > simdi) {
    return { ok: false, sebep: `Md. 9.4 — ${a.yonlendirmeDisiBitis} tarihine dek yönlendirme dışı.` };
  }
  return { ok: true };
}

/** Md. 9.3 — en az yük, eşitlikte ada göre kararlı sıralama. */
function yukDengele(adaylar: AdayFasilitator[]): AdayFasilitator[] {
  return [...adaylar].sort(
    (a, b) => a.son90GunTalep - b.son90GunTalep || a.uyeId.localeCompare(b.uyeId, 'tr'),
  );
}

function yanitSonTarihi(simdi: Date): string {
  const d = new Date(simdi.getTime() + YANIT_SURESI_SAAT * 3_600_000);
  return d.toISOString();
}

/**
 * Md. 9.2–9.5 atama sırasını uygular ve talebin kime gideceğini döndürür.
 * Saf fonksiyondur; yazma işlemi çağırana aittir.
 */
export function talepAta(
  talep: Talep,
  havuz: readonly AdayFasilitator[],
  simdi: Date = new Date(),
): AtamaSonucu {
  const elenenler: Array<{ uyeId: string; sebep: string }> = [];
  const uygunlar: AdayFasilitator[] = [];

  for (const a of havuz) {
    const u = uygunMu(a, simdi);
    if (!u.ok) elenenler.push({ uyeId: a.uyeId, sebep: u.sebep! });
    else uygunlar.push(a);
  }

  // Md. 9.5 — okul çakışması: o okulla çalışan varsa talep doğrudan ona gider,
  // başka fasilitatöre yönlendirilmez.
  if (talep.okulAdi) {
    const sahip = uygunlar.filter((a) => a.mevcutOkullar.includes(talep.okulAdi!));
    if (sahip.length > 0) {
      const secilen = yukDengele(sahip)[0]!;
      return {
        talepId: talep.id, atanan: secilen, kural: 'mevcut_okul_sahibi', kademe2Acigi: false,
        gerekce: `Md. 9.5 — ${talep.okulAdi} ile hâlihazırda çalışan fasilitatör var; okul başkasına yönlendirilmez.`,
        yanitSonTarihi: yanitSonTarihi(simdi), elenenler,
      };
    }
  }

  const ayniIlce = uygunlar.filter((a) => a.il === talep.il && a.ilce === talep.ilce);
  const komsuIlce = uygunlar.filter(
    (a) => a.il === talep.il && talep.komsuIlceler.includes(a.ilce),
  );
  const ilGeneli = uygunlar.filter((a) => a.il === talep.il);

  const adimlar: Array<{ kural: AtamaKurali; adaylar: AdayFasilitator[]; gerekce: string }> = [
    {
      kural: 'ilce_k2_k3',
      adaylar: ayniIlce.filter((a) => a.kademe >= 2),
      gerekce: 'Md. 9.2/1 — talebin geldiği ilçede aktif Kademe 2/3.',
    },
    {
      kural: 'ilce_k1',
      adaylar: ayniIlce.filter((a) => a.kademe === 1 && (a.rubrikOrtalamasi ?? 0) >= RUBRIK_HEDEF),
      gerekce: 'Md. 9.2/2 — aynı ilçede aktif Kademe 1 (rubrik ≥3,0).',
    },
    {
      kural: 'komsu_ilce_k2_k3',
      adaylar: komsuIlce.filter((a) => a.kademe >= 2),
      gerekce: 'Md. 9.2/3 — komşu ilçede aktif Kademe 2/3.',
    },
    {
      kural: 'il_geneli',
      adaylar: ilGeneli,
      gerekce: 'Md. 9.2/4 — ilde aktif fasilitatör.',
    },
  ];

  for (const adim of adimlar) {
    if (adim.adaylar.length === 0) continue;
    const secilen = yukDengele(adim.adaylar)[0]!;
    return {
      talepId: talep.id, atanan: secilen, kural: adim.kural, kademe2Acigi: false,
      gerekce: adim.gerekce, yanitSonTarihi: yanitSonTarihi(simdi), elenenler,
    };
  }

  // Md. 9.2/5 — fasilitatör yoksa EPNEXUS yürütür, bölge Kademe 2 açığı işaretlenir.
  return {
    talepId: talep.id, atanan: null, kural: 'epnexus', kademe2Acigi: true,
    gerekce: `Md. 9.2/5 — ${talep.il}/${talep.ilce} bölgesinde uygun fasilitatör yok; EPNEXUS doğrudan yürütür ve bölge Kademe 2 açığı olarak işaretlenir.`,
    yanitSonTarihi: null, elenenler,
  };
}

export interface YanitsizlikSonucu {
  yeniSayac: number;
  dislamaBitis: string | null;
  aciklama: string;
}

/** Md. 9.4 — 48 saat içinde yanıt gelmezse talep sıradakine geçer, sayaç artar. */
export function yanitsizlikIsle(
  mevcutSayac: number,
  simdi: Date = new Date(),
): YanitsizlikSonucu {
  const yeni = mevcutSayac + 1;
  if (yeni >= YANITSIZ_SINIRI) {
    const bitis = new Date(simdi);
    bitis.setUTCDate(bitis.getUTCDate() + DISLAMA_GUN);
    return {
      yeniSayac: 0,
      dislamaBitis: bitis.toISOString(),
      aciklama: `Üst üste ${YANITSIZ_SINIRI} yanıtsızlık — ${DISLAMA_GUN} gün yönlendirme dışı (Md. 9.4).`,
    };
  }
  return {
    yeniSayac: yeni,
    dislamaBitis: null,
    aciklama: `Yanıtsız talep sayacı: ${yeni}/${YANITSIZ_SINIRI}.`,
  };
}

/** Talebe yanıt verildiğinde sayaç sıfırlanır. */
export function yanitAlindi(): YanitsizlikSonucu {
  return { yeniSayac: 0, dislamaBitis: null, aciklama: 'Yanıt alındı; sayaç sıfırlandı.' };
}
