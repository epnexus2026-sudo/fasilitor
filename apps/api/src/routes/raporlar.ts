/**
 * Uygulama raporları — Yönetmelik Md. 7.2 onay akışı.
 * Fasilitatör yükler → Kademe 2 ön onay (48 sa hedef) → Kademe 3 onay (5 iş günü) → NX ödenir.
 * Onaylanmayan rapor gerekçeli geri gönderilir; bir kez düzeltme hakkı vardır.
 */
import { Yonlendirici, aktifKullanici, enAzKademe, gerekliKullanici, type Baglam } from '../lib/http.ts';
import { govdeDogrula, d } from '../lib/dogrula.ts';
import { tek, tumu, calistir, denetimYaz, islem } from '../db/index.ts';
import { kimlikUret, simdi } from '../lib/id.ts';
import { hatalar } from '../lib/hata.ts';
import { nxYaz, nxGeriAl, haftalikSeriHesapla } from '../services/nxServisi.ts';
import { kaliteDurumu } from '../services/uyeServisi.ts';
import { rubrikOrtalamasi, rubrikGecerliMi } from '../domain/rubrik.ts';
import { OYUN_INDEKS } from '../data/catalog.ts';

export const raporRotalari = new Yonlendirici();

interface RaporSatiri {
  id: string; uye_id: string; oyun_id: string; okul_adi: string; sinif_duzeyi: number;
  ogrenci_sayisi: number; kazanim_kodu: string; tarih: string; sure_dk: number;
  rb_kazanim: number; rb_soylem: number; rb_katilim: number; rb_fasilitasyon: number;
  gozlem_notu: string; durum: string; on_onay_veren: string | null; on_onay_tarihi: string | null;
  onay_veren: string | null; onay_tarihi: string | null; red_gerekcesi: string | null;
  duzeltme_sayisi: number; fotograf_politikasi_onay: number; ogrenci_verisi_anonim: number;
  olusturuldu: string;
}

function bicimle(r: RaporSatiri) {
  const rubrik = {
    kazanim: r.rb_kazanim, soylem: r.rb_soylem,
    katilim: r.rb_katilim, fasilitasyon: r.rb_fasilitasyon,
  };
  return {
    id: r.id,
    uyeId: r.uye_id,
    oyun: { id: r.oyun_id, ad: OYUN_INDEKS.get(r.oyun_id)?.ad ?? r.oyun_id },
    okulAdi: r.okul_adi,
    sinifDuzeyi: r.sinif_duzeyi,
    ogrenciSayisi: r.ogrenci_sayisi,
    kazanimKodu: r.kazanim_kodu,
    tarih: r.tarih,
    sureDk: r.sure_dk,
    rubrik,
    rubrikOrtalamasi: Number(rubrikOrtalamasi(rubrik).toFixed(2)),
    gozlemNotu: r.gozlem_notu,
    durum: r.durum,
    onOnay: r.on_onay_veren ? { veren: r.on_onay_veren, tarih: r.on_onay_tarihi } : null,
    onay: r.onay_veren ? { veren: r.onay_veren, tarih: r.onay_tarihi } : null,
    redGerekcesi: r.red_gerekcesi,
    duzeltmeSayisi: r.duzeltme_sayisi,
    olusturuldu: r.olusturuldu,
  };
}

function raporGetir(id: string): RaporSatiri {
  const r = tek<RaporSatiri>('SELECT * FROM uygulama_raporlari WHERE id = ?', id);
  if (!r) throw hatalar.bulunamadi('Rapor bulunamadı.');
  return r;
}

raporRotalari.get('/', (ctx: Baglam) => {
  const k = gerekliKullanici(ctx);
  const durum = ctx.sorgu.get('durum');
  const uyeId = ctx.sorgu.get('uyeId');

  // Başkasının raporlarını yalnız onay yetkisi olanlar (K2+) ve EPNEXUS görür.
  const hedef = uyeId ?? k.id;
  if (hedef !== k.id && k.kademe < 2 && k.rol !== 'epnexus') {
    throw hatalar.yasak('Başka üyenin raporlarını görüntülemek için Kademe 2 yetkisi gerekir.');
  }

  const kosullar = ['uye_id = ?'];
  const params: unknown[] = [hedef];
  if (durum) { kosullar.push('durum = ?'); params.push(durum); }

  const satirlar = tumu<RaporSatiri>(
    `SELECT * FROM uygulama_raporlari WHERE ${kosullar.join(' AND ')} ORDER BY tarih DESC LIMIT 200`,
    ...params,
  );
  return { raporlar: satirlar.map(bicimle), kalite: kaliteDurumu(hedef) };
});

