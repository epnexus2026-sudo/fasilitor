import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  juriDegerlendir, juriPuanToplami, juriTarafsizlikKontrol, havuzErisimDegerlendir,
  JURI_TOPLAM_PUAN, TASARIM_BARAJI, type JuriGirdisi,
} from '../src/domain/oyunhavuzu.ts';
import { telifHesapla, ilkTeklifSonTarihi, TELIF_ORANLARI } from '../src/domain/gelir.ts';
import type { JuriRubrigi } from '../src/domain/types.ts';

const TAM_GEREKCE = {
  mekanik_kazanim: 'Kazanım oyunun merkezinde.',
  oynanabilirlik: 'Kurallar 3 dakikada anlatıldı.',
  karar_kalitesi: 'Her turda anlamlı seçim var.',
  geri_bildirim: 'Hata anında görünüyor.',
  test_kaniti: 'Üç grup, iki oturum.',
  revizyon: 'Veriye dayalı iki değişiklik.',
  uretilebilirlik: 'Bileşenler basılabilir.',
};

function puan(ek: Partial<JuriRubrigi> = {}): JuriRubrigi {
  return {
    mekanik_kazanim: 20, oynanabilirlik: 16, karar_kalitesi: 12,
    geri_bildirim: 8, test_kaniti: 12, revizyon: 8, uretilebilirlik: 4, ...ek,
  };
}

function girdi(ek: Partial<JuriGirdisi> = {}): JuriGirdisi {
  return {
    kademe: 1, puanlar: puan(), gerekceler: TAM_GEREKCE,
    kaynakBeyaniVar: true, teslimNo: 1, ...ek,
  };
}

describe('Oyun Atölyesi jürisi — EK-3 rubriği', () => {
  test('rubrik toplamı 100 puandır', () => {
    assert.equal(JURI_TOPLAM_PUAN, 100);
    assert.equal(juriPuanToplami(puan()), 80);
  });

  test('barajlar: K1 ≥60 · K2 ≥70 · K3 ≥80', () => {
    assert.deepEqual(TASARIM_BARAJI, { 1: 60, 2: 70, 3: 80 });
    assert.equal(juriDegerlendir(girdi({ kademe: 1 })).karar, 'kabul');
    assert.equal(juriDegerlendir(girdi({ kademe: 2 })).karar, 'kabul');
    assert.equal(juriDegerlendir(girdi({ kademe: 3 })).karar, 'kabul');
    // 80 puan Kademe 3 barajına tam oturur; 79 oturmaz.
    const alti = juriDegerlendir(girdi({ kademe: 3, puanlar: puan({ uretilebilirlik: 3 }) }));
    assert.notEqual(alti.karar, 'kabul');
  });

  test('Md. 13.10 — kaynak beyanı yoksa dosya puanlanmaz', () => {
    const s = juriDegerlendir(girdi({ kaynakBeyaniVar: false }));
    assert.equal(s.karar, 'puanlanmadi');
    assert.equal(s.toplamPuan, 0);
    assert.equal(s.havuzaGirer, false);
  });

  test('etik ihlal / intihal doğrudan red', () => {
    const s = juriDegerlendir(girdi({ etikIhlal: true }));
    assert.equal(s.karar, 'red');
    assert.equal(s.kademeKosuluTamam, false);
  });

  test('Kademe 2 mekanik–kazanım uyumu ≥3/5 (15 puan) şartı', () => {
    // Toplam baraj üstünde ama mekanik boyutu zayıf → kabul değil.
    const s = juriDegerlendir(girdi({
      kademe: 2, puanlar: puan({ mekanik_kazanim: 12, oynanabilirlik: 20, test_kaniti: 15, revizyon: 10, uretilebilirlik: 5 }),
    }));
    assert.notEqual(s.karar, 'kabul');
  });

  test('mekanik–kazanım uyumu yoksa yeniden tasarım', () => {
    const s = juriDegerlendir(girdi({ puanlar: puan({ mekanik_kazanim: 5 }) }));
    assert.equal(s.karar, 'yeniden_tasarim');
  });

  test('baraja yakın dosya revizyonla kabul; tekrar hakkı bir kez', () => {
    const yakin = puan({ mekanik_kazanim: 14, oynanabilirlik: 12, karar_kalitesi: 8, geri_bildirim: 6, test_kaniti: 8, revizyon: 4, uretilebilirlik: 3 });
    const ilk = juriDegerlendir(girdi({ kademe: 1, puanlar: yakin, teslimNo: 1 }));
    assert.equal(ilk.karar, 'revizyonla_kabul');
    assert.ok(ilk.revizyonSonTarihi, '6 haftalık süre verilir');

    const ikinci = juriDegerlendir(girdi({ kademe: 1, puanlar: yakin, teslimNo: 2 }));
    assert.equal(ikinci.karar, 'yeniden_tasarim', 'ikinci teslimde revizyon hakkı tükenir');
  });

  test('EK-3 — her boyut için yazılı gerekçe eksikliği raporlanır', () => {
    const s = juriDegerlendir(girdi({ gerekceler: { mekanik_kazanim: 'tek gerekçe' } }));
    assert.equal(s.eksikGerekceler.length, 6);
  });

  test('§ 5.1 / Md. 14.4 — jüri tarafsızlığı', () => {
    const temel = { juriUyeId: 'j1', tasarimciId: 't1', juriKurumu: 'A Okulu', tasarimciKurumu: 'B Okulu' };
    assert.equal(juriTarafsizlikKontrol({ ...temel, juriMentorlukYaptiklari: [] }).uygun, true);
    assert.equal(juriTarafsizlikKontrol({ ...temel, juriMentorlukYaptiklari: ['t1'] }).uygun, false);
    assert.equal(
      juriTarafsizlikKontrol({ ...temel, juriMentorlukYaptiklari: [], tasarimciKurumu: 'A Okulu' }).uygun,
      false,
    );
    assert.equal(
      juriTarafsizlikKontrol({ ...temel, tasarimciId: 'j1', juriMentorlukYaptiklari: [] }).uygun,
      false,
    );
  });
});

