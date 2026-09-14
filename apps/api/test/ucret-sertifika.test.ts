import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  sertifikaUcretiHesapla, siparisHesapla, iadeDegerlendir,
  KURUCU_KOHORT_KONTENJANI, UCRETLER,
} from '../src/domain/ucret.ts';
import {
  sertifikaNoUret, sertifikaNoAyristir, sertifikaOlustur, sertifikaDogrula,
  openBadgeUret, dogrulamaEtiketi, etiketDogrula, sablonAlanlari, sablonDoldur,
} from '../src/domain/sertifika.ts';

describe('Ücretler ve materyal fiyatlandırması — Md. 5', () => {
  test('Md. 5.1 — ücret tablosu', () => {
    assert.equal(UCRETLER.k1_online.tutar, 3900);
    assert.equal(UCRETLER.k1_kurucu_kohort.tutar, 1950);
    assert.equal(UCRETLER.k2.tutar, 6500);
    assert.equal(UCRETLER.k3.tutar, 0);
  });

  test('Md. 5.1 — Kurucu Kohort yalnız ilk 50 kişi', () => {
    const acik = sertifikaUcretiHesapla({ kalem: 'k1_kurucu_kohort', kurucuKohortDoluluk: 49 });
    assert.equal(acik.odenecek, 1950);
    assert.equal(acik.hata, undefined);

    const dolu = sertifikaUcretiHesapla({ kalem: 'k1_kurucu_kohort', kurucuKohortDoluluk: KURUCU_KOHORT_KONTENJANI });
    assert.equal(dolu.odenecek, 3900, 'kontenjan dolunca online fiyat uygulanır');
    assert.ok(dolu.hata);
  });

  test('Md. 11.2 — Oyuncu rütbesi Kademe 1’de %10 indirim açar', () => {
    const indirimli = sertifikaUcretiHesapla({ kalem: 'k1_online', rutbeKodu: 'oyuncu' });
    assert.equal(indirimli.odenecek, 3510);
    const kasif = sertifikaUcretiHesapla({ kalem: 'k1_online', rutbeKodu: 'kasif' });
    assert.equal(kasif.odenecek, 3900);
  });

  test('Md. 11.3 — 8.000 NX Kademe 2’de %20 indirim', () => {
    const s = sertifikaUcretiHesapla({ kalem: 'k2', nxIndirimiUygulandi: true });
    assert.equal(s.odenecek, 5200);
  });

  test('Md. 5.3 — Kademe 1 fasilitatör listeden %15 indirim alır', () => {
    const s = siparisHesapla({ aliciTuru: 'fasilitator_k1', satirlar: [{ oyunId: 'hazine', adet: 2 }] });
    assert.equal(s.satirlar[0]!.birimListe, 1400);
    assert.equal(s.satirlar[0]!.birimFiyat, 1190); // 1400 − %15
    assert.equal(s.genelToplam, 2380);
  });

  test('Md. 5.3 — Kademe 2/3 500’lü kademe, minimum 5 adet', () => {
    const yeterli = siparisHesapla({ aliciTuru: 'fasilitator_k2', satirlar: [{ oyunId: 'hazine', adet: 5 }] });
    assert.equal(yeterli.fiyatKademesi, 'f500');
    assert.equal(yeterli.satirlar[0]!.birimFiyat, 900);
    assert.equal(yeterli.uyarilar.length, 0);

    const az = siparisHesapla({ aliciTuru: 'fasilitator_k2', satirlar: [{ oyunId: 'hazine', adet: 3 }] });
    assert.equal(az.fiyatKademesi, 'perakende');
    assert.equal(az.satirlar[0]!.birimFiyat, 1400);
    assert.ok(az.uyarilar[0]!.includes('minimum sipariş 5'));
  });

  test('Md. 5.3 — okul minimumu 20 adet, karma sipariş sayılır', () => {
    const s = siparisHesapla({
      aliciTuru: 'okul',
      satirlar: [{ oyunId: 'hazine', adet: 10 }, { oyunId: 'afrodisias', adet: 10 }],
    });
    assert.equal(s.toplamAdet, 20);
    assert.equal(s.fiyatKademesi, 'f500');
    assert.equal(s.genelToplam, 10 * 900 + 10 * 950);
  });

  test('Md. 11.2 — Rehber rütbesi materyalde ek %5 getirir', () => {
    const s = siparisHesapla({
      aliciTuru: 'fasilitator_k1', satirlar: [{ oyunId: 'harmonia', adet: 1 }], rutbeKodu: 'rehber',
    });
    assert.equal(s.satirlar[0]!.birimFiyat, Math.round(1500 * (1 - 0.2)));
  });

  test('Md. 11.3 — NX indirimi ara toplamı aşamaz', () => {
    const s = siparisHesapla({
      aliciTuru: 'veli', satirlar: [{ oyunId: 'harmonia', adet: 1 }], nxIndirimAdedi: 10,
    });
    assert.equal(s.nxIndirimi, 1500);
    assert.equal(s.genelToplam, 0);
  });

  test('Md. 5.4 — iade politikası', () => {
    assert.equal(iadeDegerlendir(false, false).durum, 'tam_iade');
    assert.equal(iadeDegerlendir(true, false).durum, 'devir_hakki');
    assert.equal(iadeDegerlendir(true, true).durum, 'yok');
  });
});