/** Md. 7.2 — ön onay/onay kuyruğu. */
raporRotalari.get('/kuyruk', (ctx: Baglam) => {
  const k = enAzKademe(ctx, 2);
  const durum = k.kademe >= 3 || k.rol === 'epnexus' ? 'on_onayli' : 'gonderildi';
  const satirlar = tumu<RaporSatiri>(
    `SELECT r.* FROM uygulama_raporlari r
      WHERE r.durum = ? AND r.uye_id <> ?
      ORDER BY r.olusturuldu ASC LIMIT 100`,
    durum, k.id,
  );
  return {
    asama: durum === 'gonderildi' ? 'Kademe 2 ön onayı' : 'Kademe 3 onayı',
    hedefSure: durum === 'gonderildi' ? '48 saat' : '5 iş günü',
    raporlar: satirlar.map(bicimle),
  };
});

raporRotalari.post('/', async (ctx: Baglam) => {
  const k = aktifKullanici(ctx);
  if (k.kademe < 1) throw hatalar.yasak('Uygulama raporu yalnız sertifikalı fasilitatörlerce girilir.');

  const g = govdeDogrula(await ctx.govde(), {
    oyunId: d.metin({ min: 2, maks: 40 }),
    okulAdi: d.metin({ min: 2, maks: 160 }),
    sinifDuzeyi: d.tamsayi({ min: 1, maks: 12 }),
    ogrenciSayisi: d.tamsayi({ min: 1, maks: 500 }),
    kazanimKodu: d.metin({ min: 3, maks: 60 }),
    tarih: d.tarih(),
    sureDk: d.tamsayi({ min: 5, maks: 600 }),
    rubrik: (v, alan) => {
      const o = v as Record<string, unknown>;
      if (typeof o !== 'object' || o === null) throw hatalar.gecersizIstek(`${alan}: rubrik nesnesi bekleniyor.`);
      const p = {
        kazanim: Number(o.kazanim), soylem: Number(o.soylem),
        katilim: Number(o.katilim), fasilitasyon: Number(o.fasilitasyon),
      };
      if (!rubrikGecerliMi(p)) {
        throw hatalar.gecersizIstek(`${alan}: her boyut 1-4 arası tam sayı olmalı (4 boyut × 4 düzey).`);
      }
      return p;
    },
    gozlemNotu: d.istege_bagli(d.metin({ maks: 4000 })),
    fotografPolitikasiOnay: d.mantik(),
    ogrenciVerisiAnonim: d.mantik(),
  });

  if (!OYUN_INDEKS.has(g.oyunId)) throw hatalar.gecersizIstek('Bilinmeyen oyun.');
  // Md. 13.1-13.2 — öğrenci verisi anonim, öğrenci yüzü görünmez. İhlali doğrudan iptal sebebi.
  if (!g.ogrenciVerisiAnonim) {
    throw hatalar.gecersizIstek('Md. 13.1 — öğrenci verisi anonim olmadan rapor kaydedilemez.');
  }
  if (!g.fotografPolitikasiOnay) {
    throw hatalar.gecersizIstek('Md. 13.2 — fotoğraf politikası onayı olmadan rapor kaydedilemez.');
  }
  if (new Date(g.tarih) > new Date()) {
    throw hatalar.gecersizIstek('Gelecek tarihli uygulama raporlanamaz (EK-A A.2/4 dürüst raporlama).');
  }

  const id = kimlikUret('rapor');
  calistir(
    `INSERT INTO uygulama_raporlari
      (id, uye_id, oyun_id, okul_adi, sinif_duzeyi, ogrenci_sayisi, kazanim_kodu, tarih, sure_dk,
       rb_kazanim, rb_soylem, rb_katilim, rb_fasilitasyon, gozlem_notu,
       ogrenci_verisi_anonim, fotograf_politikasi_onay, durum, olusturuldu)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,1,'taslak',?)`,
    id, k.id, g.oyunId, g.okulAdi, g.sinifDuzeyi, g.ogrenciSayisi, g.kazanimKodu, g.tarih, g.sureDk,
    g.rubrik.kazanim, g.rubrik.soylem, g.rubrik.katilim, g.rubrik.fasilitasyon,
    g.gozlemNotu ?? '', simdi(),
  );
  return bicimle(raporGetir(id));
});

