import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const buDosya = dirname(fileURLToPath(import.meta.url));
export const PROJE_KOKU = resolve(buDosya, '../../..');

function sayi(deger: string | undefined, varsayilan: number): number {
  const n = Number(deger);
  return Number.isFinite(n) && n > 0 ? n : varsayilan;
}

export const config = {
  port: sayi(process.env.PORT, 4000),
  host: process.env.HOST ?? '0.0.0.0',
  dbYolu: process.env.EPNEXUS_DB ?? resolve(PROJE_KOKU, 'data/epnexus.db'),
  webKoku: process.env.EPNEXUS_WEB ?? resolve(PROJE_KOKU, 'apps/web'),
  belgeKoku: resolve(PROJE_KOKU, 'docs'),
  /** Oturum ve sertifika QR imzası için. Üretimde mutlaka ayarlanmalıdır. */
  gizliAnahtar: process.env.EPNEXUS_SECRET ?? 'gelistirme-anahtari-degistirin',
  oturumSaati: sayi(process.env.EPNEXUS_OTURUM_SAAT, 12),
  dogrulamaTabani: process.env.EPNEXUS_DOGRULAMA_TABANI ?? 'https://epnexusgames.com/dogrula',
  issuerId: process.env.EPNEXUS_ISSUER_ID ?? 'https://epnexusgames.com/issuer',
  issuerAd: 'EPNEXUS',
  /**
   * Ay 1 koşulu (Sistem Kılavuzu § 4): Üniversite SEM protokolü imzalanana dek
   * boş kalır. Boşken sertifikada ve sitede "MEB'de geçerli" ifadesi kullanılmaz.
   */
  universiteSem: process.env.EPNEXUS_SEM_PROTOKOLU ?? null,
} as const;

export const uretimMi = process.env.NODE_ENV === 'production';
