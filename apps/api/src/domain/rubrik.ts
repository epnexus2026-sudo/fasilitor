/**
 * EPNEXUS Kazanım Gözlem Rubriği ve kalite eşikleri.
 * Kaynak: Yönetmelik Md. 7.2, 7.3 · Md. 6.4 rubrik askı kuralı.
 */
import { RUBRIK_BOYUTLARI, type RubrikPuani } from './types.ts';

/** Rubrik 4 boyut × 4 düzey: her boyut 1–4 arası tam sayı. */
export const RUBRIK_MIN = 1;
export const RUBRIK_MAKS = 4;

/** Md. 3.2 / 4.2 — sürdürülmesi gereken rubrik ortalaması. */
export const RUBRIK_HEDEF = 3.0;

/** Md. 6.4 — üst üste 3 uygulamada bu eşiğin altı mentor ataması tetikler. */
export const RUBRIK_ASKI_ESIGI = 2.5;
export const RUBRIK_ASKI_ARDISIK = 3;

export function rubrikGecerliMi(p: RubrikPuani): boolean {
  return RUBRIK_BOYUTLARI.every((b) => {
    const v = p[b];
    return Number.isInteger(v) && v >= RUBRIK_MIN && v <= RUBRIK_MAKS;
  });
}

export function rubrikOrtalamasi(p: RubrikPuani): number {
  const toplam = RUBRIK_BOYUTLARI.reduce((s, b) => s + p[b], 0);
  return toplam / RUBRIK_BOYUTLARI.length;
}

export function rubrikOrtalamasiCok(puanlar: readonly RubrikPuani[]): number | null {
  if (puanlar.length === 0) return null;
  const t = puanlar.reduce((s, p) => s + rubrikOrtalamasi(p), 0);
  return t / puanlar.length;
}

export type KaliteIslemi = 'yok' | 'mentor_onerisi' | 'mentor_atamasi' | 'aski_degerlendirmesi';

/** Md. 7.3 — öğrenci/veli geri bildirim ortalamasına (5 üzerinden) bağlı işlem. */
export function geriBildirimIslemi(ortalama: number): KaliteIslemi {
  if (ortalama >= 4.0) return 'yok';
  if (ortalama >= 3.5) return 'mentor_onerisi';
  if (ortalama >= 3.0) return 'mentor_atamasi';
  return 'aski_degerlendirmesi';
}

/**
 * Md. 6.4 — son raporlar (yeniden eskiye) üst üste 3 kez <2,5 ise
 * mentor ataması zorunludur; düzelmezse askı değerlendirmesine gider.
 */
export function ardisikDusukRubrik(sonRubrikler: readonly RubrikPuani[]): boolean {
  if (sonRubrikler.length < RUBRIK_ASKI_ARDISIK) return false;
  return sonRubrikler
    .slice(0, RUBRIK_ASKI_ARDISIK)
    .every((p) => rubrikOrtalamasi(p) < RUBRIK_ASKI_ESIGI);
}
