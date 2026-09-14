/** Materyal fiyatlandırması ve NX harcaması — Md. 5.1, 5.3, 11.3. */
import { Yonlendirici, gerekliKullanici, type Baglam } from '../lib/http.ts';
import { govdeDogrula, d } from '../lib/dogrula.ts';
import { siparisHesapla, sertifikaUcretiHesapla, iadeDegerlendir, ALICI_KURALLARI, KURUCU_KOHORT_KONTENJANI } from '../domain/ucret.ts';
import { nxHarca, bakiye } from '../services/nxServisi.ts';
import { tek } from '../db/index.ts';
import type { AliciTuru } from '../domain/types.ts';
import { FIYAT_BANTLARI } from '../data/catalog.ts';

export const magazaRotalari = new Yonlendirici();

/** Üyenin kademesine karşılık gelen alıcı türü (Md. 5.3). */
function aliciTuru(kademe: number): AliciTuru {
  if (kademe >= 3) return 'fasilitator_k3';
  if (kademe === 2) return 'fasilitator_k2';
  if (kademe === 1) return 'fasilitator_k1';
  return 'veli';
}

magazaRotalari.post('/fiyat-hesapla', async (ctx: Baglam) => {
  const k = gerekliKullanici(ctx);
  const g = govdeDogrula(await ctx.govde(), {
    satirlar: d.dizi((v, alan) => {
      const o = v as Record<string, unknown>;
      if (typeof o?.oyunId !== 'string') throw new Error(`${alan}: oyunId zorunlu.`);
      return { oyunId: o.oyunId, adet: Number(o.adet ?? 1) };
    }, { min: 1, maks: 20 }),
    aliciTuru: d.istege_bagli(d.secenek(['veli', 'fasilitator_k1', 'fasilitator_k2', 'fasilitator_k3', 'okul', 'bayi'] as const)),
    nxIndirimAdedi: d.istege_bagli(d.tamsayi({ min: 0, maks: 10 })),
    bant: d.istege_bagli(d.secenek(['A', 'B', 'C'] as const)),
  });

  const b = bakiye(k.id);
  const tur = g.aliciTuru ?? aliciTuru(k.kademe);
  const sonuc = siparisHesapla({
    aliciTuru: tur,
    satirlar: g.satirlar,
    rutbeKodu: b.rutbe.mevcut.kod,
    nxIndirimAdedi: g.nxIndirimAdedi,
    bant: g.bant,
  });
  return { ...sonuc, rutbe: b.rutbe.mevcut, nxBakiyesi: b.bakiye, aliciKurali: ALICI_KURALLARI[tur] };
});

magazaRotalari.post('/sertifika-ucreti', async (ctx: Baglam) => {
  const k = gerekliKullanici(ctx);
  const g = govdeDogrula(await ctx.govde(), {
    kalem: d.metin({ min: 2, maks: 40 }),
    nxIndirimiUygulandi: d.istege_bagli(d.mantik()),
  });
  const b = bakiye(k.id);
  const doluluk = tek<{ n: number }>('SELECT COUNT(*) AS n FROM uyeler WHERE kurucu_kohort = 1')?.n ?? 0;
  return {
    ...sertifikaUcretiHesapla({
      kalem: g.kalem as Parameters<typeof sertifikaUcretiHesapla>[0]['kalem'],
      rutbeKodu: b.rutbe.mevcut.kod,
      nxIndirimiUygulandi: g.nxIndirimiUygulandi,
      kurucuKohortDoluluk: doluluk,
    }),
    kurucuKohort: { kontenjan: KURUCU_KOHORT_KONTENJANI, dolu: doluluk },
  };
});

magazaRotalari.post('/nx-harca', async (ctx: Baglam) => {
  const k = gerekliKullanici(ctx);
  const g = govdeDogrula(await ctx.govde(), { kod: d.metin({ min: 2, maks: 60 }) });
  return nxHarca(k.id, g.kod);
});

magazaRotalari.post('/iade-degerlendir', async (ctx: Baglam) => {
  gerekliKullanici(ctx);
  const g = govdeDogrula(await ctx.govde(), {
    ilkModulTamamlandi: d.mantik(),
    dahaOnceDevredildi: d.istege_bagli(d.mantik()),
  });
  return iadeDegerlendir(g.ilkModulTamamlandi, g.dahaOnceDevredildi ?? false);
});

magazaRotalari.get('/bantlar', () => ({ bantlar: FIYAT_BANTLARI }));