describe('Sertifika — Md. 6.1', () => {
  test('numara biçimi EPN-FAC-K1-2026-0037', () => {
    assert.equal(sertifikaNoUret(1, 2026, 37).tam, 'EPN-FAC-K1-2026-0037');
    const a = sertifikaNoAyristir('EPN-FAC-K2-2027-0104');
    assert.equal(a?.kademe, 2);
    assert.equal(a?.yil, 2027);
    assert.equal(a?.sira, 104);
    assert.equal(sertifikaNoAyristir('GEÇERSİZ-NO'), null);
  });

  test('geçerlilik kademeye göre hesaplanır ve doğrulama sonucu üretir', () => {
    const s = sertifikaOlustur({
      no: 'EPN-FAC-K1-2026-0001', uyeId: 'u1', adSoyad: 'Elif Karaca',
      kademe: 1, verilis: new Date('2026-09-14T00:00:00Z'), kararVerenMaster: 'Kübra Yıldız',
    });
    assert.equal(s.gecerlilik.slice(0, 10), '2028-09-14');

    const gecerli = sertifikaDogrula(s, new Date('2027-01-01T00:00:00Z'));
    assert.equal(gecerli.gecerli, true);
    assert.equal(gecerli.unvan, 'Sertifikalı EPNEXUS Oyun Fasilitatörü');
    // uyeId kamuya açık doğrulama yanıtında yer almaz.
    assert.equal((gecerli.sertifika as Record<string, unknown>).uyeId, undefined);

    const dolmus = sertifikaDogrula(s, new Date('2029-01-01T00:00:00Z'));
    assert.equal(dolmus.gecerli, false);
    assert.equal(dolmus.durum, 'suresi_doldu');
    assert.equal(dolmus.unvan, null, 'süresi dolan sertifikada unvan kullanılamaz');

    const yok = sertifikaDogrula(null);
    assert.equal(yok.bulundu, false);
  });

  test('iptal edilmiş sertifika unvan taşımaz', () => {
    const s = sertifikaOlustur({
      no: 'EPN-FAC-K1-2026-0002', uyeId: 'u2', adSoyad: 'X Y',
      kademe: 1, verilis: new Date('2026-01-01T00:00:00Z'),
    });
    const sonuc = sertifikaDogrula({ ...s, durum: 'iptal' }, new Date('2026-06-01T00:00:00Z'));
    assert.equal(sonuc.gecerli, false);
    assert.equal(sonuc.unvan, null);
    assert.ok(sonuc.mesaj.includes('Md. 6.4'));
  });

  test('QR doğrulama etiketi imzalıdır', () => {
    const no = 'EPN-FAC-K1-2026-0003';
    const etiket = dogrulamaEtiketi(no, 'gizli');
    assert.equal(etiketDogrula(no, etiket, 'gizli'), true);
    assert.equal(etiketDogrula(no, etiket, 'baska-anahtar'), false);
    assert.equal(etiketDogrula(no, 'sahte', 'gizli'), false);
  });

  test('Open Badges 3.0 uyumlu kimlik bilgisi üretir', () => {
    const s = sertifikaOlustur({
      no: 'EPN-FAC-K2-2026-0009', uyeId: 'u3', adSoyad: 'Zeynep Aktaş',
      kademe: 2, verilis: new Date('2026-09-14T00:00:00Z'),
    });
    const b = openBadgeUret(s, { issuerId: 'https://epnexusgames.com/issuer', issuerAd: 'EPNEXUS' });
    assert.ok((b['@context'] as string[]).some((c) => c.includes('ob/v3p0')));
    assert.deepEqual(b.type, ['VerifiableCredential', 'OpenBadgeCredential']);
    assert.equal(b.name, 'EPNEXUS Kıdemli Fasilitatörü');
    assert.equal(b.validUntil, s.gecerlilik);
  });

  test('şablon yer tutucuları doldurulur; SEM protokolü yoksa alan boş kalır', () => {
    const s = sertifikaOlustur({
      no: 'EPN-FAC-K1-2026-0004', uyeId: 'u4', adSoyad: 'Elif Karaca',
      kademe: 1, verilis: new Date('2026-09-14T00:00:00Z'),
      kararVerenMaster: 'Kübra Yıldız', universiteSem: null,
    });
    const alanlar = sablonAlanlari(s);
    assert.equal(alanlar.AD_SOYAD, 'Elif Karaca');
    assert.equal(alanlar.UNIVERSITE_SEM, '', "protokol yoksa 'MEB'de geçerli' ifadesi kullanılmaz");
    assert.match(alanlar.VERILIS, /2026/);

    const html = sablonDoldur(
      '<p>{{AD_SOYAD}} — {{SERTIFIKA_NO}} · {{MASTER_FASILITATOR}} · {{BILINMEYEN}}</p>',
      alanlar,
    );
    assert.ok(html.includes('Elif Karaca'));
    assert.ok(html.includes('EPN-FAC-K1-2026-0004'));
    assert.ok(html.includes('{{BILINMEYEN}}'), 'tanınmayan yer tutucu olduğu gibi bırakılır');
  });
});
