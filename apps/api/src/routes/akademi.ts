/** Akademi: modül ilerlemesi, sınav, kademe ilerleme durumu. */
import { Yonlendirici, aktifKullanici, gerekliKullanici, epnexusEkibi, type Baglam } from '../lib/http.ts';
import { govdeDogrula, d } from '../lib/dogrula.ts';
import { tumu, tek, calistir, denetimYaz } from '../db/index.ts';
import { simdi, kimlikUret } from '../lib/id.ts';
import { hatalar } from '../lib/hata.ts';
import { nxYaz } from '../services/nxServisi.ts';
import { ilerlemeDurumu, adayDurumu, tamamlananModulSaati, yenilemeDurumu } from '../services/uyeServisi.ts';
import { MODULLER, TUM_MODULLER } from '../data/catalog.ts';
import { GECIS_KOSULLARI } from '../domain/kademe.ts';

export const akademiRotalari = new Yonlendirici();

akademiRotalari.get('/moduller', (ctx: Baglam) => {
  const k = gerekliKullanici(ctx);
  const hedef = Math.min(k.kademe + 1, 3) as 1 | 2 | 3;
  const tamamlanan = new Set(
    tumu<{ modul_kodu: string }>('SELECT modul_kodu FROM modul_ilerlemesi WHERE uye_id = ?', k.id)
      .map((r) => r.modul_kodu),
  );
  const liste = MODULLER[hedef].map((m, i, hepsi) => ({
    ...m,
    tamamlandi: tamamlanan.has(m.kod),
    kilitli: i > 0 && !tamamlanan.has(hepsi[i - 1]!.kod) && !tamamlanan.has(m.kod),
  }));
  return {
    hedefKademe: hedef,
    gerekenSaat: GECIS_KOSULLARI[hedef].egitimSaati,
    tamamlananSaat: tamamlananModulSaati(k.id, hedef),
    sinavBaraji: GECIS_KOSULLARI[hedef].sinavBaraji,
    moduller: liste,
  };
});

akademiRotalari.post('/moduller/:kod/tamamla', (ctx: Baglam) => {
  const k = aktifKullanici(ctx);
  const kod = ctx.params.kod!.toUpperCase();
  const modul = TUM_MODULLER.find((m) => m.kod === kod);
  if (!modul) throw hatalar.bulunamadi('Modül bulunamadı.');
  if (modul.kademe > k.kademe + 1) {
    throw hatalar.yasak(`${kod} modülü Kademe ${modul.kademe} programına aittir; sıranız gelmedi.`);
  }
  if (tek('SELECT 1 AS v FROM modul_ilerlemesi WHERE uye_id = ? AND modul_kodu = ?', k.id, kod)) {
    throw hatalar.cakisma('Bu modül zaten tamamlanmış.');
  }
  calistir(
    'INSERT INTO modul_ilerlemesi (uye_id, modul_kodu, tamamlandi) VALUES (?,?,?)',
    k.id, kod, simdi(),
  );
  // Md. 11.1 — modül başına 100 NX.
  const nx = nxYaz(k.id, 'modul_tamamlama', { anahtar: kod, aciklama: `${kod} — ${modul.ad}` });
  denetimYaz(k.id, 'modul_tamamla', kod);
  return { modul, nx };
});

/** Md. 3.2 sınav barajları: K1 %70 · K2 %75 · K3 %85. */
akademiRotalari.post('/sinav', async (ctx: Baglam) => {
  const k = aktifKullanici(ctx);
  const g = govdeDogrula(await ctx.govde(), {
    kademe: d.tamsayi({ min: 1, maks: 3 }),
    puan: d.tamsayi({ min: 0, maks: 100 }),
  });
  const hedef = g.kademe as 1 | 2 | 3;
  if (hedef > k.kademe + 1) throw hatalar.yasak('Bu kademenin sınavına giremezsiniz.');

  const baraj = GECIS_KOSULLARI[hedef].sinavBaraji;
  const gecti = g.puan >= baraj;
  calistir(
    'INSERT INTO sinav_sonuclari (uye_id, kademe, puan, gecti, tarih) VALUES (?,?,?,?,?)',
    k.id, hedef, g.puan, gecti ? 1 : 0, simdi(),
  );
  denetimYaz(k.id, 'sinav', String(hedef), { puan: g.puan, gecti });
  return { kademe: hedef, puan: g.puan, baraj, gecti, ilerleme: ilerlemeDurumu(k.id) };
});

akademiRotalari.get('/ilerleme', (ctx: Baglam) => {
  const k = gerekliKullanici(ctx);
  return {
    aday: adayDurumu(k.id),
    degerlendirme: ilerlemeDurumu(k.id),
    yenileme: yenilemeDurumu(k.id),
  };
});

/** Kohort yönetimi — EPNEXUS ekibi. */
akademiRotalari.get('/kohortlar', () =>
  ({ kohortlar: tumu('SELECT * FROM kohortlar ORDER BY baslangic DESC') }));

akademiRotalari.post('/kohortlar', async (ctx: Baglam) => {
  epnexusEkibi(ctx);
  const g = govdeDogrula(await ctx.govde(), {
    ad: d.metin({ min: 3, maks: 120 }),
    kademe: d.tamsayi({ min: 1, maks: 3 }),
    baslangic: d.tarih(),
    bitis: d.tarih(),
    kontenjan: d.tamsayi({ min: 1, maks: 500 }),
    kurucuKohort: d.istege_bagli(d.mantik()),
    egitmenUyeId: d.istege_bagli(d.metin({ maks: 60 })),
  });
  const id = kimlikUret('kohort');
  calistir(
    `INSERT INTO kohortlar (id, ad, kademe, baslangic, bitis, kontenjan, kurucu_kohort, egitmen_uye_id, durum)
     VALUES (?,?,?,?,?,?,?,?,'planlandi')`,
    id, g.ad, g.kademe, g.baslangic, g.bitis, g.kontenjan,
    g.kurucuKohort ? 1 : 0, g.egitmenUyeId ?? null,
  );
  return tek('SELECT * FROM kohortlar WHERE id = ?', id);
});
