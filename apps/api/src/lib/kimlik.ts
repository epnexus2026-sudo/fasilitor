/**
 * Parola özeti ve oturum jetonu.
 * Bağımlılık eklemeden node:crypto ile scrypt + HMAC imzalı jeton kullanılır.
 */
import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'node:crypto';
import { config } from '../config.ts';
import { calistir, tek } from '../db/index.ts';
import { ApiHatasi } from './hata.ts';

const SCRYPT_N = 16384;
const SCRYPT_r = 8;
const SCRYPT_p = 1;
const ANAHTAR_UZUNLUGU = 64;

export function parolaOzetle(parola: string): string {
  const tuz = randomBytes(16);
  const ozet = scryptSync(parola.normalize('NFKC'), tuz, ANAHTAR_UZUNLUGU, {
    N: SCRYPT_N, r: SCRYPT_r, p: SCRYPT_p,
  });
  return `scrypt$${SCRYPT_N}$${SCRYPT_r}$${SCRYPT_p}$${tuz.toString('base64')}$${ozet.toString('base64')}`;
}

export function parolaDogrula(parola: string, kayit: string): boolean {
  const parcalar = kayit.split('$');
  if (parcalar.length !== 6 || parcalar[0] !== 'scrypt') return false;
  const [, n, r, p, tuzB64, ozetB64] = parcalar;
  const tuz = Buffer.from(tuzB64!, 'base64');
  const beklenen = Buffer.from(ozetB64!, 'base64');
  const hesap = scryptSync(parola.normalize('NFKC'), tuz, beklenen.length, {
    N: Number(n), r: Number(r), p: Number(p),
  });
  return hesap.length === beklenen.length && timingSafeEqual(hesap, beklenen);
}

interface JetonIcerigi {
  uyeId: string;
  jti: string;
  bitis: number;
}

function imzala(govde: string): string {
  return createHmac('sha256', config.gizliAnahtar).update(govde).digest('base64url');
}

export function jetonUret(uyeId: string): { jeton: string; bitis: Date } {
  const jti = randomBytes(12).toString('base64url');
  const bitis = new Date(Date.now() + config.oturumSaati * 3_600_000);
  const icerik: JetonIcerigi = { uyeId, jti, bitis: bitis.getTime() };
  const govde = Buffer.from(JSON.stringify(icerik), 'utf8').toString('base64url');
  calistir(
    'INSERT INTO oturumlar (jti, uye_id, olusturuldu, gecerlilik) VALUES (?,?,?,?)',
    jti, uyeId, new Date().toISOString(), bitis.toISOString(),
  );
  return { jeton: `${govde}.${imzala(govde)}`, bitis };
}

export function jetonCoz(jeton: string): JetonIcerigi {
  const [govde, imza] = jeton.split('.');
  if (!govde || !imza) throw new ApiHatasi(401, 'Geçersiz oturum jetonu.');

  const beklenen = imzala(govde);
  const a = Buffer.from(imza);
  const b = Buffer.from(beklenen);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new ApiHatasi(401, 'Oturum jetonu imzası doğrulanamadı.');
  }

  let icerik: JetonIcerigi;
  try {
    icerik = JSON.parse(Buffer.from(govde, 'base64url').toString('utf8')) as JetonIcerigi;
  } catch {
    throw new ApiHatasi(401, 'Oturum jetonu okunamadı.');
  }
  if (icerik.bitis < Date.now()) throw new ApiHatasi(401, 'Oturumun süresi doldu.');

  const oturum = tek<{ jti: string }>('SELECT jti FROM oturumlar WHERE jti = ?', icerik.jti);
  if (!oturum) throw new ApiHatasi(401, 'Oturum sonlandırılmış.');
  return icerik;
}

export function oturumKapat(jti: string): void {
  calistir('DELETE FROM oturumlar WHERE jti = ?', jti);
}

export function suresiDolmusOturumlariTemizle(): number {
  return calistir('DELETE FROM oturumlar WHERE gecerlilik < ?', new Date().toISOString()).changes;
}
