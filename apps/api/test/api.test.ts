/**
 * Uçtan uca API testi — bellek içi veritabanıyla gerçek HTTP sunucusu.
 * Md. 7.2 onay akışı, Md. 9 yönlendirme, Md. 6.1 doğrulama ve yetki sınırları.
 */
import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import { veritabaniAc, dbAyarla } from '../src/db/index.ts';
import { uygulamaOlustur } from '../src/uygulama.ts';

let sunucu: Server;
let taban: string;

before(async () => {
  dbAyarla(veritabaniAc(':memory:'));
  sunucu = createServer(uygulamaOlustur());
  await new Promise<void>((c) => sunucu.listen(0, '127.0.0.1', c));
  const adres = sunucu.address();
  const port = typeof adres === 'object' && adres ? adres.port : 0;
  taban = `http://127.0.0.1:${port}/api`;
});

after(() => { sunucu.close(); });

interface Yanit<T = any> { durum: number; govde: T }

async function istek<T = any>(
  yontem: string, yol: string, opts: { jeton?: string; govde?: unknown } = {},
): Promise<Yanit<T>> {
  const basliklar: Record<string, string> = { 'content-type': 'application/json' };
  if (opts.jeton) basliklar.authorization = `Bearer ${opts.jeton}`;
  const r = await fetch(taban + yol, {
    method: yontem,
    headers: basliklar,
    body: opts.govde === undefined ? undefined : JSON.stringify(opts.govde),
  });
  const metin = await r.text();
  return { durum: r.status, govde: metin ? JSON.parse(metin) : null };
}

async function uyeKur(opts: {
  ad: string; eposta: string; il: string; ilce: string; kademe: number; rol?: string; okul?: string;
}): Promise<{ id: string; jeton: string }> {
  const kayit = await istek('POST', '/kimlik/kayit', {
    govde: {
      adSoyad: opts.ad, eposta: opts.eposta, parola: 'test-parola-123',
      il: opts.il, ilce: opts.ilce, okul: opts.okul,
    },
  });
  assert.equal(kayit.durum, 200, JSON.stringify(kayit.govde));
  const id = kayit.govde.id as string;

  // Kademe ve rol doğrudan veritabanında ayarlanır (sertifika akışı ayrıca test edilir).
  const { calistir } = await import('../src/db/index.ts');
  const gecerlilik = new Date(Date.now() + 400 * 86_400_000).toISOString();
  calistir(
    'UPDATE uyeler SET kademe = ?, rol = ?, kademe_gecerlilik = ?, ek_a_imza_tarihi = ? WHERE id = ?',
    opts.kademe, opts.rol ?? 'uye', gecerlilik, new Date().toISOString(), id,
  );
  return { id, jeton: kayit.govde.jeton as string };
}

