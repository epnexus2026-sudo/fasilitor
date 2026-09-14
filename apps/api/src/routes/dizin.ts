/** Kamuya açık fasilitatör dizini — Md. 4.2 (dizinde yayın), Md. 4.3 (öne çıkarma). */
import { Yonlendirici, type Baglam } from '../lib/http.ts';
import { tumu } from '../db/index.ts';
import { KADEME_MARKA_UNVANI, type Kademe } from '../domain/types.ts';

export const dizinRotalari = new Yonlendirici();

dizinRotalari.get('/', (ctx: Baglam) => {
  const il = ctx.sorgu.get('il');
  const ilce = ctx.sorgu.get('ilce');
  const kademe = ctx.sorgu.get('kademe');

  const kosullar = ["u.durum = 'aktif'", 'u.kademe >= 1', 'u.dizinde_yayinla = 1', "u.rol = 'uye'"];
  const params: unknown[] = [];
  if (il) { kosullar.push('u.il = ?'); params.push(il); }
  if (ilce) { kosullar.push('u.ilce = ?'); params.push(ilce); }
  if (kademe) { kosullar.push('u.kademe = ?'); params.push(Number(kademe)); }

  const satirlar = tumu<{
    id: string; ad_soyad: string; il: string; ilce: string; kademe: number;
    uygulama: number; oyun_cesidi: number;
  }>(
    `SELECT u.id, u.ad_soyad, u.il, u.ilce, u.kademe,
            (SELECT COUNT(*) FROM uygulama_raporlari r WHERE r.uye_id = u.id AND r.durum = 'onayli') AS uygulama,
            (SELECT COUNT(DISTINCT r.oyun_id) FROM uygulama_raporlari r WHERE r.uye_id = u.id AND r.durum = 'onayli') AS oyun_cesidi
       FROM uyeler u
      WHERE ${kosullar.join(' AND ')}
      ORDER BY u.kademe DESC, uygulama DESC
      LIMIT 200`,
    ...params,
  );

  return {
    toplam: satirlar.length,
    fasilitatorler: satirlar.map((s) => ({
      id: s.id,
      adSoyad: s.ad_soyad,
      bolge: `${s.il} / ${s.ilce}`,
      kademe: s.kademe,
      unvan: KADEME_MARKA_UNVANI[s.kademe as Kademe],
      // Md. 4.3 — Kademe 2 ve üzeri dizinde öne çıkarılır.
      oneCikan: s.kademe >= 2,
      onayliUygulama: s.uygulama,
      oyunCesidi: s.oyun_cesidi,
    })),
  };
});

dizinRotalari.get('/iller', () => ({
  iller: tumu(
    `SELECT il, COUNT(*) AS fasilitator FROM uyeler
      WHERE durum = 'aktif' AND kademe >= 1 AND dizinde_yayinla = 1 AND il <> ''
      GROUP BY il ORDER BY fasilitator DESC`,
  ),
}));
