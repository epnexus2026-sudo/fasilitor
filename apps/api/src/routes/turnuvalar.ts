/** Turnuva protokolü — Yönetmelik Md. 10. */
import { Yonlendirici, aktifKullanici, enAzKademe, gerekliKullanici, epnexusEkibi, type Baglam } from '../lib/http.ts';
import { govdeDogrula, d } from '../lib/dogrula.ts';
import { tek, tumu, calistir, denetimYaz } from '../db/index.ts';
import { kimlikUret, simdi } from '../lib/id.ts';
import { hatalar } from '../lib/hata.ts';
import {
  basvuruDegerlendir, isvicreEslestir, siralamaHesapla, hakemAtamaKontrol,
  gerekenHakemSayisi, turSayisi, type Oyuncu,
} from '../domain/turnuva.ts';
import { gelirPaylas } from '../domain/gelir.ts';
import { nxYaz } from '../services/nxServisi.ts';

export const turnuvaRotalari = new Yonlendirici();

interface TurnuvaSatiri {
  id: string; ad: string; duzenleyen_id: string; il: string; ilce: string;
  tarih: string; basvuru_tarihi: string; beklenen_katilimci: number; tur_sayisi: number;
  durum: string; red_gerekcesi: string | null; net_gelir: number | null;
  duzenleyen_payi: number | null; epnexus_payi: number | null; operasyon_rezervi: number | null;
  rapor_son_tarihi: string | null; rapor_tarihi: string | null;
}

interface OyuncuSatiri {
  id: number; turnuva_id: string; oyuncu_kodu: string; ad: string; okul: string | null;
  puan: number; gorev_karti: number; rakipler: string; bye_aldi: number;
}

function turnuvaGetir(id: string): TurnuvaSatiri {
  const t = tek<TurnuvaSatiri>('SELECT * FROM turnuvalar WHERE id = ?', id);
  if (!t) throw hatalar.bulunamadi('Turnuva bulunamadı.');
  return t;
}

function oyuncular(turnuvaId: string): Oyuncu[] {
  return tumu<OyuncuSatiri>(
    'SELECT * FROM turnuva_oyunculari WHERE turnuva_id = ? ORDER BY id', turnuvaId,
  ).map((o) => ({
    id: o.oyuncu_kodu, ad: o.ad, okul: o.okul ?? undefined, puan: o.puan,
    gorevKarti: o.gorev_karti, rakipler: JSON.parse(o.rakipler) as string[],
    byeAldi: o.bye_aldi === 1,
  }));
}

turnuvaRotalari.get('/', () => ({
  turnuvalar: tumu<TurnuvaSatiri>('SELECT * FROM turnuvalar ORDER BY tarih DESC LIMIT 100'),
}));

/** Md. 10.1-10.2 — yalnız K2+ düzenler, en az 8 hafta önce bildirilir. */
turnuvaRotalari.post('/', async (ctx: Baglam) => {
  const k = enAzKademe(ctx, 2);
  const g = govdeDogrula(await ctx.govde(), {
    ad: d.metin({ min: 3, maks: 160 }),
    il: d.metin({ min: 2, maks: 60 }),
    ilce: d.metin({ min: 2, maks: 60 }),
    tarih: d.tarih(),
    beklenenKatilimci: d.tamsayi({ min: 2, maks: 2000 }),
  });

  const basvuruTarihi = new Date();
  const degerlendirme = basvuruDegerlendir({
    duzenleyenKademe: k.kademe,
    tarih: new Date(g.tarih),
    basvuruTarihi,
    il: g.il,
    ilce: g.ilce,
    beklenenKatilimci: g.beklenenKatilimci,
  });

  if (!degerlendirme.uygun) {
    throw hatalar.gecersizIstek('Turnuva başvurusu kurallara uymuyor.', degerlendirme.hatalar);
  }

  // Md. 10.2 — EPNEXUS takvim çakışmasını kontrol eder.
  const cakisma = tek<{ ad: string }>(
    `SELECT ad FROM turnuvalar WHERE il = ? AND date(tarih) = date(?) AND durum IN ('basvuruldu','onaylandi')`,
    g.il, g.tarih,
  );

  const id = kimlikUret('turnuva');
  calistir(
    `INSERT INTO turnuvalar (id, ad, duzenleyen_id, il, ilce, tarih, basvuru_tarihi,
       beklenen_katilimci, tur_sayisi, durum, rapor_son_tarihi)
     VALUES (?,?,?,?,?,?,?,?,?,'basvuruldu',?)`,
    id, g.ad, k.id, g.il, g.ilce, g.tarih, basvuruTarihi.toISOString(),
    g.beklenenKatilimci, degerlendirme.turSayisi, degerlendirme.raporSonTarihi,
  );
  denetimYaz(k.id, 'turnuva_basvuru', id);

  return {
    turnuva: turnuvaGetir(id),
    degerlendirme,
    takvimUyarisi: cakisma ? `Aynı il ve tarihte başka bir turnuva var: ${cakisma.ad}` : null,
    epnexusSaglar: ['Lig markası ve görsel kit', 'Eşleştirme sistemi', 'Madalya, kupa, sertifika',
      'Kural ve tie-break protokolü', 'Duyuru desteği'],
    duzenleyenSorumlulugu: ['Mekân', 'Hakem kadrosu', 'İkram', 'Sağlık/güvenlik', 'İzinler', 'Sponsorluk', 'Raporlama'],
  };
});

