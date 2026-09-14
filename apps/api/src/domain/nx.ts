/**
 * NX (Nexus Puanı) motoru — Yönetmelik Madde 11.
 *
 * İlkeler (Md. 11.4):
 *  - NX satın alınamaz, üyeler arasında devredilemez.
 *  - Sahte rapor tespitinde ilgili NX geri alınır.
 *  - Rütbe **toplam kazanıma**, harcanabilir bakiye **kazanım − harcama**ya bakar;
 *    harcama rütbeyi düşürmez.
 */

export type NxEylem =
  | 'profil_tamamlama'
  | 'kaynak_indirme'
  | 'modul_tamamlama'
  | 'webinar_katilim'
  | 'uygulama_raporu'
  | 'master_geri_bildirim'
  | 'forum_cozum'
  | 'oyun_varyanti'
  | 'turnuva_hakemligi'
  | 'turnuva_takim'
  | 'fasilitator_referans'
  | 'haftalik_seri';

export interface NxKurali {
  eylem: NxEylem;
  ad: string;
  nx: number;
  /** Sınır penceresi: tek seferlik, günlük N, modül/etkinlik başına ya da sınırsız. */
  limit:
    | { tur: 'tek_sefer' }
    | { tur: 'gunluk'; adet: number }
    | { tur: 'anahtar_basina' }
    | { tur: 'sinirsiz' }
    | { tur: 'toplam'; adet: number };
}

/** Md. 11.1 kazanım tablosu. */
export const NX_KURALLARI: Record<NxEylem, NxKurali> = {
  profil_tamamlama: { eylem: 'profil_tamamlama', ad: 'Profil tamamlama', nx: 50, limit: { tur: 'tek_sefer' } },
  kaynak_indirme: { eylem: 'kaynak_indirme', ad: 'Ücretsiz kaynak indirme', nx: 5, limit: { tur: 'gunluk', adet: 3 } },
  modul_tamamlama: { eylem: 'modul_tamamlama', ad: 'Eğitim modülü tamamlama', nx: 100, limit: { tur: 'anahtar_basina' } },
  webinar_katilim: { eylem: 'webinar_katilim', ad: 'Webinar canlı katılım', nx: 75, limit: { tur: 'anahtar_basina' } },
  uygulama_raporu: { eylem: 'uygulama_raporu', ad: 'Onaylı uygulama raporu', nx: 300, limit: { tur: 'anahtar_basina' } },
  master_geri_bildirim: { eylem: 'master_geri_bildirim', ad: 'Master geri bildirimi alma', nx: 50, limit: { tur: 'anahtar_basina' } },
  forum_cozum: { eylem: 'forum_cozum', ad: 'Forumda çözüm işaretlenen cevap', nx: 40, limit: { tur: 'anahtar_basina' } },
  oyun_varyanti: { eylem: 'oyun_varyanti', ad: 'Onaylı oyun varyantı paylaşımı', nx: 250, limit: { tur: 'anahtar_basina' } },
  turnuva_hakemligi: { eylem: 'turnuva_hakemligi', ad: 'Turnuva hakemliği', nx: 400, limit: { tur: 'anahtar_basina' } },
  turnuva_takim: { eylem: 'turnuva_takim', ad: 'Turnuvaya takım getirme', nx: 500, limit: { tur: 'anahtar_basina' } },
  fasilitator_referans: { eylem: 'fasilitator_referans', ad: 'Yeni fasilitatör referansı', nx: 600, limit: { tur: 'anahtar_basina' } },
  haftalik_seri: { eylem: 'haftalik_seri', ad: 'Haftalık aktiflik serisi', nx: 25, limit: { tur: 'anahtar_basina' } },
};

/** Md. 11.1 — haftalık seri 25 × hafta, en çok 8 hafta. */
export const SERI_MAKS_HAFTA = 8;

export function haftalikSeriNx(hafta: number): number {
  const h = Math.max(0, Math.min(Math.trunc(hafta), SERI_MAKS_HAFTA));
  return h * NX_KURALLARI.haftalik_seri.nx;
}

export interface Rutbe {
  kod: string;
  ad: string;
  min: number;
  hak: string;
}

/** Md. 11.2 rütbeler. */
export const RUTBELER: Rutbe[] = [
  { kod: 'kasif', ad: 'Kâşif', min: 0, hak: 'Ücretsiz kaynaklar' },
  { kod: 'oyuncu', ad: 'Oyuncu', min: 500, hak: "PDF kütüphanesi · Kademe 1'de %10 indirim" },
  { kod: 'rehber', ad: 'Rehber', min: 2000, hak: 'Aylık kapalı webinar · materyalde ek %5' },
  { kod: 'usta', ad: 'Usta', min: 6000, hak: 'Turnuva kontenjan önceliği · beta erişim' },
  { kod: 'efsane', ad: 'Efsane', min: 15000, hak: 'Master Fasilitatör daveti değerlendirmesi' },
];

export interface RutbeDurumu {
  mevcut: Rutbe;
  sonraki: Rutbe | null;
  sonrakiyeKalan: number;
  ilerlemeYuzdesi: number;
}

