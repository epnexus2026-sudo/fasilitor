import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  basvuruDegerlendir, turSayisi, gerekenHakemSayisi, isvicreEslestir,
  siralamaHesapla, buchholz, hakemAtamaKontrol, BILDIRIM_HAFTA, type Oyuncu,
} from '../src/domain/turnuva.ts';
import { gelirPaylas } from '../src/domain/gelir.ts';

function o(id: string, puan: number, kart = 0, rakipler: string[] = [], byeAldi = false): Oyuncu {
  return { id, ad: id, puan, gorevKarti: kart, rakipler, byeAldi };
}

describe('Turnuva protokolü — Yönetmelik Md. 10', () => {
  test('Md. 10.5 — tur sayısı 2ⁿ ≥ katılımcı', () => {
    assert.equal(turSayisi(8), 3);
    assert.equal(turSayisi(9), 4);
    assert.equal(turSayisi(16), 4);
    assert.equal(turSayisi(32), 5);
    assert.equal(turSayisi(48), 6);
  });

  test('Md. 10.5 — her 4 masaya 1 hakem', () => {
    assert.equal(gerekenHakemSayisi(8), 1);   // 4 masa
    assert.equal(gerekenHakemSayisi(16), 2);  // 8 masa
    assert.equal(gerekenHakemSayisi(48), 6);  // 24 masa
  });

  test('Md. 10.1 — Kademe 1 il/ilçe turnuvası düzenleyemez', () => {
    const s = basvuruDegerlendir({
      duzenleyenKademe: 1, tarih: new Date('2026-12-01'), basvuruTarihi: new Date('2026-09-01'),
      il: 'Sakarya', ilce: 'Adapazarı', beklenenKatilimci: 32,
    });
    assert.equal(s.uygun, false);
    assert.ok(s.hatalar.some((h) => h.includes('Md. 10.1')));
  });

  test(`Md. 10.2 — en az ${BILDIRIM_HAFTA} hafta önce bildirim`, () => {
    const gec = basvuruDegerlendir({
      duzenleyenKademe: 2, tarih: new Date('2026-10-01'), basvuruTarihi: new Date('2026-09-14'),
      il: 'Sakarya', ilce: 'Adapazarı', beklenenKatilimci: 32,
    });
    assert.equal(gec.uygun, false);

    const zamaninda = basvuruDegerlendir({
      duzenleyenKademe: 2, tarih: new Date('2026-12-01'), basvuruTarihi: new Date('2026-09-14'),
      il: 'Sakarya', ilce: 'Adapazarı', beklenenKatilimci: 32,
    });
    assert.equal(zamaninda.uygun, true);
    assert.equal(zamaninda.turSayisi, 5);
    // Md. 10.7 — bitişten 10 gün sonra rapor son tarihi.
    assert.equal(zamaninda.raporSonTarihi.slice(0, 10), '2026-12-11');
  });

  test('İsviçre eşleştirmesi aynı rakibi tekrar eşleştirmemeye çalışır', () => {
    const oyuncular = [
      o('A', 2, 0, ['B']), o('B', 2, 0, ['A']),
      o('C', 1, 0, ['D']), o('D', 1, 0, ['C']),
    ];
    const es = isvicreEslestir(oyuncular);
    assert.equal(es.length, 2);
    for (const e of es) {
      const beyaz = oyuncular.find((x) => x.id === e.beyaz)!;
      assert.ok(!beyaz.rakipler.includes(e.siyah!), `${e.beyaz} ile ${e.siyah} tekrar eşleşti`);
    }
  });

  test('tek sayıda oyuncuda bye, daha önce bye almamışa verilir', () => {
    const oyuncular = [o('A', 3), o('B', 2), o('C', 1, 0, [], true)];
    const es = isvicreEslestir(oyuncular);
    const bye = es.find((e) => e.siyah === null);
    assert.ok(bye);
    assert.notEqual(bye!.beyaz, 'C', 'C zaten bye almıştı');
    assert.equal(bye!.beyaz, 'B', 'en düşük puanlı, bye almamış oyuncu');
  });

  test('Buchholz = rakiplerin puan toplamı', () => {
    const hepsi = [o('A', 2, 0, ['B', 'C']), o('B', 1.5), o('C', 0.5)];
    assert.equal(buchholz(hepsi[0]!, hepsi), 2);
  });

  test('Md. 10.5 tie-break sırası: Buchholz → doğrudan karşılaşma → görev kartı → kura', () => {
    // Eşit puan, farklı Buchholz.
    const bh = siralamaHesapla([
      o('X', 2, 5, ['güçlü']), o('Y', 2, 9, ['zayıf']),
      o('güçlü', 3), o('zayıf', 0),
    ]);
    const xy = bh.filter((s) => ['X', 'Y'].includes(s.oyuncu.id));
    assert.equal(xy[0]!.oyuncu.id, 'X', 'daha yüksek Buchholz öne geçer');
    assert.equal(xy[0]!.buchholz, 3);

    // Eşit puan ve Buchholz, doğrudan karşılaşma belirleyici.
    const dk = siralamaHesapla(
      [o('P', 2, 3, ['Q']), o('Q', 2, 9, ['P'])],
      new Map([['P', 'Q']]),
    );
    assert.equal(dk[0]!.oyuncu.id, 'P');
    assert.equal(dk[1]!.tieBreakNotu, 'doğrudan karşılaşma');

    // Her şey eşit → görev kartı.
    const gk = siralamaHesapla([o('M', 2, 12), o('N', 2, 4)]);
    assert.equal(gk[0]!.oyuncu.id, 'M');
    assert.equal(gk[1]!.tieBreakNotu, 'çözülen görev kartı');
  });

  test('kura deterministiktir (turnuva öncesi ilan edilen tohumla)', () => {
    const a = siralamaHesapla([o('K', 1, 0), o('L', 1, 0)], new Map(), 'tohum-2027');
    const b = siralamaHesapla([o('L', 1, 0), o('K', 1, 0)], new Map(), 'tohum-2027');
    assert.equal(a[0]!.oyuncu.id, b[0]!.oyuncu.id);
    assert.equal(a[1]!.tieBreakNotu, 'kura');
  });

  test('Md. 10.5 — direktör baş hakem olamaz, hakem kendi öğrencisine bakamaz', () => {
    const s = hakemAtamaKontrol({
      direktorId: 'd1', basHakemId: 'd1',
      atamalar: [{ hakemId: 'h1', masa: 1, masadakiOgrenciler: ['o1'] }],
      hakemOgrencileri: new Map([['h1', ['o1']]]),
      katilimciSayisi: 8,
    });
    assert.equal(s.uygun, false);
    assert.equal(s.hatalar.length, 2);
  });

  test('Md. 10.6 — net gelir %40 düzenleyici · %30 EPNEXUS · %30 operasyon', () => {
    const p = gelirPaylas('turnuva', 100_000, { duzenleyenKademe: 2 });
    assert.equal(p.fasilitatorPayi, 40_000);
    assert.equal(p.epnexusPayi, 30_000);
    assert.equal(p.operasyonRezervi, 30_000);
    assert.equal(p.fasilitatorPayi + p.epnexusPayi + p.operasyonRezervi, 100_000);
  });

  test('Md. 10.6 — zararda EPNEXUS payı alınmaz', () => {
    const p = gelirPaylas('turnuva', -5_000);
    assert.equal(p.epnexusPayi, 0);
    assert.equal(p.fasilitatorPayi, 0);
    assert.ok(p.uyarilar.some((u) => u.includes('Md. 10.6')));
  });

  test('Md. 5.2 — fasilitatörün kendi kursundan EPNEXUS pay almaz', () => {
    const p = gelirPaylas('fasilitator_kursu', 50_000);
    assert.equal(p.fasilitatorPayi, 50_000);
    assert.equal(p.epnexusPayi, 0);
  });

  test('Md. 5.2 — Kademe 1 eğitimi payı yalnız Master’a ödenir', () => {
    const k2 = gelirPaylas('kademe1_egitimi', 100_000, { duzenleyenKademe: 2 });
    assert.ok(k2.uyarilar.some((u) => u.includes('Master')));
    const k3 = gelirPaylas('kademe1_egitimi', 100_000, { duzenleyenKademe: 3 });
    assert.equal(k3.uyarilar.length, 0);
    assert.equal(k3.fasilitatorPayi, 40_000);
    assert.equal(k3.epnexusPayi, 60_000);
  });
});
