/**
 * EPNEXUS Ligi — Yönetmelik Md. 11.5.
 * 30 kişilik lig grupları · her ay ilk 5 yükselir, son 5 düşer ·
 * il ve okul bazlı ayrı tablolar · mutlak ulusal sıralama üyeye gösterilmez.
 */

export const LIG_BOYUTU = 30;
export const YUKSELEN = 5;
export const DUSEN = 5;

export interface LigUyesi {
  uyeId: string;
  adSoyad: string;
  il: string;
  okul: string | null;
  /** Dönem içinde kazanılan NX. */
  donemNx: number;
}

export interface LigGrubu {
  seviye: number;
  ad: string;
  uyeler: LigUyesi[];
}

const SEVIYE_ADLARI = ['Elmas', 'Altın', 'Gümüş', 'Bronz', 'Demir'];

export function seviyeAdi(seviye: number): string {
  return SEVIYE_ADLARI[seviye] ?? `Lig ${seviye + 1}`;
}

/** Üyeleri dönem NX'ine göre 30 kişilik gruplara böler. */
export function ligOlustur(uyeler: readonly LigUyesi[]): LigGrubu[] {
  const sirali = [...uyeler].sort(
    (a, b) => b.donemNx - a.donemNx || a.uyeId.localeCompare(b.uyeId, 'tr'),
  );
  const gruplar: LigGrubu[] = [];
  for (let i = 0; i < sirali.length; i += LIG_BOYUTU) {
    const seviye = gruplar.length;
    gruplar.push({ seviye, ad: seviyeAdi(seviye), uyeler: sirali.slice(i, i + LIG_BOYUTU) });
  }
  return gruplar;
}

export interface AySonuSonucu {
  gruplar: LigGrubu[];
  hareketler: Array<{ uyeId: string; yon: 'yukseldi' | 'dustu'; eskiSeviye: number; yeniSeviye: number }>;
}

/** Ay sonu: her grupta ilk 5 bir üst seviyeye, son 5 bir alt seviyeye taşınır. */
export function ayKapanisi(gruplar: readonly LigGrubu[]): AySonuSonucu {
  const hareketler: AySonuSonucu['hareketler'] = [];
  const yeniIcerik: LigUyesi[][] = gruplar.map(() => []);

  gruplar.forEach((grup, seviye) => {
    const sirali = [...grup.uyeler].sort(
      (a, b) => b.donemNx - a.donemNx || a.uyeId.localeCompare(b.uyeId, 'tr'),
    );
    sirali.forEach((uye, idx) => {
      const ustSeviyeVar = seviye > 0;
      const altSeviyeVar = seviye < gruplar.length - 1;
      if (idx < YUKSELEN && ustSeviyeVar) {
        yeniIcerik[seviye - 1]!.push(uye);
        hareketler.push({ uyeId: uye.uyeId, yon: 'yukseldi', eskiSeviye: seviye, yeniSeviye: seviye - 1 });
      } else if (idx >= sirali.length - DUSEN && altSeviyeVar) {
        yeniIcerik[seviye + 1]!.push(uye);
        hareketler.push({ uyeId: uye.uyeId, yon: 'dustu', eskiSeviye: seviye, yeniSeviye: seviye + 1 });
      } else {
        yeniIcerik[seviye]!.push(uye);
      }
    });
  });

  return {
    gruplar: yeniIcerik.map((uyeler, seviye) => ({
      seviye,
      ad: seviyeAdi(seviye),
      uyeler: uyeler.sort((a, b) => b.donemNx - a.donemNx),
    })),
    hareketler,
  };
}

export type TabloTuru = 'il' | 'okul' | 'lig';

export interface TabloSatiri {
  sira: number;
  ad: string;
  altBilgi: string;
  nx: number;
  benMiyim: boolean;
}

/**
 * Md. 11.5 — il ve okul bazlı tablolar tutulur; **mutlak ulusal sıralama
 * üyeye gösterilmez**, bu yüzden 'lig' tablosu yalnız üyenin kendi grubunu döndürür.
 */
export function tabloUret(
  tur: TabloTuru,
  uyeler: readonly LigUyesi[],
  benimId: string,
  limit = 20,
): TabloSatiri[] {
  if (tur === 'okul') {
    const okullar = new Map<string, { nx: number; adet: number }>();
    for (const u of uyeler) {
      if (!u.okul) continue;
      const mevcut = okullar.get(u.okul) ?? { nx: 0, adet: 0 };
      okullar.set(u.okul, { nx: mevcut.nx + u.donemNx, adet: mevcut.adet + 1 });
    }
    const benimOkul = uyeler.find((u) => u.uyeId === benimId)?.okul ?? null;
    return [...okullar.entries()]
      .sort((a, b) => b[1].nx - a[1].nx)
      .slice(0, limit)
      .map(([ad, v], i) => ({
        sira: i + 1, ad, altBilgi: `${v.adet} fasilitatör`, nx: v.nx, benMiyim: ad === benimOkul,
      }));
  }

  let havuz = [...uyeler];
  if (tur === 'il') {
    const benimIl = uyeler.find((u) => u.uyeId === benimId)?.il;
    if (benimIl) havuz = havuz.filter((u) => u.il === benimIl);
  }
  return havuz
    .sort((a, b) => b.donemNx - a.donemNx || a.uyeId.localeCompare(b.uyeId, 'tr'))
    .slice(0, limit)
    .map((u, i) => ({
      sira: i + 1, ad: u.adSoyad, altBilgi: u.il, nx: u.donemNx, benMiyim: u.uyeId === benimId,
    }));
}
