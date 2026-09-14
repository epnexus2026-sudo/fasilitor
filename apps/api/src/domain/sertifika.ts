/**
 * Sertifika numaralandırma, doğrulama ve Open Badges 3.0 uyumu.
 * Kaynak: Yönetmelik Md. 6.1 (QR doğrulamalı, Open Badges 3.0, benzersiz numara),
 *         Md. 6.2 geçerlilik, Md. 6.4 askı/iptal, EK-A A.1 unvanlar.
 */
import { createHmac } from 'node:crypto';
import { KADEME_MARKA_UNVANI, type Kademe } from './types.ts';
import { GECERLILIK_YILI } from './kademe.ts';

/** Md. 6.1 örneği: EPN-FAC-K1-2026-0037 */
export const SERTIFIKA_ONEKI = 'EPN-FAC';

export interface SertifikaNumarasi {
  onek: string;
  kademe: Kademe;
  yil: number;
  sira: number;
  tam: string;
}

export function sertifikaNoUret(kademe: 1 | 2 | 3, yil: number, sira: number): SertifikaNumarasi {
  const tam = `${SERTIFIKA_ONEKI}-K${kademe}-${yil}-${String(sira).padStart(4, '0')}`;
  return { onek: SERTIFIKA_ONEKI, kademe, yil, sira, tam };
}

const NO_DESENI = /^EPN-FAC-K([123])-(\d{4})-(\d{4})$/;

export function sertifikaNoAyristir(no: string): SertifikaNumarasi | null {
  const m = NO_DESENI.exec(no.trim().toUpperCase());
  if (!m) return null;
  return {
    onek: SERTIFIKA_ONEKI,
    kademe: Number(m[1]) as Kademe,
    yil: Number(m[2]),
    sira: Number(m[3]),
    tam: no.trim().toUpperCase(),
  };
}

export const DOGRULAMA_TABANI = 'https://epnexusgames.com/dogrula';

export function dogrulamaUrl(no: string, taban = DOGRULAMA_TABANI): string {
  return `${taban}/${encodeURIComponent(no)}`;
}

/**
 * QR içeriğinin sahteciliğe karşı imzalanması.
 * Numara tek başına tahmin edilebilir olduğundan doğrulama bağlantısına
 * kısa bir HMAC etiketi eklenir; doğrulama uçları bu etiketi kontrol eder.
 */
export function dogrulamaEtiketi(no: string, gizliAnahtar: string): string {
  return createHmac('sha256', gizliAnahtar).update(no.toUpperCase()).digest('base64url').slice(0, 16);
}

export function etiketDogrula(no: string, etiket: string, gizliAnahtar: string): boolean {
  const beklenen = dogrulamaEtiketi(no, gizliAnahtar);
  if (beklenen.length !== etiket.length) return false;
  let fark = 0;
  for (let i = 0; i < beklenen.length; i++) fark |= beklenen.charCodeAt(i) ^ etiket.charCodeAt(i);
  return fark === 0;
}

export type SertifikaDurumu = 'gecerli' | 'suresi_doldu' | 'askida' | 'iptal';

export interface Sertifika {
  no: string;
  uyeId: string;
  adSoyad: string;
  kademe: 1 | 2 | 3;
  verilis: string;
  gecerlilik: string;
  durum: SertifikaDurumu;
  kurucuKohort: boolean;
  /** Md. 4.4 — sertifika kararını veren Master. */
  kararVerenMaster: string | null;
  /** Ay 1 koşulu: protokol yoksa "MEB'de geçerli" ifadesi kullanılmaz. */
  universiteSem: string | null;
}

export function sertifikaOlustur(opts: {
  no: string;
  uyeId: string;
  adSoyad: string;
  kademe: 1 | 2 | 3;
  verilis: Date;
  kurucuKohort?: boolean;
  kararVerenMaster?: string | null;
  universiteSem?: string | null;
}): Sertifika {
  const gecerlilik = new Date(opts.verilis);
  gecerlilik.setUTCFullYear(gecerlilik.getUTCFullYear() + GECERLILIK_YILI[opts.kademe]);
  return {
    no: opts.no,
    uyeId: opts.uyeId,
    adSoyad: opts.adSoyad,
    kademe: opts.kademe,
    verilis: opts.verilis.toISOString(),
    gecerlilik: gecerlilik.toISOString(),
    durum: 'gecerli',
    kurucuKohort: opts.kurucuKohort ?? false,
    kararVerenMaster: opts.kararVerenMaster ?? null,
    universiteSem: opts.universiteSem ?? null,
  };
}

export interface DogrulamaSonucu {
  bulundu: boolean;
  gecerli: boolean;
  durum: SertifikaDurumu | null;
  unvan: string | null;
  mesaj: string;
  sertifika: Omit<Sertifika, 'uyeId'> | null;
}

