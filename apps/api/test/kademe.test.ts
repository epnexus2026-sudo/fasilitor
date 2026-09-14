import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { gecisDegerlendir, altKademe, gecerlilikSonu, GECIS_KOSULLARI, type AdayDurumu } from '../src/domain/kademe.ts';

function aday(ek: Partial<AdayDurumu> = {}): AdayDurumu {
  return {
    kademe: 0, onayliUygulama: 0, turnuvaSayisi: 0, mentorlukSayisi: 0,
    rubrikOrtalamasi: null, kalibrasyonUyumu: null, sinavPuani: null, tasarimPuani: null,
    tamamlananModulSaati: 0, davetVarMi: false, bitirmeA: null, bitirmeB: null, aktifMi: true,
    ...ek,
  };
}

describe('Kademe geçişi — Yönetmelik Md. 3', () => {
  test('Md. 3.2 — K0→K1: 27 sa + %70 sınav + 3 onaylı uygulama + varyant ≥60', () => {
    const tam = aday({
      kademe: 0, tamamlananModulSaati: 27, sinavPuani: 72,
      tasarimPuani: 65, onayliUygulama: 3,
    });
    const s = gecisDegerlendir(tam);
    assert.equal(s.hedef, 1);
    assert.equal(s.uygun, true, JSON.stringify(s.eksikler));
  });

  test('sınav barajının altı geçişi engeller', () => {
    const s = gecisDegerlendir(aday({
      kademe: 0, tamamlananModulSaati: 27, sinavPuani: 69, tasarimPuani: 65, onayliUygulama: 3,
    }));
    assert.equal(s.uygun, false);
    assert.ok(s.eksikler.some((e) => e.alan === 'sinav'));
  });

  test('tasarım barajı (EK-3 ≥60) karşılanmazsa geçiş yok', () => {
    const s = gecisDegerlendir(aday({
      kademe: 0, tamamlananModulSaati: 27, sinavPuani: 90, tasarimPuani: 59, onayliUygulama: 3,
    }));
    assert.equal(s.uygun, false);
    assert.ok(s.eksikler.some((e) => e.alan === 'oyun_tasarimi'));
  });

  test('Md. 3.2 — K1→K2 bitirme projesi A ve B ayrı ayrı ≥70 ister', () => {
    const temel = {
      kademe: 1 as const, tamamlananModulSaati: 18, sinavPuani: 80, tasarimPuani: 75,
      onayliUygulama: 10, turnuvaSayisi: 1, mentorlukSayisi: 1,
      rubrikOrtalamasi: 3.2, kalibrasyonUyumu: 85,
    };
    assert.equal(gecisDegerlendir(aday({ ...temel, bitirmeA: 75, bitirmeB: 75 })).uygun, true);
    const eksikA = gecisDegerlendir(aday({ ...temel, bitirmeA: 60, bitirmeB: 75 }));
    assert.equal(eksikA.uygun, false);
    assert.ok(eksikA.eksikler.some((e) => e.alan === 'bitirme_a'));
  });

  test('Md. 3.2 — K2→K3 yalnız davetle', () => {
    const temel = {
      kademe: 2 as const, tamamlananModulSaati: 59, sinavPuani: 90, tasarimPuani: 85,
      turnuvaSayisi: 2, mentorlukSayisi: 20, kalibrasyonUyumu: 88,
    };
    const davetsiz = gecisDegerlendir(aday({ ...temel, davetVarMi: false }));
    assert.equal(davetsiz.uygun, false);
    assert.ok(davetsiz.eksikler.some((e) => e.alan === 'davet'));
    assert.equal(gecisDegerlendir(aday({ ...temel, davetVarMi: true })).uygun, true);
  });

  test('askıdaki üye kademe atlayamaz', () => {
    const s = gecisDegerlendir(aday({
      kademe: 0, tamamlananModulSaati: 27, sinavPuani: 90, tasarimPuani: 90,
      onayliUygulama: 5, aktifMi: false,
    }));
    assert.equal(s.uygun, false);
    assert.ok(s.eksikler.some((e) => e.alan === 'aktiflik'));
  });

  test('Md. 3.3 — düşüş bir alt kademeye, sıfırlanmaz', () => {
    assert.equal(altKademe(3), 2);
    assert.equal(altKademe(2), 1);
    assert.equal(altKademe(1), 0);
    assert.equal(altKademe(0), 0);
  });

  test('Md. 6.2 — geçerlilik süreleri K1:2 · K2:3 · K3:2 yıl', () => {
    const t = new Date('2026-09-14T00:00:00Z');
    assert.equal(gecerlilikSonu(1, t).toISOString().slice(0, 10), '2028-09-14');
    assert.equal(gecerlilikSonu(2, t).toISOString().slice(0, 10), '2029-09-14');
    assert.equal(gecerlilikSonu(3, t).toISOString().slice(0, 10), '2028-09-14');
  });

  test('Md. 3.2 — sınav barajları %70 / %75 / %85', () => {
    assert.equal(GECIS_KOSULLARI[1].sinavBaraji, 70);
    assert.equal(GECIS_KOSULLARI[2].sinavBaraji, 75);
    assert.equal(GECIS_KOSULLARI[3].sinavBaraji, 85);
    assert.equal(GECIS_KOSULLARI[3].ucret, 0, 'Kademe 3 ücretsizdir (Md. 5.1)');
  });
});