raporRotalari.post('/:id/gonder', (ctx: Baglam) => {
  const k = aktifKullanici(ctx);
  const r = raporGetir(ctx.params.id!);
  if (r.uye_id !== k.id) throw hatalar.yasak('Yalnız kendi raporunuzu gönderebilirsiniz.');
  if (r.durum !== 'taslak' && r.durum !== 'duzeltme_istendi') {
    throw hatalar.cakisma(`Rapor '${r.durum}' durumunda; yeniden gönderilemez.`);
  }
  calistir("UPDATE uygulama_raporlari SET durum = 'gonderildi' WHERE id = ?", r.id);
  denetimYaz(k.id, 'rapor_gonder', r.id);
  return bicimle(raporGetir(r.id));
});

/** Md. 4.3 — Kademe 2 rapor ön onay yetkisine sahiptir. */
raporRotalari.post('/:id/on-onay', (ctx: Baglam) => {
  const k = enAzKademe(ctx, 2);
  const r = raporGetir(ctx.params.id!);
  if (r.uye_id === k.id) throw hatalar.yasak('Kendi raporunuzu onaylayamazsınız (Md. 14.4 tarafsızlık).');
  if (r.durum !== 'gonderildi') throw hatalar.cakisma(`Ön onay yalnız 'gonderildi' durumunda verilir.`);

  calistir(
    "UPDATE uygulama_raporlari SET durum = 'on_onayli', on_onay_veren = ?, on_onay_tarihi = ? WHERE id = ?",
    k.id, simdi(), r.id,
  );
  denetimYaz(k.id, 'rapor_on_onay', r.id);
  return bicimle(raporGetir(r.id));
});

/** Md. 4.4 — Kademe 3 onayı; onayla birlikte NX ödenir (Md. 11.1: 300 NX). */
raporRotalari.post('/:id/onay', (ctx: Baglam) => {
  const k = enAzKademe(ctx, 3);
  const r = raporGetir(ctx.params.id!);
  if (r.uye_id === k.id) throw hatalar.yasak('Kendi raporunuzu onaylayamazsınız (Md. 14.4 tarafsızlık).');
  if (r.durum !== 'on_onayli') {
    throw hatalar.cakisma("Kademe 3 onayı yalnız Kademe 2 ön onayından sonra verilir (Md. 7.2).");
  }

  const sonuc = islem(() => {
    calistir(
      "UPDATE uygulama_raporlari SET durum = 'onayli', onay_veren = ?, onay_tarihi = ? WHERE id = ?",
      k.id, simdi(), r.id,
    );
    return nxYaz(r.uye_id, 'uygulama_raporu', { anahtar: r.id, aciklama: 'Onaylı uygulama raporu' });
  });

  // Md. 11.1 — haftalık aktiflik serisi (25 × hafta, maks. 8).
  const hafta = haftalikSeriHesapla(r.uye_id);
  if (hafta > 1) {
    const yil = new Date().getUTCFullYear();
    const haftaNo = Math.floor((Date.now() - Date.UTC(yil, 0, 1)) / (7 * 86_400_000));
    nxYaz(r.uye_id, 'haftalik_seri', { anahtar: `${yil}-${haftaNo}`, hafta });
  }

  denetimYaz(k.id, 'rapor_onay', r.id, { nx: sonuc.nx });
  return { rapor: bicimle(raporGetir(r.id)), nx: sonuc };
});

