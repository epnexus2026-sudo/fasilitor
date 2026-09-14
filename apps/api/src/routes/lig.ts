/** Lig ve liderlik tabloları — Md. 11.5. */
import { Yonlendirici, gerekliKullanici, epnexusEkibi, type Baglam } from '../lib/http.ts';
import { tumu } from '../db/index.ts';
import { ligOlustur, tabloUret, ayKapanisi, LIG_BOYUTU, type LigUyesi } from '../domain/lig.ts';
import { ROZETLER } from '../data/catalog.ts';
import { tek } from '../db/index.ts';

export const ligRotalari = new Yonlendirici();

/** Dönem NX'i: son 30 günde kazanılan NX (harcama sayılmaz). */
function ligUyeleri(): LigUyesi[] {
  const otuzGunOnce = new Date(Date.now() - 30 * 86_400_000).toISOString();
  return tumu<{ id: string; ad_soyad: string; il: string; okul: string | null; nx: number | null }>(
    `SELECT u.id, u.ad_soyad, u.il, u.okul,
            (SELECT COALESCE(SUM(n.nx), 0) FROM nx_defteri n
              WHERE n.uye_id = u.id AND n.nx > 0 AND n.tarih >= ?) AS nx
       FROM uyeler u
      WHERE u.durum = 'aktif' AND u.rol = 'uye'`,
    otuzGunOnce,
  ).map((r) => ({
    uyeId: r.id, adSoyad: r.ad_soyad, il: r.il, okul: r.okul, donemNx: r.nx ?? 0,
  }));
}

ligRotalari.get('/', (ctx: Baglam) => {
  const k = gerekliKullanici(ctx);
  const uyeler = ligUyeleri();
  const gruplar = ligOlustur(uyeler);
  const benimGrup = gruplar.find((g) => g.uyeler.some((u) => u.uyeId === k.id)) ?? gruplar[0] ?? null;

  return {
    ligBoyutu: LIG_BOYUTU,
    kural: 'Her ay ilk 5 yükselir, son 5 düşer (Md. 11.5).',
    // Md. 11.5 — mutlak ulusal sıralama üyeye gösterilmez.
    benimLigim: benimGrup
      ? {
          seviye: benimGrup.seviye,
          ad: benimGrup.ad,
          satirlar: benimGrup.uyeler.map((u, i) => ({
            sira: i + 1, ad: u.adSoyad, altBilgi: u.il, nx: u.donemNx, benMiyim: u.uyeId === k.id,
          })),
        }
      : null,
    ilTablosu: tabloUret('il', uyeler, k.id),
    okulTablosu: tabloUret('okul', uyeler, k.id),
  };
});

ligRotalari.post('/ay-kapanisi', (ctx: Baglam) => {
  epnexusEkibi(ctx);
  const sonuc = ayKapanisi(ligOlustur(ligUyeleri()));
  return {
    hareketSayisi: sonuc.hareketler.length,
    hareketler: sonuc.hareketler,
    gruplar: sonuc.gruplar.map((g) => ({ seviye: g.seviye, ad: g.ad, uyeSayisi: g.uyeler.length })),
  };
});

/** Rozet durumu — kazanım koşulları veriye göre hesaplanır. */
ligRotalari.get('/rozetler', (ctx: Baglam) => {
  const k = gerekliKullanici(ctx);
  const oyunSayaclari = tumu<{ oyun_id: string; n: number }>(
    "SELECT oyun_id, COUNT(*) AS n FROM uygulama_raporlari WHERE uye_id = ? AND durum = 'onayli' GROUP BY oyun_id",
    k.id,
  );
  const sayac = new Map(oyunSayaclari.map((r) => [r.oyun_id, r.n]));
  const kurucu = tek<{ kurucu_kohort: number }>('SELECT kurucu_kohort FROM uyeler WHERE id = ?', k.id);
  const turnuva = tek<{ n: number }>(
    "SELECT COUNT(*) AS n FROM etkinlikler WHERE uye_id = ? AND tur = 'turnuva'", k.id,
  )?.n ?? 0;

  const oyunEsleme: Record<string, string> = {
    usta_hazine: 'hazine', usta_harmonia: 'harmonia',
    usta_salur: 'salur', usta_afrodisias: 'afrodisias',
  };

  return {
    rozetler: ROZETLER.map((r) => {
      let sahip = false;
      const oyunId = oyunEsleme[r.kod];
      if (oyunId) sahip = (sayac.get(oyunId) ?? 0) >= 5;
      else if (r.kod === 'kurucu') sahip = kurucu?.kurucu_kohort === 1;
      else if (r.kod === 'ilk_turnuva') sahip = turnuva > 0;
      return { ...r, sahip };
    }),
  };
});
