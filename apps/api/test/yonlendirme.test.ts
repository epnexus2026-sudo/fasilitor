import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  talepAta, yanitsizlikIsle, yanitAlindi, YANITSIZ_SINIRI, DISLAMA_GUN,
  type AdayFasilitator, type Talep,
} from '../src/domain/yonlendirme.ts';

const SIMDI = new Date('2026-09-14T12:00:00Z');

function f(ek: Partial<AdayFasilitator> & { uyeId: string }): AdayFasilitator {
  return {
    adSoyad: ek.uyeId, kademe: 1, il: 'Sakarya', ilce: 'Adapazarı', aktifMi: true,
    rubrikOrtalamasi: 3.5, son90GunTalep: 0, yonlendirmeDisiBitis: null, mevcutOkullar: [],
    ...ek,
  };
}

const talep: Talep = {
  id: 't1', il: 'Sakarya', ilce: 'Adapazarı', okulAdi: 'Adapazarı Ortaokulu',
  komsuIlceler: ['Serdivan', 'Erenler'],
};

describe('Talep yönlendirme — Yönetmelik Md. 9', () => {
  test('Md. 9.2/1 — ilçedeki Kademe 2/3 önceliklidir', () => {
    const s = talepAta(talep, [
      f({ uyeId: 'k1', kademe: 1 }),
      f({ uyeId: 'k2', kademe: 2 }),
    ], SIMDI);
    assert.equal(s.kural, 'ilce_k2_k3');
    assert.equal(s.atanan?.uyeId, 'k2');
  });

  test('Md. 9.2/2 — ilçede K1 yalnız rubrik ≥3,0 ise atanır', () => {
    const dusuk = talepAta(talep, [f({ uyeId: 'zayif', kademe: 1, rubrikOrtalamasi: 2.9 })], SIMDI);
    assert.equal(dusuk.kural, 'il_geneli', 'rubrik eşiğini geçemeyen K1, adım 2’de atanmaz');

    const yeterli = talepAta(talep, [f({ uyeId: 'iyi', kademe: 1, rubrikOrtalamasi: 3.0 })], SIMDI);
    assert.equal(yeterli.kural, 'ilce_k1');
  });

  test('Md. 9.2/3 — komşu ilçedeki K2, ildeki diğerlerinden önce gelir', () => {
    const s = talepAta(talep, [
      f({ uyeId: 'komsu_k2', kademe: 2, ilce: 'Serdivan' }),
      f({ uyeId: 'uzak_k2', kademe: 2, ilce: 'Karasu' }),
    ], SIMDI);
    assert.equal(s.kural, 'komsu_ilce_k2_k3');
    assert.equal(s.atanan?.uyeId, 'komsu_k2');
  });

  test('Md. 9.2/5 — fasilitatör yoksa EPNEXUS yürütür, K2 açığı işaretlenir', () => {
    const s = talepAta({ ...talep, il: 'Van', ilce: 'İpekyolu' }, [f({ uyeId: 'a' })], SIMDI);
    assert.equal(s.kural, 'epnexus');
    assert.equal(s.atanan, null);
    assert.equal(s.kademe2Acigi, true);
  });

  test('Md. 9.3 — eşitlikte son 90 günde en az talep alan seçilir', () => {
    const s = talepAta(talep, [
      f({ uyeId: 'yuklu', kademe: 2, son90GunTalep: 7 }),
      f({ uyeId: 'bos', kademe: 2, son90GunTalep: 1 }),
    ], SIMDI);
    assert.equal(s.atanan?.uyeId, 'bos');
  });

  test('Md. 9.5 — okulla çalışan fasilitatör varsa okul başkasına gitmez', () => {
    const s = talepAta(talep, [
      f({ uyeId: 'yeni_k2', kademe: 2 }),
      f({ uyeId: 'okul_sahibi', kademe: 1, mevcutOkullar: ['Adapazarı Ortaokulu'] }),
    ], SIMDI);
    assert.equal(s.kural, 'mevcut_okul_sahibi');
    assert.equal(s.atanan?.uyeId, 'okul_sahibi');
  });

  test('pasif, askıdaki ve yönlendirme dışı üyeler elenir', () => {
    const s = talepAta(talep, [
      f({ uyeId: 'pasif', kademe: 2, aktifMi: false }),
      f({ uyeId: 'disarida', kademe: 2, yonlendirmeDisiBitis: '2026-12-01T00:00:00Z' }),
      f({ uyeId: 'kasif', kademe: 0 }),
      f({ uyeId: 'uygun', kademe: 2 }),
    ], SIMDI);
    assert.equal(s.atanan?.uyeId, 'uygun');
    assert.equal(s.elenenler.length, 3);
  });

  test('Md. 9.4 — 48 saatlik yanıt süresi hesaplanır', () => {
    const s = talepAta(talep, [f({ uyeId: 'k2', kademe: 2 })], SIMDI);
    assert.equal(s.yanitSonTarihi, '2026-09-16T12:00:00.000Z');
  });

  test('Md. 9.4 — üst üste 3 yanıtsızlık 90 gün dışlama getirir', () => {
    assert.equal(yanitsizlikIsle(0, SIMDI).dislamaBitis, null);
    assert.equal(yanitsizlikIsle(1, SIMDI).yeniSayac, 2);

    const ucuncu = yanitsizlikIsle(YANITSIZ_SINIRI - 1, SIMDI);
    assert.ok(ucuncu.dislamaBitis);
    const bitis = new Date(ucuncu.dislamaBitis!);
    assert.equal(Math.round((bitis.getTime() - SIMDI.getTime()) / 86_400_000), DISLAMA_GUN);
    assert.equal(ucuncu.yeniSayac, 0);

    assert.equal(yanitAlindi().yeniSayac, 0);
  });
});