/** Rütbe **yaşam boyu kazanılan** NX'e göre hesaplanır (Md. 11.4). */
export function rutbeHesapla(toplamKazanim: number): RutbeDurumu {
  let mevcut = RUTBELER[0]!;
  for (const r of RUTBELER) {
    if (toplamKazanim >= r.min) mevcut = r;
  }
  const idx = RUTBELER.indexOf(mevcut);
  const sonraki = RUTBELER[idx + 1] ?? null;
  const sonrakiyeKalan = sonraki ? sonraki.min - toplamKazanim : 0;
  const ilerlemeYuzdesi = sonraki
    ? Math.round(((toplamKazanim - mevcut.min) / (sonraki.min - mevcut.min)) * 100)
    : 100;
  return { mevcut, sonraki, sonrakiyeKalan, ilerlemeYuzdesi };
}

export interface HarcamaKalemi {
  kod: string;
  ad: string;
  nx: number;
}

/** Md. 11.3 harcanabilir NX kataloğu. */
export const NX_HARCAMA: HarcamaKalemi[] = [
  { kod: 'materyal_indirimi', ad: 'Materyal siparişinde 500 ₺ indirim', nx: 3000 },
  { kod: 'turnuva_onceligi', ad: 'Turnuva ev sahipliği başvuru önceliği', nx: 5000 },
  { kod: 'k2_indirimi', ad: 'Kademe 2 eğitiminde %20 indirim', nx: 8000 },
  { kod: 'zirve_kontenjani', ad: 'Fasilitatör Zirvesi kontenjanı', nx: 12000 },
];

export const NX_HARCAMA_INDEKS = new Map(NX_HARCAMA.map((h) => [h.kod, h]));

export interface NxKaydi {
  eylem: NxEylem | 'harcama' | 'geri_alma';
  /** Limit denetiminin dayandığı benzersiz anahtar (modül kodu, rapor id, vb.). */
  anahtar: string | null;
  nx: number;
  tarih: string;
}

export interface NxBakiyesi {
  toplamKazanim: number;
  toplamHarcama: number;
  bakiye: number;
  rutbe: RutbeDurumu;
}

export function bakiyeHesapla(kayitlar: readonly NxKaydi[]): NxBakiyesi {
  let kazanim = 0;
  let harcama = 0;
  for (const k of kayitlar) {
    if (k.nx >= 0) kazanim += k.nx;
    else harcama += -k.nx;
  }
  return {
    toplamKazanim: kazanim,
    toplamHarcama: harcama,
    bakiye: kazanim - harcama,
    rutbe: rutbeHesapla(kazanim),
  };
}

export type NxKazanimSonucu =
  | { kabul: true; nx: number; kural: NxKurali }
  | { kabul: false; sebep: string };

export interface KazanimBaglami {
  /** Aynı eylem için daha önce yazılmış kayıtlar. */
  oncekiler: readonly NxKaydi[];
  /** Değerlendirme anı (ISO). Günlük limitler bu güne göre sayılır. */
  simdi: Date;
  /** Limit anahtarı — 'anahtar_basina' kurallarında zorunlu. */
  anahtar?: string | null;
  /** Haftalık seri gibi değişken puanlı eylemler için çarpan. */
  hafta?: number;
}

/**
 * Bir NX kazanımının Md. 11.1'deki sınırlara uyup uymadığını belirler.
 * Yazma işlemi çağıranın sorumluluğundadır; bu fonksiyon saf bir karardır.
 */
export function nxKazanimDegerlendir(eylem: NxEylem, ctx: KazanimBaglami): NxKazanimSonucu {
  const kural = NX_KURALLARI[eylem];
  const ayni = ctx.oncekiler.filter((k) => k.eylem === eylem);

  switch (kural.limit.tur) {
    case 'tek_sefer':
      if (ayni.length > 0) return { kabul: false, sebep: 'Bu NX yalnız bir kez kazanılır.' };
      break;
    case 'gunluk': {
      const gun = ctx.simdi.toISOString().slice(0, 10);
      const bugun = ayni.filter((k) => k.tarih.slice(0, 10) === gun).length;
      if (bugun >= kural.limit.adet) {
        return { kabul: false, sebep: `Günlük sınır aşıldı (${kural.limit.adet}/gün).` };
      }
      break;
    }
    case 'anahtar_basina': {
      const anahtar = ctx.anahtar;
      if (!anahtar) return { kabul: false, sebep: 'Bu eylem için limit anahtarı zorunludur.' };
      if (ayni.some((k) => k.anahtar === anahtar)) {
        return { kabul: false, sebep: 'Bu kayıt için NX zaten yazılmış.' };
      }
      break;
    }
    case 'toplam':
      if (ayni.length >= kural.limit.adet) {
        return { kabul: false, sebep: `Toplam sınır aşıldı (${kural.limit.adet}).` };
      }
      break;
    case 'sinirsiz':
      break;
  }

  const nx = eylem === 'haftalik_seri' ? haftalikSeriNx(ctx.hafta ?? 1) : kural.nx;
  if (nx <= 0) return { kabul: false, sebep: 'Hesaplanan NX sıfır.' };
  return { kabul: true, nx, kural };
}

export type HarcamaSonucu =
  | { kabul: true; kalem: HarcamaKalemi; kalanBakiye: number }
  | { kabul: false; sebep: string };

export function nxHarcamaDegerlendir(kod: string, bakiye: number): HarcamaSonucu {
  const kalem = NX_HARCAMA_INDEKS.get(kod);
  if (!kalem) return { kabul: false, sebep: 'Tanımsız harcama kalemi.' };
  if (bakiye < kalem.nx) {
    return { kabul: false, sebep: `Yetersiz bakiye: ${kalem.nx} NX gerekiyor, ${bakiye} NX var.` };
  }
  return { kabul: true, kalem, kalanBakiye: bakiye - kalem.nx };
}
