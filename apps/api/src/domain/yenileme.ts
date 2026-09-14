/**
 * Sertifika geçerliliği, yenileme koşulu ve kademe düşüşü.
 * Kaynak: Yönetmelik Md. 4.2–4.4 (yükümlülükler), Md. 6.2–6.4, Md. 3.3.
 */
import { EK_SURE_AY, HATIRLATMA_GUNLERI, altKademe } from './kademe.ts';
import type { Kademe } from './types.ts';

export interface YenilemeKosulu {
  kademe: 1 | 2 | 3;
  aciklama: string;
  ucret: number;
  gerekenUygulama: number;
  gerekenAtolye: number;
  gerekenEtkinlik: number;
  gerekenMentorluk: number;
  /** true → uygulama VEYA atölye yeterli; false → tüm kalemler birlikte aranır. */
  veyaMantigi: boolean;
}

/** Md. 6.2 yenileme tablosu. */
export const YENILEME_KOSULLARI: Record<1 | 2 | 3, YenilemeKosulu> = {
  1: {
    kademe: 1,
    aciklama: 'Yılda ≥6 onaylı uygulama veya 2 atölye',
    ucret: 1200,
    gerekenUygulama: 6,
    gerekenAtolye: 2,
    gerekenEtkinlik: 0,
    gerekenMentorluk: 0,
    veyaMantigi: true,
  },
  2: {
    kademe: 2,
    aciklama: 'Yılda ≥1 etkinlik ve ≥2 mentorluk ve ≥8 uygulama',
    ucret: 1800,
    gerekenUygulama: 8,
    gerekenAtolye: 0,
    gerekenEtkinlik: 1,
    gerekenMentorluk: 2,
    veyaMantigi: false,
  },
  3: {
    kademe: 3,
    aciklama: 'Md. 4.4 yükümlülük tablosu (4 kohort · 2 kalibrasyon · 4 ürün kurulu · 4 jüri dosyası)',
    ucret: 0,
    gerekenUygulama: 0,
    gerekenAtolye: 0,
    gerekenEtkinlik: 1,
    gerekenMentorluk: 0,
    veyaMantigi: false,
  },
}; 

/** Md. 4.4 — Master yükümlülük minimumları. */
export const MASTER_YUKUMLULUK = {
  kohort: 4,
  bolgeEtkinligi: 1,
  kalibrasyon: 2,
  urunKurulu: 4,
  urunOnerisi: 1,
  juriDosyasi: 4,
  itirazOraniMaks: 0.05,
  kohortTamamlamaMin: 0.7,
} as const;

export interface AktiflikOzeti {
  onayliUygulama: number;
  atolye: number;
  etkinlik: number;
  mentorluk: number;
  /** Master için ek sayaçlar; diğer kademelerde yok sayılır. */
  kohort?: number;
  kalibrasyon?: number;
  urunKurulu?: number;
  juriDosyasi?: number;
}

export interface YenilemeDegerlendirmesi {
  karsilandi: boolean;
  kosul: YenilemeKosulu;
  eksikler: string[];
}

