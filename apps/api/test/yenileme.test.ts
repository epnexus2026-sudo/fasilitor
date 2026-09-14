import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { yenilemeDegerlendir, yenilemeAsamasi, hatirlatmaGerekli, YENILEME_KOSULLARI } from '../src/domain/yenileme.ts';
import { rubrikOrtalamasi, geriBildirimIslemi, ardisikDusukRubrik, rubrikGecerliMi } from '../src/domain/rubrik.ts';
import { yaptirimUygula, dogrudanIptal, BASAMAKLAR } from '../src/domain/yaptirim.ts';
import type { RubrikPuani } from '../src/domain/types.ts';

const bos = { onayliUygulama: 0, atolye: 0, etkinlik: 0, mentorluk: 0 };

describe('Yenileme ve kademe düşüşü — Md. 6', () => {
  test('Md. 6.2 — K1: 6 onaylı uygulama VEYA 2 atölye', () => {
    assert.equal(yenilemeDegerlendir(1, { ...bos, onayliUygulama: 6 }).karsilandi, true);
    assert.equal(yenilemeDegerlendir(1, { ...bos, atolye: 2 }).karsilandi, true);
    assert.equal(yenilemeDegerlendir(1, { ...bos, onayliUygulama: 5, atolye: 1 }).karsilandi, false);
  });

  test('Md. 6.2 — K2: etkinlik VE mentorluk VE uygulama birlikte', () => {
    assert.equal(
      yenilemeDegerlendir(2, { onayliUygulama: 8, atolye: 0, etkinlik: 1, mentorluk: 2 }).karsilandi,
      true,
    );
    const eksik = yenilemeDegerlendir(2, { onayliUygulama: 8, atolye: 0, etkinlik: 1, mentorluk: 1 });
    assert.equal(eksik.karsilandi, false);
    assert.ok(eksik.eksikler.some((e) => e.includes('mentorluk')));
  });

  test('Md. 4.4 — Master yükümlülükleri ayrı sayaçlara bakar', () => {
    const tam = { ...bos, etkinlik: 1, kohort: 4, kalibrasyon: 2, urunKurulu: 4, juriDosyasi: 4 };
    assert.equal(yenilemeDegerlendir(3, tam).karsilandi, true);
    assert.equal(yenilemeDegerlendir(3, { ...tam, kohort: 3 }).karsilandi, false);
  });

  test('Md. 6.2 — yenileme ücretleri K1 1.200 ₺ · K2 1.800 ₺ · K3 0 ₺', () => {
    assert.equal(YENILEME_KOSULLARI[1].ucret, 1200);
    assert.equal(YENILEME_KOSULLARI[2].ucret, 1800);
    assert.equal(YENILEME_KOSULLARI[3].ucret, 0);
  });

  test('Md. 6.3 — 90/30/7 gün hatırlatmaları', () => {
    const son = new Date('2026-12-01T00:00:00Z');
    const asama = yenilemeAsamasi(1, son, new Date('2026-11-01T00:00:00Z'), false);
    assert.equal(asama.asama, 'hatirlatma');
    assert.equal(asama.asama === 'hatirlatma' && asama.esik, 30);

    assert.equal(hatirlatmaGerekli(90), 90);
    assert.equal(hatirlatmaGerekli(45), null);
  });

  test('Md. 6.4 — koşul karşılanmazsa 3 ay ek süre, sonra düşüş', () => {
    const son = new Date('2026-09-01T00:00:00Z');
    const ekSure = yenilemeAsamasi(1, son, new Date('2026-10-01T00:00:00Z'), false);
    assert.equal(ekSure.asama, 'ek_sure');

    const dusus = yenilemeAsamasi(1, son, new Date('2026-12-15T00:00:00Z'), false);
    assert.equal(dusus.asama, 'dusus');
    assert.equal(dusus.asama === 'dusus' && dusus.yeniKademe, 0);

    const k2dusus = yenilemeAsamasi(2, son, new Date('2026-12-15T00:00:00Z'), false);
    assert.equal(k2dusus.asama === 'dusus' && k2dusus.yeniKademe, 1);
  });

  test('koşul karşılanmışsa süre dolsa da düşüş yok', () => {
    const asama = yenilemeAsamasi(1, new Date('2026-09-01T00:00:00Z'), new Date('2026-12-15T00:00:00Z'), true);
    assert.equal(asama.asama, 'gecerli');
  });
});

