import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../config.ts';

const buDizin = dirname(fileURLToPath(import.meta.url));

export type Satir = Record<string, unknown>;

let _db: DatabaseSync | null = null;

export function veritabaniAc(yol: string = config.dbYolu): DatabaseSync {
  if (yol !== ':memory:') mkdirSync(dirname(yol), { recursive: true });
  const db = new DatabaseSync(yol);
  db.exec('PRAGMA foreign_keys = ON;');
  const sema = readFileSync(resolve(buDizin, 'schema.sql'), 'utf8');
  db.exec(sema);
  return db;
}

export function db(): DatabaseSync {
  if (!_db) _db = veritabaniAc();
  return _db;
}

export function dbAyarla(yeni: DatabaseSync): void {
  _db = yeni;
}

export function tumu<T = Satir>(sql: string, ...params: unknown[]): T[] {
  return db().prepare(sql).all(...(params as never[])) as T[];
}

export function tek<T = Satir>(sql: string, ...params: unknown[]): T | null {
  const r = db().prepare(sql).get(...(params as never[]));
  return (r as T) ?? null;
}

export function calistir(sql: string, ...params: unknown[]): { changes: number; lastInsertRowid: number } {
  const r = db().prepare(sql).run(...(params as never[]));
  return { changes: Number(r.changes), lastInsertRowid: Number(r.lastInsertRowid) };
}

/** Basit işlem sarmalayıcı; hata hâlinde geri alır. */
export function islem<T>(fn: () => T): T {
  const d = db();
  d.exec('BEGIN');
  try {
    const sonuc = fn();
    d.exec('COMMIT');
    return sonuc;
  } catch (e) {
    d.exec('ROLLBACK');
    throw e;
  }
}

export function denetimYaz(aktorId: string | null, eylem: string, hedef: string | null, detay?: unknown): void {
  calistir(
    'INSERT INTO denetim_kaydi (aktor_id, eylem, hedef, detay, tarih) VALUES (?,?,?,?,?)',
    aktorId, eylem, hedef, detay === undefined ? null : JSON.stringify(detay), new Date().toISOString(),
  );
}