turnuvaRotalari.post('/:id/onay', async (ctx: Baglam) => {
  epnexusEkibi(ctx);
  const g = govdeDogrula(await ctx.govde(), {
    karar: d.secenek(['onaylandi', 'reddedildi'] as const),
    gerekce: d.istege_bagli(d.metin({ maks: 1000 })),
  });
  const t = turnuvaGetir(ctx.params.id!);
  calistir('UPDATE turnuvalar SET durum = ?, red_gerekcesi = ? WHERE id = ?', g.karar, g.gerekce ?? null, t.id);
  return turnuvaGetir(t.id);
});

turnuvaRotalari.post('/:id/oyuncular', async (ctx: Baglam) => {
  const k = aktifKullanici(ctx);
  const g = govdeDogrula(await ctx.govde(), {
    oyuncular: d.dizi(
      (v, alan) => {
        const o = v as Record<string, unknown>;
        if (typeof o?.kod !== 'string' || typeof o?.ad !== 'string') {
          throw hatalar.gecersizIstek(`${alan}: kod ve ad zorunlu.`);
        }
        return { kod: o.kod, ad: o.ad, okul: typeof o.okul === 'string' ? o.okul : null };
      },
      { min: 1, maks: 500 },
    ),
  });
  const t = turnuvaGetir(ctx.params.id!);
  if (t.duzenleyen_id !== k.id && k.rol !== 'epnexus') {
    throw hatalar.yasak('Yalnız düzenleyici oyuncu ekleyebilir.');
  }
  for (const o of g.oyuncular) {
    calistir(
      `INSERT INTO turnuva_oyunculari (turnuva_id, oyuncu_kodu, ad, okul) VALUES (?,?,?,?)
       ON CONFLICT(turnuva_id, oyuncu_kodu) DO UPDATE SET ad = excluded.ad, okul = excluded.okul`,
      t.id, o.kod, o.ad, o.okul,
    );
  }
  const liste = oyuncular(t.id);
  return {
    oyuncuSayisi: liste.length,
    turSayisi: turSayisi(liste.length),
    gerekenHakem: gerekenHakemSayisi(liste.length),
    oyuncular: liste,
  };
});

/** Md. 10.5 — İsviçre sistemi eşleştirmesi. */
turnuvaRotalari.get('/:id/eslestirme', (ctx: Baglam) => {
  gerekliKullanici(ctx);
  const t = turnuvaGetir(ctx.params.id!);
  const liste = oyuncular(t.id);
  const eslesmeler = isvicreEslestir(liste);
  const adlar = new Map(liste.map((o) => [o.id, o.ad]));
  return {
    turnuva: t.ad,
    turSayisi: turSayisi(liste.length),
    gerekenHakem: gerekenHakemSayisi(liste.length),
    eslesmeler: eslesmeler.map((e) => ({
      masa: e.masa === 0 ? 'BYE' : e.masa,
      beyaz: { kod: e.beyaz, ad: adlar.get(e.beyaz) },
      siyah: e.siyah ? { kod: e.siyah, ad: adlar.get(e.siyah) } : null,
    })),
  };
});