describe('API — uçtan uca', () => {
  test('sağlık ucu çalışır', async () => {
    const r = await istek('GET', '/saglik');
    assert.equal(r.durum, 200);
    assert.equal(r.govde.yonetmelik, 'v1.1');
  });

  test('bilinmeyen uç 404 döner', async () => {
    assert.equal((await istek('GET', '/yok-boyle-bir-uc')).durum, 404);
  });

  test('oturumsuz istek 401 döner', async () => {
    assert.equal((await istek('GET', '/kimlik/ben')).durum, 401);
  });

  test('geçersiz jeton reddedilir', async () => {
    const r = await istek('GET', '/kimlik/ben', { jeton: 'sahte.jeton' });
    assert.equal(r.durum, 401);
  });

  test('aynı e-posta ile ikinci kayıt 409 döner', async () => {
    const govde = { adSoyad: 'Test Kişi', eposta: 'tekrar@ornek.com', parola: 'parola-12345' };
    assert.equal((await istek('POST', '/kimlik/kayit', { govde })).durum, 200);
    assert.equal((await istek('POST', '/kimlik/kayit', { govde })).durum, 409);
  });

  test('yanlış parola 401, doğru parola jeton döner', async () => {
    await istek('POST', '/kimlik/kayit', {
      govde: { adSoyad: 'Giriş Testi', eposta: 'giris@ornek.com', parola: 'dogru-parola-1' },
    });
    assert.equal(
      (await istek('POST', '/kimlik/giris', { govde: { eposta: 'giris@ornek.com', parola: 'yanlis' } })).durum,
      401,
    );
    const ok = await istek('POST', '/kimlik/giris', {
      govde: { eposta: 'giris@ornek.com', parola: 'dogru-parola-1' },
    });
    assert.equal(ok.durum, 200);
    assert.ok(ok.govde.jeton);
  });

  test('Md. 7.2 — rapor onay zinciri ve 300 NX', async () => {
    const k1 = await uyeKur({ ad: 'Elif Test', eposta: 'elif.t@ornek.com', il: 'Sakarya', ilce: 'Hendek', kademe: 1 });
    const k2 = await uyeKur({ ad: 'Zeynep Test', eposta: 'zeynep.t@ornek.com', il: 'Sakarya', ilce: 'Adapazarı', kademe: 2 });
    const k3 = await uyeKur({ ad: 'Kübra Test', eposta: 'kubra.t@ornek.com', il: 'Sakarya', ilce: 'Serdivan', kademe: 3 });

    const olustur = await istek('POST', '/raporlar', {
      jeton: k1.jeton,
      govde: {
        oyunId: 'salur', okulAdi: 'Hendek O.O.', sinifDuzeyi: 7, ogrenciSayisi: 24,
        kazanimKodu: 'MAT.7.2.4', tarih: new Date(Date.now() - 86_400_000).toISOString(), sureDk: 40,
        rubrik: { kazanim: 3, soylem: 3, katilim: 4, fasilitasyon: 3 },
        fotografPolitikasiOnay: true, ogrenciVerisiAnonim: true,
      },
    });
    assert.equal(olustur.durum, 200, JSON.stringify(olustur.govde));
    const id = olustur.govde.id as string;
    assert.equal(olustur.govde.durum, 'taslak');
    assert.equal(olustur.govde.rubrikOrtalamasi, 3.25);

    assert.equal((await istek('POST', `/raporlar/${id}/gonder`, { jeton: k1.jeton })).govde.durum, 'gonderildi');

    // Kademe 1 ön onay veremez.
    assert.equal((await istek('POST', `/raporlar/${id}/on-onay`, { jeton: k1.jeton })).durum, 403);
    // Kademe 2 ön onayı olmadan Kademe 3 onaylayamaz.
    assert.equal((await istek('POST', `/raporlar/${id}/onay`, { jeton: k3.jeton })).durum, 409);

    assert.equal((await istek('POST', `/raporlar/${id}/on-onay`, { jeton: k2.jeton })).govde.durum, 'on_onayli');
    // Kademe 2 nihai onayı veremez.
    assert.equal((await istek('POST', `/raporlar/${id}/onay`, { jeton: k2.jeton })).durum, 403);

    const onay = await istek('POST', `/raporlar/${id}/onay`, { jeton: k3.jeton });
    assert.equal(onay.durum, 200);
    assert.equal(onay.govde.rapor.durum, 'onayli');
    assert.equal(onay.govde.nx.nx, 300);

    // Aynı rapor ikinci kez onaylanamaz (NX mükerrer yazılmaz).
    assert.equal((await istek('POST', `/raporlar/${id}/onay`, { jeton: k3.jeton })).durum, 409);
  });

  test('Md. 13.1-13.2 — KVKK onayı olmayan rapor reddedilir', async () => {
    const k1 = await uyeKur({ ad: 'KVKK Testi', eposta: 'kvkk@ornek.com', il: 'Bursa', ilce: 'Nilüfer', kademe: 1 });
    const temel = {
      oyunId: 'hazine', okulAdi: 'Test O.O.', sinifDuzeyi: 5, ogrenciSayisi: 20,
      kazanimKodu: 'MAT.5.2.1', tarih: new Date(Date.now() - 86_400_000).toISOString(), sureDk: 40,
      rubrik: { kazanim: 3, soylem: 3, katilim: 3, fasilitasyon: 3 },
    };
    const fotografsiz = await istek('POST', '/raporlar', {
      jeton: k1.jeton, govde: { ...temel, fotografPolitikasiOnay: false, ogrenciVerisiAnonim: true },
    });
    assert.equal(fotografsiz.durum, 400);
    assert.ok(String(fotografsiz.govde.hata).includes('Md. 13.2'));

    // Gelecek tarihli uygulama raporlanamaz (EK-A A.2/4).
    const gelecek = await istek('POST', '/raporlar', {
      jeton: k1.jeton,
      govde: {
        ...temel, tarih: new Date(Date.now() + 86_400_000).toISOString(),
        fotografPolitikasiOnay: true, ogrenciVerisiAnonim: true,
      },
    });
    assert.equal(gelecek.durum, 400);
  });

  test('rubrik sınır dışı değerle rapor açılamaz', async () => {
    const k1 = await uyeKur({ ad: 'Rubrik Testi', eposta: 'rubrik@ornek.com', il: 'İzmir', ilce: 'Konak', kademe: 1 });
    const r = await istek('POST', '/raporlar', {
      jeton: k1.jeton,
      govde: {
        oyunId: 'hazine', okulAdi: 'T', sinifDuzeyi: 5, ogrenciSayisi: 20, kazanimKodu: 'MAT.5.2.1',
        tarih: new Date(Date.now() - 86_400_000).toISOString(), sureDk: 40,
        rubrik: { kazanim: 5, soylem: 3, katilim: 3, fasilitasyon: 3 },
        fotografPolitikasiOnay: true, ogrenciVerisiAnonim: true,
      },
    });
    assert.equal(r.durum, 400);
  });

  test('Md. 9 — talep bölgedeki fasilitatöre atanır', async () => {
    await uyeKur({ ad: 'Bölge K2', eposta: 'bolge.k2@ornek.com', il: 'Kocaeli', ilce: 'İzmit', kademe: 2 });
    const r = await istek('POST', '/talepler', {
      govde: {
        kaynak: 'okul', iletisimAd: 'Okul Müdürü', iletisimEposta: 'mudur@ok.k12.tr',
        il: 'Kocaeli', ilce: 'İzmit', okulAdi: 'İzmit Yeni O.O.',
      },
    });
    assert.equal(r.durum, 200);
    assert.equal(r.govde.atama.kural, 'ilce_k2_k3');
    assert.equal(r.govde.atama.atananAd, 'Bölge K2');

    // Fasilitatör bulunmayan bölge EPNEXUS'a düşer ve Kademe 2 açığı işaretlenir.
    const bos = await istek('POST', '/talepler', {
      govde: {
        kaynak: 'veli', iletisimAd: 'Veli Kişi', iletisimEposta: 'veli@ornek.com',
        il: 'Hakkâri', ilce: 'Yüksekova',
      },
    });
    assert.equal(bos.govde.atama.kural, 'epnexus');
    assert.equal(bos.govde.atama.kademe2Acigi, true);
  });

  test('Md. 9.5 — başkasının çalıştığı okul kaydedilemez', async () => {
    const a = await uyeKur({ ad: 'Okul Sahibi', eposta: 'sahip@ornek.com', il: 'Ankara', ilce: 'Çankaya', kademe: 1 });
    const b = await uyeKur({ ad: 'Rakip', eposta: 'rakip@ornek.com', il: 'Ankara', ilce: 'Çankaya', kademe: 2 });

    assert.equal(
      (await istek('POST', '/talepler/okullarim', { jeton: a.jeton, govde: { okulAdi: 'Çankaya O.O.' } })).durum,
      200,
    );
    const cakisma = await istek('POST', '/talepler/okullarim', {
      jeton: b.jeton, govde: { okulAdi: 'Çankaya O.O.' },
    });
    assert.equal(cakisma.durum, 409);
    assert.ok(String(cakisma.govde.hata).includes('Md. 9.5'));
  });

  test('Md. 14.4 — Master mentorluk yaptığı kişiye sertifika veremez', async () => {
    const master = await uyeKur({ ad: 'Tarafsızlık Master', eposta: 'master.t@ornek.com', il: 'Sakarya', ilce: 'Serdivan', kademe: 3 });
    const aday = await uyeKur({ ad: 'Mentee Aday', eposta: 'mentee@ornek.com', il: 'Sakarya', ilce: 'Serdivan', kademe: 0 });

    await istek('POST', '/yonetim/mentorluk', {
      jeton: master.jeton, govde: { menteeId: aday.id, tur: 'oturum', not: 'Karşılama oturumu' },
    });
    const r = await istek('POST', '/sertifikalar/duzenle', {
      jeton: master.jeton, govde: { uyeId: aday.id, kademe: 1, kosullariGecersizSay: true },
    });
    assert.equal(r.durum, 403);
    assert.ok(String(r.govde.hata).includes('Md. 14.4'));
  });

  test('Md. 6.1 — sertifika düzenleme, QR doğrulama ve Open Badge', async () => {
    const master = await uyeKur({ ad: 'Veren Master', eposta: 'veren@ornek.com', il: 'Sakarya', ilce: 'Serdivan', kademe: 3 });
    const aday = await uyeKur({ ad: 'Yeni Fasilitatör', eposta: 'yeni.f@ornek.com', il: 'Sakarya', ilce: 'Hendek', kademe: 0 });

    // Md. 3.2 koşulları karşılanmadan sertifika verilemez.
    const erken = await istek('POST', '/sertifikalar/duzenle', {
      jeton: master.jeton, govde: { uyeId: aday.id, kademe: 1 },
    });
    assert.equal(erken.durum, 400);
    assert.ok(Array.isArray(erken.govde.detay));

    const s = await istek('POST', '/sertifikalar/duzenle', {
      jeton: master.jeton, govde: { uyeId: aday.id, kademe: 1, kosullariGecersizSay: true },
    });
    assert.equal(s.durum, 200, JSON.stringify(s.govde));
    const no = s.govde.sertifika.no as string;
    assert.match(no, /^EPN-FAC-K1-\d{4}-\d{4}$/);
    assert.equal(s.govde.sertifika.kararVerenMaster, 'Veren Master');

    const dogrula = await istek('GET', `/sertifikalar/dogrula/${no}`);
    assert.equal(dogrula.govde.gecerli, true);
    assert.equal(dogrula.govde.unvan, 'Sertifikalı EPNEXUS Oyun Fasilitatörü');

    // Sahte QR etiketi reddedilir.
    const sahte = await istek('GET', `/sertifikalar/dogrula/${no}?e=sahteetiket`);
    assert.equal(sahte.govde.gecerli, false);
    // Doğru etiket kabul edilir.
    const dogruEtiket = await istek('GET', `/sertifikalar/dogrula/${no}?e=${s.govde.qrEtiketi}`);
    assert.equal(dogruEtiket.govde.gecerli, true);

    const rozet = await istek('GET', `/sertifikalar/${no}/openbadge`);
    assert.equal(rozet.durum, 200);
    assert.deepEqual(rozet.govde.type, ['VerifiableCredential', 'OpenBadgeCredential']);

    assert.equal((await istek('GET', '/sertifikalar/dogrula/EPN-FAC-K1-2099-9999')).govde.bulundu, false);

    // Askıya alınan sertifika unvan taşımaz.
    const aski = await istek('POST', `/sertifikalar/${no}/durum`, {
      jeton: master.jeton, govde: { durum: 'askida', gerekce: 'Marka kuralı ihlali tekrarı.' },
    });
    assert.equal(aski.govde.gecerli, false);
    assert.equal(aski.govde.unvan, null);
  });

  test('Md. 13.10 — kaynak beyanı olmadan tasarım teslim edilemez', async () => {
    const k1 = await uyeKur({ ad: 'Tasarımcı', eposta: 'tasarimci@ornek.com', il: 'Sakarya', ilce: 'Hendek', kademe: 1 });
    const r = await istek('POST', '/tasarimlar', {
      jeton: k1.jeton,
      govde: {
        ad: 'Kesir Kulesi', kademe: 1, alan: 'matematik', sinifDuzeyi: 6, mebKazanim: 'MAT.6.1.4',
        mekanikler: ['set-toplama'], oyuncuSayisi: '2-4', sureDk: 25, bilesenKarmasikligi: 'orta',
        testEdilenOgrenci: 24, ozet: 'Kesirlerle çalışan bir denge oyunu prototipi.',
      },
    });
    assert.equal(r.durum, 400, 'kaynakBeyani zorunlu alandır');
  });

  test('mekanik kütüphanesi dışında mekanik reddedilir', async () => {
    const k1 = await uyeKur({ ad: 'Mekanik Testi', eposta: 'mekanik@ornek.com', il: 'Sakarya', ilce: 'Hendek', kademe: 1 });
    const r = await istek('POST', '/tasarimlar', {
      jeton: k1.jeton,
      govde: {
        ad: 'Test Oyunu', kademe: 1, alan: 'matematik', sinifDuzeyi: 6, mebKazanim: 'MAT.6.1.4',
        mekanikler: ['uydurma-mekanik'], oyuncuSayisi: '2-4', sureDk: 25,
        bilesenKarmasikligi: 'orta', testEdilenOgrenci: 24,
        ozet: 'Kütüphanede olmayan mekanikle teslim denemesi.',
        kaynakBeyani: 'Esinlenilen oyun yok; özgün mekanik denemesi.',
      },
    });
    assert.equal(r.durum, 400);
    assert.ok(String(r.govde.hata).includes('Mekanik kütüphanesinde'));
  });

  test('Md. 10.1-10.2 — turnuva yetki ve süre denetimi', async () => {
    const k1 = await uyeKur({ ad: 'K1 Düzenleyici', eposta: 'k1.turnuva@ornek.com', il: 'Sakarya', ilce: 'Hendek', kademe: 1 });
    const k2 = await uyeKur({ ad: 'K2 Düzenleyici', eposta: 'k2.turnuva@ornek.com', il: 'Sakarya', ilce: 'Adapazarı', kademe: 2 });
    const ondaHafta = new Date(Date.now() + 70 * 86_400_000).toISOString();

    assert.equal(
      (await istek('POST', '/turnuvalar', {
        jeton: k1.jeton,
        govde: { ad: 'Yetkisiz', il: 'Sakarya', ilce: 'Hendek', tarih: ondaHafta, beklenenKatilimci: 32 },
      })).durum,
      403,
    );

    const erken = await istek('POST', '/turnuvalar', {
      jeton: k2.jeton,
      govde: {
        ad: 'Erken Bildirim', il: 'Sakarya', ilce: 'Adapazarı',
        tarih: new Date(Date.now() + 14 * 86_400_000).toISOString(), beklenenKatilimci: 32,
      },
    });
    assert.equal(erken.durum, 400);
    assert.ok(String(erken.govde.detay).includes('Md. 10.2'));

    const ok = await istek('POST', '/turnuvalar', {
      jeton: k2.jeton,
      govde: { ad: 'Kış Turnuvası', il: 'Sakarya', ilce: 'Adapazarı', tarih: ondaHafta, beklenenKatilimci: 32 },
    });
    assert.equal(ok.durum, 200);
    assert.equal(ok.govde.degerlendirme.turSayisi, 5);
    assert.equal(ok.govde.degerlendirme.gerekenHakem, 4);
  });

  test('Md. 8/4 — askıdaki üye işlem yapamaz', async () => {
    const ekip = await uyeKur({ ad: 'EPNEXUS Test', eposta: 'ekip.t@ornek.com', il: 'Sakarya', ilce: 'Serdivan', kademe: 3, rol: 'epnexus' });
    const uye = await uyeKur({ ad: 'Askıya Alınacak', eposta: 'aski@ornek.com', il: 'Sakarya', ilce: 'Hendek', kademe: 1 });

    const y = await istek('POST', '/yonetim/yaptirim', {
      jeton: ekip.jeton,
      govde: { uyeId: uye.id, basamak: 'aski', sebep: 'Uyarıya rağmen marka ihlali sürdü.' },
    });
    assert.equal(y.durum, 200);
    assert.equal(y.govde.sonuc.yeniDurum, 'askida');
    assert.ok(y.govde.sonuc.savunmaSonuTarihi, 'Md. 8.1 savunma süresi tanınır');

    const engellendi = await istek('POST', '/raporlar', {
      jeton: uye.jeton,
      govde: {
        oyunId: 'hazine', okulAdi: 'T', sinifDuzeyi: 5, ogrenciSayisi: 20, kazanimKodu: 'MAT.5.2.1',
        tarih: new Date(Date.now() - 86_400_000).toISOString(), sureDk: 40,
        rubrik: { kazanim: 3, soylem: 3, katilim: 3, fasilitasyon: 3 },
        fotografPolitikasiOnay: true, ogrenciVerisiAnonim: true,
      },
    });
    assert.equal(engellendi.durum, 403);
    assert.ok(String(engellendi.govde.hata).includes('askıda'));
  });

  test('yönetim panosu Kademe 3 altına kapalıdır', async () => {
    const k1 = await uyeKur({ ad: 'Pano K1', eposta: 'pano.k1@ornek.com', il: 'Sakarya', ilce: 'Hendek', kademe: 1 });
    const k3 = await uyeKur({ ad: 'Pano K3', eposta: 'pano.k3@ornek.com', il: 'Sakarya', ilce: 'Serdivan', kademe: 3 });
    assert.equal((await istek('GET', '/yonetim/pano', { jeton: k1.jeton })).durum, 403);
    const ok = await istek('GET', '/yonetim/pano', { jeton: k3.jeton });
    assert.equal(ok.durum, 200);
    assert.equal(ok.govde.hedefler.kademe1, 250);
  });

  test('katalog uçları kamuya açıktır ve SEM uyarısını taşır', async () => {
    const oyunlar = await istek('GET', '/katalog/oyunlar');
    assert.equal(oyunlar.durum, 200);
    assert.equal(oyunlar.govde.oyunlar.length, 4);

    const kurallar = await istek('GET', '/katalog/kurallar');
    assert.equal(kurallar.govde.semProtokolu, null);
    assert.ok(String(kurallar.govde.sertifikaIfadesi).includes('MEB denklik'));

    const gelir = await istek('GET', '/katalog/gelir-paylasimi');
    assert.equal(gelir.govde.paylasim.fasilitator_kursu.fasilitator, 1);
    assert.equal(gelir.govde.paylasim.fasilitator_kursu.epnexus, 0);
  });
});
