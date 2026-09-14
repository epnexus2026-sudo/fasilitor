/**
 * Turnuva ve etkinlik protokolü — Yönetmelik Madde 10.
 *
 * Md. 10.5 standart kurallar: İsviçre sistemi · 2ⁿ ≥ katılımcı tur sayısı ·
 * tie-break sırası Buchholz → doğrudan karşılaşma → çözülen görev kartı → kura ·
 * her 4 masaya 1 hakem · turnuva direktörü aynı anda baş hakem olamaz ·
 * hakem kendi öğrencisinin masasında görev alamaz.
 */
import type { Kademe } from './types.ts';

/** Md. 10.2 — turnuva en az 8 hafta önce bildirilir. */
export const BILDIRIM_HAFTA = 8;
/** Md. 10.7 — bitişten sonra raporlama süresi (gün). */
export const RAPOR_GUN = 10;
/** Md. 10.5 — her 4 masaya 1 hakem. */
export const MASA_BASINA_HAKEM = 4;

export interface TurnuvaBasvurusu {
  duzenleyenKademe: Kademe;
  tarih: Date;
  basvuruTarihi: Date;
  il: string;
  ilce: string;
  beklenenKatilimci: number;
}

export interface BasvuruDegerlendirmesi {
  uygun: boolean;
  hatalar: string[];
  uyarilar: string[];
  turSayisi: number;
  gerekenHakem: number;
  raporSonTarihi: string;
}

/** Md. 10.5 — 2ⁿ ≥ katılımcı olacak en küçük n. */
export function turSayisi(katilimci: number): number {
  if (katilimci <= 1) return 0;
  return Math.ceil(Math.log2(katilimci));
}

export function gerekenHakemSayisi(katilimci: number): number {
  const masa = Math.ceil(katilimci / 2);
  return Math.max(1, Math.ceil(masa / MASA_BASINA_HAKEM));
}

export function basvuruDegerlendir(b: TurnuvaBasvurusu): BasvuruDegerlendirmesi {
  const hatalar: string[] = [];
  const uyarilar: string[] = [];

  // Md. 10.1 — il/ilçe turnuvasını yalnız Kademe 2 ve üzeri düzenleyebilir.
  if (b.duzenleyenKademe < 2) {
    hatalar.push('Md. 10.1 — il/ilçe turnuvasını yalnız Kademe 2 ve üzeri düzenleyebilir.');
  }
  // Md. 10.2 — en az 8 hafta önce bildirim.
  const haftaFarki = (b.tarih.getTime() - b.basvuruTarihi.getTime()) / (7 * 86_400_000);
  if (haftaFarki < BILDIRIM_HAFTA) {
    hatalar.push(
      `Md. 10.2 — turnuva tarihten en az ${BILDIRIM_HAFTA} hafta önce bildirilmelidir (bildirim: ${haftaFarki.toFixed(1)} hafta önce).`,
    );
  }
  if (b.beklenenKatilimci < 8) {
    uyarilar.push('8 kişiden az katılımcıda İsviçre sistemi anlamlı tur üretmez.');
  }

  const raporSon = new Date(b.tarih);
  raporSon.setUTCDate(raporSon.getUTCDate() + RAPOR_GUN);

  return {
    uygun: hatalar.length === 0,
    hatalar,
    uyarilar,
    turSayisi: turSayisi(b.beklenenKatilimci),
    gerekenHakem: gerekenHakemSayisi(b.beklenenKatilimci),
    raporSonTarihi: raporSon.toISOString(),
  };
}

export interface Oyuncu {
  id: string;
  ad: string;
  okul?: string;
  /** Turnuva boyunca toplanan puan (galibiyet 1, beraberlik 0,5). */
  puan: number;
  /** Çözülen görev kartı — üçüncü tie-break ölçütü. */
  gorevKarti: number;
  /** Daha önce eşleştiği rakipler. */
  rakipler: string[];
  /** Bye almış mı (her oyuncu en çok bir kez). */
  byeAldi: boolean;
}

export interface Eslesme {
  masa: number;
  beyaz: string;
  siyah: string | null;
  /** siyah null ise bye. */
}

/**
 * İsviçre sistemi eşleştirmesi (Md. 10.5).
 * Oyuncular puana göre gruplanır; grup içinde daha önce eşleşmemiş
 * ilk uygun rakiple eşleştirilir. Tek sayıda oyuncuda en düşük puanlı
 * ve daha önce bye almamış oyuncu bye alır.
 */