/** Tur sonuçlarının girilmesi. */
turnuvaRotalari.post('/:id/sonuc', async (ctx: Baglam) => {
  const k = aktifKullanici(ctx);
  const g = govdeDogrula(await ctx.govde(), {
    sonuclar: d.dizi((v, alan) => {
      const o = v as Record<string, unknown>;
      if (typeof o?.beyaz !== 'string') throw hatalar.gecersizIstek(`${alan}: beyaz kodu zorunlu.`);
      const skor = Number(o.beyazPuan);
      if (![0, 0.5, 1].includes(skor)) throw hatalar.gecersizIstek(`${alan}: beyazPuan 0, 0.5 veya 1 olmalı.`);
      return {
        beyaz: o.beyaz,
        siyah: typeof o.siyah === 'string' ? o.siyah : null,
        beyazPuan: skor,
        beyazGorevKarti: Number(o.beyazGorevKarti ?? 0),
        siyahGorevKarti: Number(o.siyahGorevKarti ?? 0),
      };
    }, { min: 1, maks: 500 }),
  });
  const t = turnuvaGetir(ctx.params.id!);
  if (t.duzenleyen_id !== k.id && k.rol !== 'epnexus') throw hatalar.yasak('Yalnız düzenleyici sonuç girebilir.');

  for (const s of g.sonuclar) {
    const beyaz = tek<OyuncuSatiri>(
      'SELECT * FROM turnuva_oyunculari WHERE turnuva_id = ? AND oyuncu_kodu = ?', t.id, s.beyaz,
    );
    if (!beyaz) throw hatalar.gecersizIstek(`Oyuncu bulunamadı: ${s.beyaz}`);

    if (!s.siyah) {
      // Bye: 1 puan, rakip eklenmez.
      calistir(
        'UPDATE turnuva_oyunculari SET puan = puan + 1, bye_aldi = 1 WHERE turnuva_id = ? AND oyuncu_kodu = ?',
        t.id, s.beyaz,
      );
      continue;
    }
    const siyah = tek<OyuncuSatiri>(
      'SELECT * FROM turnuva_oyunculari WHERE turnuva_id = ? AND oyuncu_kodu = ?', t.id, s.siyah,
    );
    if (!siyah) throw hatalar.gecersizIstek(`Oyuncu bulunamadı: ${s.siyah}`);

    const beyazRakipler = [...(JSON.parse(beyaz.rakipler) as string[]), s.siyah];
    const siyahRakipler = [...(JSON.parse(siyah.rakipler) as string[]), s.beyaz];

    calistir(
      'UPDATE turnuva_oyunculari SET puan = puan + ?, gorev_karti = gorev_karti + ?, rakipler = ? WHERE id = ?',
      s.beyazPuan, s.beyazGorevKarti, JSON.stringify(beyazRakipler), beyaz.id,
    );
    calistir(
      'UPDATE turnuva_oyunculari SET puan = puan + ?, gorev_karti = gorev_karti + ?, rakipler = ? WHERE id = ?',
      1 - s.beyazPuan, s.siyahGorevKarti, JSON.stringify(siyahRakipler), siyah.id,
    );
  }
  return { mesaj: 'Tur sonuçları işlendi.', siralama: siralamaHesapla(oyuncular(t.id)).slice(0, 10) };
});

/** Md. 10.5 — tie-break sırası: Buchholz → doğrudan karşılaşma → görev kartı → kura. */
turnuvaRotalari.get('/:id/siralama', (ctx: Baglam) => {
  const t = turnuvaGetir(ctx.params.id!);
  const siralama = siralamaHesapla(oyuncular(t.id), new Map(), t.id);
  return {
    turnuva: t.ad,
    tieBreakSirasi: ['Buchholz', 'doğrudan karşılaşma', 'çözülen görev kartı', 'kura'],
    siralama: siralama.map((s) => ({
      sira: s.sira, kod: s.oyuncu.id, ad: s.oyuncu.ad, okul: s.oyuncu.okul ?? null,
      puan: s.oyuncu.puan, buchholz: s.buchholz, gorevKarti: s.oyuncu.gorevKarti,
      tieBreak: s.tieBreakNotu,
    })),
  };
});