export function sertifikaDogrula(
  sertifika: Sertifika | null,
  simdi: Date = new Date(),
): DogrulamaSonucu {
  if (!sertifika) {
    return { bulundu: false, gecerli: false, durum: null, unvan: null,
      mesaj: 'Bu numarayla kayıtlı sertifika bulunamadı.', sertifika: null };
  }
  const { uyeId: _uyeId, ...kamuya } = sertifika;
  const suresiDoldu = new Date(sertifika.gecerlilik) < simdi;
  const durum: SertifikaDurumu =
    sertifika.durum === 'gecerli' && suresiDoldu ? 'suresi_doldu' : sertifika.durum;

  const mesajlar: Record<SertifikaDurumu, string> = {
    gecerli: 'Sertifika geçerlidir.',
    suresi_doldu: 'Sertifikanın geçerlilik süresi dolmuştur (Md. 6.2).',
    askida: 'Sertifika askıdadır; unvan ve haklar donmuştur (Md. 8/4).',
    iptal: 'Sertifika iptal edilmiştir; unvan geri alınmıştır (Md. 6.4).',
  };

  return {
    bulundu: true,
    gecerli: durum === 'gecerli',
    durum,
    unvan: durum === 'gecerli' ? KADEME_MARKA_UNVANI[sertifika.kademe] : null,
    mesaj: mesajlar[durum],
    sertifika: { ...kamuya, durum },
  };
}

/**
 * Open Badges 3.0 (1EdTech) uyumlu AchievementCredential üretir.
 * Md. 6.1 — dijital sertifika Open Badges 3.0 uyumludur.
 */
export function openBadgeUret(
  s: Sertifika,
  opts: { issuerId: string; issuerAd: string; dogrulamaTabani?: string },
): Record<string, unknown> {
  const taban = opts.dogrulamaTabani ?? DOGRULAMA_TABANI;
  const unvan = KADEME_MARKA_UNVANI[s.kademe] ?? 'EPNEXUS Fasilitatörü';
  return {
    '@context': [
      'https://www.w3.org/ns/credentials/v2',
      'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json',
    ],
    id: dogrulamaUrl(s.no, taban),
    type: ['VerifiableCredential', 'OpenBadgeCredential'],
    name: unvan,
    issuer: {
      id: opts.issuerId,
      type: ['Profile'],
      name: opts.issuerAd,
    },
    validFrom: s.verilis,
    validUntil: s.gecerlilik,
    credentialSubject: {
      type: ['AchievementSubject'],
      identifier: [{ type: 'IdentityObject', identityType: 'name', hashed: false, identityHash: s.adSoyad }],
      achievement: {
        id: `${taban}/kazanim/kademe-${s.kademe}`,
        type: ['Achievement'],
        name: unvan,
        description: `EPNEXUS Fasilitatör Ağı Kademe ${s.kademe} sertifikasyonu.`,
        criteria: {
          narrative:
            `EPNEXUS Fasilitatör Ağı Yönetmeliği Md. 3.2 uyarınca Kademe ${s.kademe} geçiş koşullarının tamamlanması.`,
        },
      },
    },
    credentialStatus: {
      id: `${taban}/${s.no}/durum`,
      type: 'EPNEXUSCertificateStatus',
      status: s.durum,
    },
  };
}

/** Sertifika HTML şablonundaki yer tutucular (docs/03_Sertifika/EPNEXUS_Sertifika_SABLON.html). */
export interface SablonAlanlari {
  AD_SOYAD: string;
  SERTIFIKA_NO: string;
  VERILIS: string;
  GECERLILIK: string;
  MASTER_FASILITATOR: string;
  UNIVERSITE_SEM: string;
}

const TR_TARIH = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC',
});

export function sablonAlanlari(s: Sertifika): SablonAlanlari {
  return {
    AD_SOYAD: s.adSoyad,
    SERTIFIKA_NO: s.no,
    VERILIS: TR_TARIH.format(new Date(s.verilis)),
    GECERLILIK: TR_TARIH.format(new Date(s.gecerlilik)),
    MASTER_FASILITATOR: s.kararVerenMaster ?? '—',
    // Ay 1 koşulu: SEM protokolü yoksa alan boş bırakılır, "MEB'de geçerli" denmez.
    UNIVERSITE_SEM: s.universiteSem ?? '',
  };
}

export function sablonDoldur(sablon: string, alanlar: SablonAlanlari): string {
  return sablon.replace(/\{\{([A-Z_]+)\}\}/g, (tam, anahtar: string) =>
    anahtar in alanlar ? String(alanlar[anahtar as keyof SablonAlanlari]) : tam,
  );
}
