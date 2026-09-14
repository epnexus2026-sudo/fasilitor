import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  rutbeHesapla, bakiyeHesapla, nxKazanimDegerlendir, nxHarcamaDegerlendir,
  haftalikSeriNx, NX_KURALLARI, SERI_MAKS_HAFTA, type NxKaydi,
} from '../src/domain/nx.ts';

describe('NX puan sistemi — Yönetmelik Md. 11', () => {
  test('Md. 11.2 rütbe eşikleri', () => {
    assert.equal(rutbeHesapla(0).mevcut.ad, 'Kâşif');
    assert.equal(rutbeHesapla(499).mevcut.ad, 'Kâşif');
    assert.equal(rutbeHesapla(500).mevcut.ad, 'Oyuncu');
    assert.equal(rutbeHesapla(2000).mevcut.ad, 'Rehber');
    assert.equal(rutbeHesapla(6000).mevcut.ad, 'Usta');
    assert.equal(rutbeHesapla(15000).mevcut.ad, 'Efsane');
    assert.equal(rutbeHesapla(99999).sonraki, null);
  });

  test('Md. 11.4 — harcama rütbeyi düşürmez, bakiyeyi düşürür', () => {
    const kayitlar: NxKaydi[] = [
      { eylem: 'uygulama_raporu', anahtar: 'r1', nx: 300, tarih: '2026-01-01T00:00:00Z' },
      { eylem: 'uygulama_raporu', anahtar: 'r2', nx: 300, tarih: '2026-01-02T00:00:00Z' },
      { eylem: 'harcama', anahtar: 'h1', nx: -500, tarih: '2026-01-03T00:00:00Z' },
    ];
    const b = bakiyeHesapla(kayitlar);
    assert.equal(b.toplamKazanim, 600);
    assert.equal(b.toplamHarcama, 500);
    assert.equal(b.bakiye, 100);
    // Rütbe toplam kazanıma bakar: 600 ≥ 500 → Oyuncu.
    assert.equal(b.rutbe.mevcut.ad, 'Oyuncu');
  });

  test('Md. 11.1 — profil tamamlama yalnız bir kez', () => {
    const ctx = { oncekiler: [] as NxKaydi[], simdi: new Date('2026-05-01T09:00:00Z') };
    const ilk = nxKazanimDegerlendir('profil_tamamlama', ctx);
    assert.equal(ilk.kabul && ilk.nx, 50);

    const ikinci = nxKazanimDegerlendir('profil_tamamlama', {
      ...ctx,
      oncekiler: [{ eylem: 'profil_tamamlama', anahtar: null, nx: 50, tarih: '2026-04-01T00:00:00Z' }],
    });
    assert.equal(ikinci.kabul, false);
  });

  test('Md. 11.1 — kaynak indirme günde 3 ile sınırlı', () => {
    const gun = new Date('2026-05-01T15:00:00Z');
    const bugun: NxKaydi[] = Array.from({ length: 3 }, (_, i) => ({
      eylem: 'kaynak_indirme' as const, anahtar: null, nx: 5,
      tarih: `2026-05-01T0${i + 1}:00:00Z`,
    }));
    assert.equal(nxKazanimDegerlendir('kaynak_indirme', { oncekiler: bugun, simdi: gun }).kabul, false);
    // Dünkü indirmeler bugünkü sınırı etkilemez.
    const dun = bugun.map((k) => ({ ...k, tarih: k.tarih.replace('05-01', '04-30') }));
    assert.equal(nxKazanimDegerlendir('kaynak_indirme', { oncekiler: dun, simdi: gun }).kabul, true);
  });

  test('aynı rapora ikinci kez NX yazılamaz', () => {
    const oncekiler: NxKaydi[] = [
      { eylem: 'uygulama_raporu', anahtar: 'rapor_1', nx: 300, tarih: '2026-05-01T00:00:00Z' },
    ];
    const simdi = new Date('2026-05-02T00:00:00Z');
    assert.equal(
      nxKazanimDegerlendir('uygulama_raporu', { oncekiler, simdi, anahtar: 'rapor_1' }).kabul, false,
    );
    assert.equal(
      nxKazanimDegerlendir('uygulama_raporu', { oncekiler, simdi, anahtar: 'rapor_2' }).kabul, true,
    );
  });

  test('Md. 11.1 — haftalık seri 25 × hafta, en çok 8 hafta', () => {
    assert.equal(haftalikSeriNx(0), 0);
    assert.equal(haftalikSeriNx(4), 100);
    assert.equal(haftalikSeriNx(SERI_MAKS_HAFTA), 200);
    assert.equal(haftalikSeriNx(20), 200, 'sınırın üstü kırpılır');
  });

  test('Md. 11.3 — yetersiz bakiyeyle harcama reddedilir', () => {
    assert.equal(nxHarcamaDegerlendir('materyal_indirimi', 2999).kabul, false);
    const ok = nxHarcamaDegerlendir('materyal_indirimi', 3000);
    assert.equal(ok.kabul, true);
    assert.equal(ok.kabul && ok.kalanBakiye, 0);
    assert.equal(nxHarcamaDegerlendir('yok_boyle_bir_kalem', 999999).kabul, false);
  });

  test('onaylı uygulama raporu 300 NX (Md. 11.1 tablosu)', () => {
    assert.equal(NX_KURALLARI.uygulama_raporu.nx, 300);
    assert.equal(NX_KURALLARI.oyun_varyanti.nx, 250);
    assert.equal(NX_KURALLARI.fasilitator_referans.nx, 600);
  });
});