/** Md. 7.2 — gerekçeli geri gönderme; bir kez düzeltme hakkı. */
raporRotalari.post('/:id/duzeltme', async (ctx: Baglam) => {
  const k = enAzKademe(ctx, 2);
  const g = govdeDogrula(await ctx.govde(), { gerekce: d.metin({ min: 10, maks: 2000 }) });
  const r = raporGetir(ctx.params.id!);
  if (!['gonderildi', 'on_onayli'].includes(r.durum)) {
    throw hatalar.cakisma('Bu durumdaki rapor geri gönderilemez.');
  }
  const yeniDurum = r.duzeltme_sayisi >= 1 ? 'reddedildi' : 'duzeltme_istendi';
  calistir(
    'UPDATE uygulama_raporlari SET durum = ?, red_gerekcesi = ?, duzeltme_sayisi = duzeltme_sayisi + 1 WHERE id = ?',
    yeniDurum, g.gerekce, r.id,
  );
  denetimYaz(k.id, 'rapor_duzeltme', r.id, { yeniDurum, gerekce: g.gerekce });
  return {
    ...bicimle(raporGetir(r.id)),
    not: yeniDurum === 'reddedildi'
      ? 'Düzeltme hakkı bir kezdir (Md. 7.2); rapor reddedildi.'
      : 'Rapor düzeltme için geri gönderildi.',
  };
});

/**
 * Md. 6.4 — uydurma veri (yapılmamış uygulamanın raporlanması) doğrudan iptal sebebidir.
 * Bu uç raporu geçersiz kılar ve Md. 11.4 uyarınca NX'i geri alır.
 */
raporRotalari.post('/:id/uydurma-veri', async (ctx: Baglam) => {
  const k = enAzKademe(ctx, 3);
  const g = govdeDogrula(await ctx.govde(), { gerekce: d.metin({ min: 10, maks: 2000 }) });
  const r = raporGetir(ctx.params.id!);

  const geriAlinan = islem(() => {
    calistir(
      "UPDATE uygulama_raporlari SET durum = 'reddedildi', red_gerekcesi = ? WHERE id = ?",
      `Md. 6.4 uydurma veri — ${g.gerekce}`, r.id,
    );
    return nxGeriAl(r.uye_id, 'uygulama_raporu', r.id, g.gerekce);
  });

  denetimYaz(k.id, 'rapor_uydurma_veri', r.id, { geriAlinanNx: geriAlinan });
  return {
    rapor: bicimle(raporGetir(r.id)),
    geriAlinanNx: geriAlinan,
    uyari: 'Md. 6.4 — uydurma veri doğrudan sertifika iptali sebebidir; yaptırım kaydı ayrıca açılmalıdır.',
  };
});

/** Md. 7.1/5 — her uygulama sonrası anonim 5 soruluk QR anketi. */
raporRotalari.post('/:id/geri-bildirim', async (ctx: Baglam) => {
  const g = govdeDogrula(await ctx.govde(), {
    s1: d.tamsayi({ min: 1, maks: 5 }),
    s2: d.tamsayi({ min: 1, maks: 5 }),
    s3: d.tamsayi({ min: 1, maks: 5 }),
    s4: d.tamsayi({ min: 1, maks: 5 }),
    s5: d.tamsayi({ min: 1, maks: 5 }),
  });
  const r = raporGetir(ctx.params.id!);
  calistir(
    'INSERT INTO geri_bildirimler (rapor_id, s1, s2, s3, s4, s5, tarih) VALUES (?,?,?,?,?,?,?)',
    r.id, g.s1, g.s2, g.s3, g.s4, g.s5, simdi(),
  );
  // Anket anonimdir: kim doldurduğu kaydedilmez.
  return { mesaj: 'Geri bildiriminiz anonim olarak kaydedildi. Teşekkürler.' };
});

raporRotalari.get('/:id', (ctx: Baglam) => {
  const k = gerekliKullanici(ctx);
  const r = raporGetir(ctx.params.id!);
  if (r.uye_id !== k.id && k.kademe < 2 && k.rol !== 'epnexus') {
    throw hatalar.yasak('Bu raporu görüntüleme yetkiniz yok.');
  }
  return bicimle(r);
});