describe('Fikri mülkiyet — Yönetmelik Md. 13.6-13.11', () => {
  test('Md. 13.8 — sertifikalı fasilitatör sınıfta kullanabilir, ticarileştiremez', () => {
    const temel = { talepEdenKademe: 1 as const, talepEdenTasarimciMi: false, ekcSozlesmesiVar: false };
    assert.equal(havuzErisimDegerlendir({ ...temel, eylem: 'sinifta_kullan' }).izin, true);
    assert.equal(havuzErisimDegerlendir({ ...temel, eylem: 'ticari_kullan' }).izin, false);
    assert.equal(havuzErisimDegerlendir({ ...temel, eylem: 'cogalt' }).izin, false);
    assert.equal(havuzErisimDegerlendir({ ...temel, eylem: 'turev_uret' }).izin, false);
  });

  test('Md. 13.6 — sözleşmesiz ürünleştirme yasak, EK-C ile serbest', () => {
    const temel = { eylem: 'urunlestir' as const, talepEdenKademe: 3 as const, talepEdenTasarimciMi: false };
    assert.equal(havuzErisimDegerlendir({ ...temel, ekcSozlesmesiVar: false }).izin, false);
    assert.equal(havuzErisimDegerlendir({ ...temel, ekcSozlesmesiVar: true }).izin, true);
  });

  test('tasarımcının kendi eseri üzerinde sınırı yoktur', () => {
    const s = havuzErisimDegerlendir({
      eylem: 'turev_uret', talepEdenKademe: 0, talepEdenTasarimciMi: true, ekcSozlesmesiVar: false,
    });
    assert.equal(s.izin, true);
  });

  test('Kademe 0 havuza erişemez (§ 6.2)', () => {
    const s = havuzErisimDegerlendir({
      eylem: 'sinifta_kullan', talepEdenKademe: 0, talepEdenTasarimciMi: false, ekcSozlesmesiVar: false,
    });
    assert.equal(s.izin, false);
  });

  test('Md. 5.2 — telif oranları özgün %10 · ortak %6 · varyant %4', () => {
    assert.equal(TELIF_ORANLARI.ozgun.oran, 0.1);
    assert.equal(TELIF_ORANLARI.ortak_gelistirme.oran, 0.06);
    assert.equal(TELIF_ORANLARI.varyant.oran, 0.04);

    const t = telifHesapla('ozgun', 100_000, true);
    assert.ok(!('hata' in t));
    assert.equal((t as { telif: number }).telif, 10_000);
    assert.equal((t as { epnexusPayi: number }).epnexusPayi, 90_000);
  });

  test('Md. 13.6 — EK-C imzalanmadan telif hesabı üretilmez', () => {
    const t = telifHesapla('ozgun', 100_000, false);
    assert.ok('hata' in t);
  });

  test('ortak geliştirmede geliştirme ücreti telife eklenir', () => {
    const t = telifHesapla('ortak_gelistirme', 100_000, true, 5_000);
    assert.equal((t as { telif: number }).telif, 11_000);
  });

  test('Md. 13.7/3 — ilk teklif hakkı 90 gündür', () => {
    const b = new Date('2026-09-14T00:00:00Z');
    assert.equal(ilkTeklifSonTarihi(b).toISOString().slice(0, 10), '2026-12-13');
  });
});