export function yenilemeDegerlendir(
  kademe: 1 | 2 | 3,
  aktiflik: AktiflikOzeti,
): YenilemeDegerlendirmesi {
  const kosul = YENILEME_KOSULLARI[kademe];
  const eksikler: string[] = [];

  if (kademe === 1) {
    const uygulamaOk = aktiflik.onayliUygulama >= kosul.gerekenUygulama;
    const atolyeOk = aktiflik.atolye >= kosul.gerekenAtolye;
    if (!uygulamaOk && !atolyeOk) {
      eksikler.push(
        `${kosul.gerekenUygulama} onaylı uygulama (var: ${aktiflik.onayliUygulama}) veya ` +
          `${kosul.gerekenAtolye} atölye (var: ${aktiflik.atolye})`,
      );
    }
  } else if (kademe === 2) {
    if (aktiflik.etkinlik < kosul.gerekenEtkinlik)
      eksikler.push(`${kosul.gerekenEtkinlik} etkinlik/turnuva (var: ${aktiflik.etkinlik})`);
    if (aktiflik.mentorluk < kosul.gerekenMentorluk)
      eksikler.push(`${kosul.gerekenMentorluk} mentorluk oturumu (var: ${aktiflik.mentorluk})`);
    if (aktiflik.onayliUygulama < kosul.gerekenUygulama)
      eksikler.push(`${kosul.gerekenUygulama} onaylı uygulama (var: ${aktiflik.onayliUygulama})`);
  } else {
    const m = MASTER_YUKUMLULUK;
    if ((aktiflik.kohort ?? 0) < m.kohort)
      eksikler.push(`${m.kohort} Kademe 1 kohortu (var: ${aktiflik.kohort ?? 0})`);
    if ((aktiflik.kalibrasyon ?? 0) < m.kalibrasyon)
      eksikler.push(`${m.kalibrasyon} kalibrasyon oturumu (var: ${aktiflik.kalibrasyon ?? 0})`);
    if ((aktiflik.urunKurulu ?? 0) < m.urunKurulu)
      eksikler.push(`${m.urunKurulu} ürün kurulu toplantısı (var: ${aktiflik.urunKurulu ?? 0})`);
    if ((aktiflik.juriDosyasi ?? 0) < m.juriDosyasi)
      eksikler.push(`${m.juriDosyasi} tasarım jürisi dosyası (var: ${aktiflik.juriDosyasi ?? 0})`);
    if (aktiflik.etkinlik < m.bolgeEtkinligi)
      eksikler.push(`${m.bolgeEtkinligi} bölge etkinliği (var: ${aktiflik.etkinlik})`);
  }

  return { karsilandi: eksikler.length === 0, kosul, eksikler };
}

export type YenilemeAsamasi =
  | { asama: 'gecerli'; kalanGun: number }
  | { asama: 'hatirlatma'; kalanGun: number; esik: number }
  | { asama: 'ek_sure'; bitisTarihi: string; kalanGun: number }
  | { asama: 'dusus'; yeniKademe: Kademe };

const GUN_MS = 86_400_000;

export function gunFarki(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / GUN_MS);
}

/**
 * Md. 6.3 + 6.4 — geçerlilik tarihine göre üyenin hangi aşamada olduğunu döndürür.
 * Yenileme koşulu karşılanmamışsa 3 aylık ek süre işler, sonrasında kademe düşer.
 */
export function yenilemeAsamasi(
  kademe: Kademe,
  gecerlilikSonu: Date,
  simdi: Date,
  kosulKarsilandi: boolean,
): YenilemeAsamasi {
  const kalan = gunFarki(gecerlilikSonu, simdi);

  if (kalan > 0) {
    // Eşikler [90, 30, 7] azalan sırada; kalan güne **en dar** oturan band seçilir
    // (30 gün kala 90 değil 30 hatırlatması gönderilir).
    const esik = [...HATIRLATMA_GUNLERI].sort((a, b) => a - b).find((g) => kalan <= g);
    if (esik !== undefined) return { asama: 'hatirlatma', kalanGun: kalan, esik };
    return { asama: 'gecerli', kalanGun: kalan };
  }

  if (kosulKarsilandi) return { asama: 'gecerli', kalanGun: kalan };

  const ekSureBitis = new Date(gecerlilikSonu);
  ekSureBitis.setUTCMonth(ekSureBitis.getUTCMonth() + EK_SURE_AY);
  const ekKalan = gunFarki(ekSureBitis, simdi);
  if (ekKalan >= 0) {
    return { asama: 'ek_sure', bitisTarihi: ekSureBitis.toISOString(), kalanGun: ekKalan };
  }
  return { asama: 'dusus', yeniKademe: altKademe(kademe) };
}

/** Md. 6.3 — belirli bir gün eşiğinde hatırlatma gönderilmeli mi? */
export function hatirlatmaGerekli(kalanGun: number): number | null {
  return HATIRLATMA_GUNLERI.find((g) => g === kalanGun) ?? null;
}
