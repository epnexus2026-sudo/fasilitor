/** Kayıt, giriş, oturum. Kademe 0 (Kâşif) üyeliği ücretsizdir (Md. 4.1). */
import { Yonlendirici, gerekliKullanici, type Baglam } from '../lib/http.ts';
import { govdeDogrula, d } from '../lib/dogrula.ts';
import { parolaOzetle, parolaDogrula, jetonUret, oturumKapat } from '../lib/kimlik.ts';
import { calistir, tek, denetimYaz } from '../db/index.ts';
import { kimlikUret, simdi } from '../lib/id.ts';
import { hatalar } from '../lib/hata.ts';
import { nxYaz, bakiye } from '../services/nxServisi.ts';
import { uyeGetir } from '../services/uyeServisi.ts';
import { KADEME_UNVAN, KADEME_MARKA_UNVANI, type Kademe } from '../domain/types.ts';

export const kimlikRotalari = new Yonlendirici();

kimlikRotalari.post('/kayit', async (ctx: Baglam) => {
  const g = govdeDogrula(await ctx.govde(), {
    adSoyad: d.metin({ min: 3, maks: 120 }),
    eposta: d.eposta(),
    parola: d.metin({ min: 8, maks: 200 }),
    il: d.istege_bagli(d.metin({ maks: 60 })),
    ilce: d.istege_bagli(d.metin({ maks: 60 })),
    okul: d.istege_bagli(d.metin({ maks: 160 })),
    brans: d.istege_bagli(d.metin({ maks: 80 })),
  });

  const eposta = g.eposta.toLowerCase();
  if (tek('SELECT 1 AS v FROM uyeler WHERE eposta = ?', eposta)) {
    throw hatalar.cakisma('Bu e-posta ile kayıtlı bir üye zaten var.');
  }

  const id = kimlikUret('uye');
  const t = simdi();
  calistir(
    `INSERT INTO uyeler (id, ad_soyad, eposta, parola_hash, il, ilce, okul, brans, kademe, olusturuldu, guncellendi)
     VALUES (?,?,?,?,?,?,?,?,0,?,?)`,
    id, g.adSoyad, eposta, parolaOzetle(g.parola),
    g.il ?? '', g.ilce ?? '', g.okul ?? null, g.brans ?? null, t, t,
  );

  // Md. 11.1 — profil tamamlama 50 NX (il/ilçe girildiyse).
  if (g.il && g.ilce) nxYaz(id, 'profil_tamamlama', { aciklama: 'Kayıt sırasında profil tamamlandı.' });

  denetimYaz(id, 'uye_kayit', id, { eposta });
  const { jeton, bitis } = jetonUret(id);
  return { id, jeton, bitis: bitis.toISOString(), kademe: 0, unvan: KADEME_UNVAN[0] };
});

kimlikRotalari.post('/giris', async (ctx: Baglam) => {
  const g = govdeDogrula(await ctx.govde(), {
    eposta: d.eposta(),
    parola: d.metin({ min: 1, maks: 200 }),
  });
  const uye = tek<{ id: string; parola_hash: string; durum: string }>(
    'SELECT id, parola_hash, durum FROM uyeler WHERE eposta = ?',
    g.eposta.toLowerCase(),
  );
  // Kullanıcı yokken de aynı maliyetli yolu izlemek için sahte özet doğrulanır.
  const gecerli = uye
    ? parolaDogrula(g.parola, uye.parola_hash)
    : (parolaDogrula(g.parola, parolaOzetle('bos')), false);

  if (!uye || !gecerli) throw hatalar.yetkisiz('E-posta veya parola hatalı.');
  if (uye.durum === 'iptal') throw hatalar.yasak('Üyeliğiniz iptal edilmiştir (Md. 6.4).');

  const { jeton, bitis } = jetonUret(uye.id);
  denetimYaz(uye.id, 'giris', uye.id);
  return { jeton, bitis: bitis.toISOString() };
});

kimlikRotalari.post('/cikis', (ctx: Baglam) => {
  const k = gerekliKullanici(ctx);
  oturumKapat(k.jti);
  return { mesaj: 'Oturum kapatıldı.' };
});

kimlikRotalari.get('/ben', (ctx: Baglam) => {
  const k = gerekliKullanici(ctx);
  const uye = uyeGetir(k.id);
  const b = bakiye(k.id);
  return {
    id: uye.id,
    adSoyad: uye.ad_soyad,
    eposta: uye.eposta,
    il: uye.il,
    ilce: uye.ilce,
    okul: uye.okul,
    brans: uye.brans,
    kademe: uye.kademe,
    unvan: KADEME_UNVAN[uye.kademe as Kademe],
    markaUnvani: KADEME_MARKA_UNVANI[uye.kademe as Kademe],
    durum: uye.durum,
    rol: uye.rol,
    kurucuKohort: uye.kurucu_kohort === 1,
    kademeGecerlilik: uye.kademe_gecerlilik,
    ekAImzaTarihi: uye.ek_a_imza_tarihi,
    nx: {
      bakiye: b.bakiye,
      toplamKazanim: b.toplamKazanim,
      toplamHarcama: b.toplamHarcama,
      rutbe: b.rutbe.mevcut,
      sonrakiRutbe: b.rutbe.sonraki,
      sonrakiyeKalan: b.rutbe.sonrakiyeKalan,
      ilerlemeYuzdesi: b.rutbe.ilerlemeYuzdesi,
    },
  };
});

/** EK-A Marka ve Etik Sözleşmesi — sertifika verilmeden önce imzalanır. */
kimlikRotalari.post('/ek-a-imzala', async (ctx: Baglam) => {
  const k = gerekliKullanici(ctx);
  const g = govdeDogrula(await ctx.govde(), { onay: d.mantik() });
  if (!g.onay) throw hatalar.gecersizIstek('EK-A sözleşmesi onaylanmadan sertifika verilemez.');
  const t = simdi();
  calistir('UPDATE uyeler SET ek_a_imza_tarihi = ?, guncellendi = ? WHERE id = ?', t, t, k.id);
  denetimYaz(k.id, 'ek_a_imza', k.id);
  return { imzaTarihi: t, mesaj: 'EK-A Marka ve Etik Sözleşmesi kaydedildi.' };
});
