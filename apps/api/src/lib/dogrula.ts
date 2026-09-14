/**
 * Küçük, bağımlılıksız şema doğrulayıcı.
 * Amaç tam bir şema kütüphanesi değil; uçların beklediği alanları
 * tek yerde, Türkçe hata mesajlarıyla denetlemek.
 */
import { hatalar } from './hata.ts';

export type Denetci<T> = (deger: unknown, alan: string) => T;

export const d = {
  metin(opts: { min?: number; maks?: number; desen?: RegExp; desenAdi?: string } = {}): Denetci<string> {
    return (deger, alan) => {
      if (typeof deger !== 'string') throw hatalar.gecersizIstek(`${alan}: metin bekleniyor.`);
      const v = deger.trim();
      if (opts.min !== undefined && v.length < opts.min)
        throw hatalar.gecersizIstek(`${alan}: en az ${opts.min} karakter olmalı.`);
      if (opts.maks !== undefined && v.length > opts.maks)
        throw hatalar.gecersizIstek(`${alan}: en çok ${opts.maks} karakter olabilir.`);
      if (opts.desen && !opts.desen.test(v))
        throw hatalar.gecersizIstek(`${alan}: ${opts.desenAdi ?? 'biçim'} geçersiz.`);
      return v;
    };
  },
  eposta(): Denetci<string> {
    return d.metin({ min: 5, maks: 200, desen: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, desenAdi: 'e-posta' });
  },
  tamsayi(opts: { min?: number; maks?: number } = {}): Denetci<number> {
    return (deger, alan) => {
      const n = typeof deger === 'string' ? Number(deger) : deger;
      if (typeof n !== 'number' || !Number.isInteger(n))
        throw hatalar.gecersizIstek(`${alan}: tam sayı bekleniyor.`);
      if (opts.min !== undefined && n < opts.min)
        throw hatalar.gecersizIstek(`${alan}: en az ${opts.min} olmalı.`);
      if (opts.maks !== undefined && n > opts.maks)
        throw hatalar.gecersizIstek(`${alan}: en çok ${opts.maks} olabilir.`);
      return n;
    };
  },
  sayi(opts: { min?: number; maks?: number } = {}): Denetci<number> {
    return (deger, alan) => {
      const n = typeof deger === 'string' ? Number(deger) : deger;
      if (typeof n !== 'number' || !Number.isFinite(n))
        throw hatalar.gecersizIstek(`${alan}: sayı bekleniyor.`);
      if (opts.min !== undefined && n < opts.min)
        throw hatalar.gecersizIstek(`${alan}: en az ${opts.min} olmalı.`);
      if (opts.maks !== undefined && n > opts.maks)
        throw hatalar.gecersizIstek(`${alan}: en çok ${opts.maks} olabilir.`);
      return n;
    };
  },
  mantik(): Denetci<boolean> {
    return (deger, alan) => {
      if (typeof deger === 'boolean') return deger;
      if (deger === 'true' || deger === 1) return true;
      if (deger === 'false' || deger === 0) return false;
      throw hatalar.gecersizIstek(`${alan}: doğru/yanlış bekleniyor.`);
    };
  },
  secenek<const T extends readonly string[]>(secenekler: T): Denetci<T[number]> {
    return (deger, alan) => {
      if (typeof deger !== 'string' || !secenekler.includes(deger))
        throw hatalar.gecersizIstek(`${alan}: ${secenekler.join(', ')} değerlerinden biri olmalı.`);
      return deger as T[number];
    };
  },
  tarih(): Denetci<string> {
    return (deger, alan) => {
      if (typeof deger !== 'string') throw hatalar.gecersizIstek(`${alan}: ISO tarih bekleniyor.`);
      const t = new Date(deger);
      if (Number.isNaN(t.getTime())) throw hatalar.gecersizIstek(`${alan}: geçerli bir tarih değil.`);
      return t.toISOString();
    };
  },
  dizi<T>(ic: Denetci<T>, opts: { min?: number; maks?: number } = {}): Denetci<T[]> {
    return (deger, alan) => {
      if (!Array.isArray(deger)) throw hatalar.gecersizIstek(`${alan}: dizi bekleniyor.`);
      if (opts.min !== undefined && deger.length < opts.min)
        throw hatalar.gecersizIstek(`${alan}: en az ${opts.min} öğe olmalı.`);
      if (opts.maks !== undefined && deger.length > opts.maks)
        throw hatalar.gecersizIstek(`${alan}: en çok ${opts.maks} öğe olabilir.`);
      return deger.map((v, i) => ic(v, `${alan}[${i}]`));
    };
  },
  istege_bagli<T>(ic: Denetci<T>): Denetci<T | undefined> {
    return (deger, alan) => (deger === undefined || deger === null || deger === '' ? undefined : ic(deger, alan));
  },
};

export type SemaTipi<S> = { [K in keyof S]: S[K] extends Denetci<infer T> ? T : never };

export function govdeDogrula<S extends Record<string, Denetci<unknown>>>(
  govde: unknown,
  sema: S,
): SemaTipi<S> {
  if (typeof govde !== 'object' || govde === null || Array.isArray(govde)) {
    throw hatalar.gecersizIstek('İstek gövdesi bir nesne olmalı.');
  }
  const kaynak = govde as Record<string, unknown>;
  const sonuc: Record<string, unknown> = {};
  for (const [alan, denetci] of Object.entries(sema)) {
    sonuc[alan] = denetci(kaynak[alan], alan);
  }
  return sonuc as SemaTipi<S>;
}