turnuvaRotalari.post('/:id/hakem-kontrol', async (ctx: Baglam) => {
  gerekliKullanici(ctx);
  const g = govdeDogrula(await ctx.govde(), {
    direktorId: d.metin({ min: 1, maks: 60 }),
    basHakemId: d.metin({ min: 1, maks: 60 }),
    atamalar: d.dizi((v, alan) => {
      const o = v as Record<string, unknown>;
      if (typeof o?.hakemId !== 'string') throw hatalar.gecersizIstek(`${alan}: hakemId zorunlu.`);
      return {
        hakemId: o.hakemId,
        masa: Number(o.masa ?? 0),
        masadakiOgrenciler: Array.isArray(o.masadakiOgrenciler) ? (o.masadakiOgrenciler as string[]) : [],
      };
    }, { min: 1, maks: 200 }),
    hakemOgrencileri: (v) => (v ?? {}) as Record<string, string[]>,
  });
  const t = turnuvaGetir(ctx.params.id!);
  return hakemAtamaKontrol({
    direktorId: g.direktorId,
    basHakemId: g.basHakemId,
    atamalar: g.atamalar,
    hakemOgrencileri: new Map(Object.entries(g.hakemOgrencileri)),
    katilimciSayisi: oyuncular(t.id).length,
  });
});

/** Md. 10.6-10.7 — gelir paylaşımı ve 10 gün içinde raporlama. */
turnuvaRotalari.post('/:id/rapor', async (ctx: Baglam) => {
  const k = aktifKullanici(ctx);
  const g = govdeDogrula(await ctx.govde(), {
    netGelir: d.sayi(),
    katilimci: d.tamsayi({ min: 0, maks: 5000 }),
    hakemler: d.istege_bagli(d.dizi(d.metin({ maks: 60 }), { maks: 50 })),
  });
  const t = turnuvaGetir(ctx.params.id!);
  if (t.duzenleyen_id !== k.id && k.rol !== 'epnexus') throw hatalar.yasak('Yalnız düzenleyici rapor yükleyebilir.');

  const duzenleyen = tek<{ kademe: number }>('SELECT kademe FROM uyeler WHERE id = ?', t.duzenleyen_id);
  const paylasim = gelirPaylas('turnuva', g.netGelir, { duzenleyenKademe: duzenleyen?.kademe });

  calistir(
    `UPDATE turnuvalar SET durum = 'raporlandi', net_gelir = ?, duzenleyen_payi = ?,
       epnexus_payi = ?, operasyon_rezervi = ?, rapor_tarihi = ? WHERE id = ?`,
    Math.round(g.netGelir), paylasim.fasilitatorPayi, paylasim.epnexusPayi,
    paylasim.operasyonRezervi, simdi(), t.id,
  );

  // Md. 4.3/6.2 — turnuva yenileme sayacına etkinlik olarak işlenir.
  calistir(
    'INSERT INTO etkinlikler (id, uye_id, tur, ad, katilimci, tarih) VALUES (?,?,?,?,?,?)',
    kimlikUret('etkinlik'), t.duzenleyen_id, 'turnuva', t.ad, g.katilimci, t.tarih,
  );

  // Md. 11.1 — turnuva hakemliği 400 NX.
  const hakemNx = (g.hakemler ?? []).map((h) => ({
    uyeId: h, sonuc: nxYaz(h, 'turnuva_hakemligi', { anahtar: t.id, aciklama: `Hakemlik: ${t.ad}` }),
  }));

  const gecikti = t.rapor_son_tarihi ? new Date() > new Date(t.rapor_son_tarihi) : false;
  denetimYaz(k.id, 'turnuva_rapor', t.id, { netGelir: g.netGelir, gecikti });

  return {
    turnuva: turnuvaGetir(t.id),
    paylasim,
    hakemNx,
    uyari: gecikti ? 'Md. 10.7 — rapor 10 günlük süreden sonra yüklendi.' : null,
  };
});