describe('Rubrik ve kalite eşikleri — Md. 7', () => {
  const p = (k: number, s: number, ka: number, f: number): RubrikPuani =>
    ({ kazanim: k, soylem: s, katilim: ka, fasilitasyon: f });

  test('rubrik 4 boyut × 4 düzey; sınır dışı değer geçersiz', () => {
    assert.equal(rubrikGecerliMi(p(1, 2, 3, 4)), true);
    assert.equal(rubrikGecerliMi(p(0, 2, 3, 4)), false);
    assert.equal(rubrikGecerliMi(p(1, 2, 3, 5)), false);
    assert.equal(rubrikOrtalamasi(p(3, 3, 4, 2)), 3);
  });

  test('Md. 7.3 — geri bildirim eşikleri', () => {
    assert.equal(geriBildirimIslemi(4.2), 'yok');
    assert.equal(geriBildirimIslemi(3.7), 'mentor_onerisi');
    assert.equal(geriBildirimIslemi(3.2), 'mentor_atamasi');
    assert.equal(geriBildirimIslemi(2.9), 'aski_degerlendirmesi');
  });

  test('Md. 6.4 — üst üste 3 uygulamada <2,5 mentor ataması tetikler', () => {
    const dusuk = p(2, 2, 3, 2); // ortalama 2,25
    const iyi = p(3, 3, 3, 3);
    assert.equal(ardisikDusukRubrik([dusuk, dusuk, dusuk]), true);
    assert.equal(ardisikDusukRubrik([dusuk, dusuk, iyi]), false);
    assert.equal(ardisikDusukRubrik([dusuk, dusuk]), false, '3 kayıttan az ise tetiklenmez');
  });
});

describe('Yaptırım basamakları — Md. 8', () => {
  const simdi = new Date('2026-09-14T00:00:00Z');

  test('Md. 8.1 — 2. basamaktan itibaren 10 iş günü savunma', () => {
    assert.equal(yaptirimUygula('gorusme', 1, simdi).savunmaSonuTarihi, null);
    assert.ok(yaptirimUygula('yazili_uyari', 1, simdi).savunmaSonuTarihi);
    assert.equal(BASAMAKLAR.gorusme.dosyayaIslenir, false);
    assert.equal(BASAMAKLAR.yazili_uyari.dosyayaIslenir, true);
  });

  test('askı unvanı dondurur ve dizinden çıkarır, kademeyi düşürmez', () => {
    const s = yaptirimUygula('aski', 2, simdi);
    assert.equal(s.yeniDurum, 'askida');
    assert.equal(s.yeniKademe, 2);
    assert.equal(s.dizindenCikar, true);
  });

  test('kademe düşüşü bir alt kademeye indirir', () => {
    assert.equal(yaptirimUygula('kademe_dususu', 3, simdi).yeniKademe, 2);
    assert.equal(yaptirimUygula('kademe_dususu', 1, simdi).yeniKademe, 0);
  });

  test('Md. 6.4 — doğrudan iptal halleri', () => {
    const uydurma = dogrudanIptal('uydurma_veri', simdi);
    assert.equal(uydurma.yeniDurum, 'iptal');
    assert.equal(uydurma.yeniKademe, 0);
    assert.ok(uydurma.savunmaSonuTarihi, 'savunma karardan sonra itiraz yoluyla alınır');

    const cocuk = dogrudanIptal('cocuk_guvenligi', simdi);
    assert.ok(cocuk.aciklama.includes('kalıcı'));
  });
});