export function isvicreEslestir(oyuncular: readonly Oyuncu[]): Eslesme[] {
  const sirali = [...oyuncular].sort(
    (a, b) => b.puan - a.puan || b.gorevKarti - a.gorevKarti || a.id.localeCompare(b.id, 'tr'),
  );

  const eslesmeler: Eslesme[] = [];
  const kalanlar = [...sirali];

  if (kalanlar.length % 2 === 1) {
    for (let i = kalanlar.length - 1; i >= 0; i--) {
      if (!kalanlar[i]!.byeAldi) {
        const bye = kalanlar.splice(i, 1)[0]!;
        eslesmeler.push({ masa: 0, beyaz: bye.id, siyah: null });
        break;
      }
    }
    // Herkes bye almışsa en düşük puanlı tekrar bye alır.
    if (kalanlar.length % 2 === 1) {
      const bye = kalanlar.pop()!;
      eslesmeler.push({ masa: 0, beyaz: bye.id, siyah: null });
    }
  }

  let masa = 1;
  while (kalanlar.length > 0) {
    const a = kalanlar.shift()!;
    let idx = kalanlar.findIndex((b) => !a.rakipler.includes(b.id));
    if (idx === -1) idx = 0; // Tekrar kaçınılmazsa en yakın puanlıyla eşleştir.
    const b = kalanlar.splice(idx, 1)[0]!;
    eslesmeler.push({ masa: masa++, beyaz: a.id, siyah: b.id });
  }

  // Bye masası en sona.
  return eslesmeler.sort((x, y) => (x.masa === 0 ? 1 : y.masa === 0 ? -1 : x.masa - y.masa));
}

/** Buchholz: oyuncunun karşılaştığı rakiplerin puan toplamı. */
export function buchholz(oyuncu: Oyuncu, hepsi: readonly Oyuncu[]): number {
  const indeks = new Map(hepsi.map((o) => [o.id, o]));
  return oyuncu.rakipler.reduce((s, r) => s + (indeks.get(r)?.puan ?? 0), 0);
}

export interface SiralamaSatiri {
  sira: number;
  oyuncu: Oyuncu;
  buchholz: number;
  tieBreakNotu: string;
}

/**
 * Md. 10.5 tie-break sırası: Buchholz → doğrudan karşılaşma →
 * çözülen görev kartı → kura. Kura, turnuva öncesi ilan edilen
 * sabit tohum (seed) ile deterministik yapılır.
 */
export function siralamaHesapla(
  oyuncular: readonly Oyuncu[],
  dogrudanKarsilasma: ReadonlyMap<string, string> = new Map(),
  kuraTohum = 'EPNEXUS',
): SiralamaSatiri[] {
  const bh = new Map(oyuncular.map((o) => [o.id, buchholz(o, oyuncular)]));

  const kuraDegeri = (id: string): number => {
    let h = 0;
    const s = `${kuraTohum}:${id}`;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  };

  const sirali = [...oyuncular].sort((a, b) => {
    if (b.puan !== a.puan) return b.puan - a.puan;
    const bhFark = bh.get(b.id)! - bh.get(a.id)!;
    if (bhFark !== 0) return bhFark;
    // Doğrudan karşılaşma: harita kazananı id → mağlup id olarak tutar.
    if (dogrudanKarsilasma.get(a.id) === b.id) return -1;
    if (dogrudanKarsilasma.get(b.id) === a.id) return 1;
    if (b.gorevKarti !== a.gorevKarti) return b.gorevKarti - a.gorevKarti;
    return kuraDegeri(a.id) - kuraDegeri(b.id);
  });

  return sirali.map((o, i) => {
    const onceki = sirali[i - 1];
    let not = '—';
    if (onceki && onceki.puan === o.puan) {
      if (bh.get(onceki.id) !== bh.get(o.id)) not = 'Buchholz';
      else if (dogrudanKarsilasma.get(onceki.id) === o.id) not = 'doğrudan karşılaşma';
      else if (onceki.gorevKarti !== o.gorevKarti) not = 'çözülen görev kartı';
      else not = 'kura';
    }
    return { sira: i + 1, oyuncu: o, buchholz: bh.get(o.id)!, tieBreakNotu: not };
  });
}

export interface HakemAtamaKontrolu {
  uygun: boolean;
  hatalar: string[];
}

/** Md. 10.5 — direktör baş hakem olamaz; hakem kendi öğrencisinin masasında görev alamaz. */
export function hakemAtamaKontrol(opts: {
  direktorId: string;
  basHakemId: string;
  atamalar: ReadonlyArray<{ hakemId: string; masa: number; masadakiOgrenciler: readonly string[] }>;
  hakemOgrencileri: ReadonlyMap<string, readonly string[]>;
  katilimciSayisi: number;
}): HakemAtamaKontrolu {
  const hatalar: string[] = [];

  if (opts.direktorId === opts.basHakemId) {
    hatalar.push('Md. 10.5 — turnuva direktörü aynı anda baş hakem olamaz.');
  }
  for (const a of opts.atamalar) {
    const ogrenciler = opts.hakemOgrencileri.get(a.hakemId) ?? [];
    const cakisan = a.masadakiOgrenciler.filter((o) => ogrenciler.includes(o));
    if (cakisan.length > 0) {
      hatalar.push(
        `Md. 10.5 — ${a.hakemId} hakemi ${a.masa} numaralı masada kendi öğrencisiyle görevlendirilemez (${cakisan.join(', ')}).`,
      );
    }
  }
  const gereken = gerekenHakemSayisi(opts.katilimciSayisi);
  const benzersizHakem = new Set(opts.atamalar.map((a) => a.hakemId)).size;
  if (benzersizHakem < gereken) {
    hatalar.push(`Md. 10.5 — her 4 masaya 1 hakem: en az ${gereken} hakem gerekir (atanan: ${benzersizHakem}).`);
  }

  return { uygun: hatalar.length === 0, hatalar };
}
