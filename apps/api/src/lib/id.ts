import { randomUUID, randomBytes } from 'node:crypto';

/** Okunabilir, önekli kimlik: rapor_a1b2c3d4e5f6 */
export function kimlikUret(onek: string): string {
  return `${onek}_${randomBytes(6).toString('hex')}`;
}

export function uuid(): string {
  return randomUUID();
}

export function simdi(): string {
  return new Date().toISOString();
}
