/**
 * node:http üzerine ince bir yönlendirici.
 * Bağımlılık eklemeden desen eşleme, JSON gövde okuma, kimlik bağlamı
 * ve tek noktadan hata dönüşümü sağlar.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { ApiHatasi, hatalar } from './hata.ts';
import { jetonCoz } from './kimlik.ts';
import { tek } from '../db/index.ts';
import type { Kademe, UyeDurumu } from '../domain/types.ts';

export interface OturumSahibi {
  id: string;
  adSoyad: string;
  eposta: string;
  kademe: Kademe;
  durum: UyeDurumu;
  rol: 'uye' | 'epnexus';
  il: string;
  ilce: string;
  jti: string;
}

export interface Baglam {
  istek: IncomingMessage;
  yanit: ServerResponse;
  params: Record<string, string>;
  sorgu: URLSearchParams;
  govde: () => Promise<unknown>;
  /** Oturum yoksa null. */
  kullanici: OturumSahibi | null;
}

export type Isleyici = (ctx: Baglam) => Promise<unknown> | unknown;

interface Rota {
  yontem: string;
  parcalar: string[];
  isleyici: Isleyici;
}

export class Yonlendirici {
  private rotalar: Rota[] = [];

  ekle(yontem: string, desen: string, isleyici: Isleyici): this {
    this.rotalar.push({
      yontem,
      parcalar: desen.split('/').filter(Boolean),
      isleyici,
    });
    return this;
  }

  get(d: string, h: Isleyici) { return this.ekle('GET', d, h); }
  post(d: string, h: Isleyici) { return this.ekle('POST', d, h); }
  patch(d: string, h: Isleyici) { return this.ekle('PATCH', d, h); }
  put(d: string, h: Isleyici) { return this.ekle('PUT', d, h); }
  sil(d: string, h: Isleyici) { return this.ekle('DELETE', d, h); }

  /** Başka bir yönlendiricinin rotalarını önek altına bağlar. */
  bagla(onek: string, alt: Yonlendirici): this {
    const onekParcalari = onek.split('/').filter(Boolean);
    for (const r of alt.rotalar) {
      this.rotalar.push({ ...r, parcalar: [...onekParcalari, ...r.parcalar] });
    }
    return this;
  }

  eslestir(yontem: string, yol: string): { rota: Rota; params: Record<string, string> } | null {
    const parcalar = yol.split('/').filter(Boolean);
    for (const rota of this.rotalar) {
      if (rota.yontem !== yontem) continue;
      if (rota.parcalar.length !== parcalar.length) continue;
      const params: Record<string, string> = {};
      let uyum = true;
      for (let i = 0; i < rota.parcalar.length; i++) {
        const desen = rota.parcalar[i]!;
        const deger = parcalar[i]!;
        if (desen.startsWith(':')) params[desen.slice(1)] = decodeURIComponent(deger);
        else if (desen !== deger) { uyum = false; break; }
      }
      if (uyum) return { rota, params };
    }
    return null;
  }

  /** Yolun başka bir yöntemle tanımlı olup olmadığı — 405 için. */
  yontemVarMi(yol: string): boolean {
    const parcalar = yol.split('/').filter(Boolean);
    return this.rotalar.some(
      (r) =>
        r.parcalar.length === parcalar.length &&
        r.parcalar.every((p, i) => p.startsWith(':') || p === parcalar[i]),
    );
  }
}

const MAKS_GOVDE = 1_000_000; // 1 MB

async function govdeOku(istek: IncomingMessage): Promise<unknown> {
  const parcalar: Buffer[] = [];
  let boyut = 0;
  for await (const p of istek) {
    boyut += (p as Buffer).length;
    if (boyut > MAKS_GOVDE) throw hatalar.gecersizIstek('İstek gövdesi çok büyük (maks. 1 MB).');
    parcalar.push(p as Buffer);
  }
  if (parcalar.length === 0) return {};
  const metin = Buffer.concat(parcalar).toString('utf8');
  if (!metin.trim()) return {};
  try {
    return JSON.parse(metin);
  } catch {
    throw hatalar.gecersizIstek('İstek gövdesi geçerli JSON değil.');
  }
}

function kullaniciCoz(istek: IncomingMessage): OturumSahibi | null {
  const baslik = istek.headers.authorization;
  if (!baslik?.startsWith('Bearer ')) return null;
  const icerik = jetonCoz(baslik.slice(7).trim());
  const satir = tek<{
    id: string; ad_soyad: string; eposta: string; kademe: number;
    durum: UyeDurumu; rol: 'uye' | 'epnexus'; il: string; ilce: string;
  }>('SELECT id, ad_soyad, eposta, kademe, durum, rol, il, ilce FROM uyeler WHERE id = ?', icerik.uyeId);
  if (!satir) throw hatalar.yetkisiz('Üye kaydı bulunamadı.');
  return {
    id: satir.id, adSoyad: satir.ad_soyad, eposta: satir.eposta,
    kademe: satir.kademe as Kademe, durum: satir.durum, rol: satir.rol,
    il: satir.il, ilce: satir.ilce, jti: icerik.jti,
  };
}

export function jsonYaz(yanit: ServerResponse, durum: number, govde: unknown): void {
  const metin = JSON.stringify(govde, null, 2);
  yanit.writeHead(durum, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(metin),
    'cache-control': 'no-store',
  });
  yanit.end(metin);
}

/** Oturum zorunlu — yoksa 401. */
export function gerekliKullanici(ctx: Baglam): OturumSahibi {
  if (!ctx.kullanici) throw hatalar.yetkisiz();
  return ctx.kullanici;
}

/** Md. 8/4 — askıdaki üyenin hakları donar; iptal edilen üye işlem yapamaz. */
export function aktifKullanici(ctx: Baglam): OturumSahibi {
  const k = gerekliKullanici(ctx);
  if (k.durum === 'iptal') throw hatalar.yasak('Üyeliğiniz iptal edilmiştir (Md. 6.4).');
  if (k.durum === 'askida') throw hatalar.yasak('Üyeliğiniz askıdadır; unvan ve haklar donmuştur (Md. 8/4).');
  return k;
}

/** Belirli bir kademenin altındaki üyeleri engeller. */
export function enAzKademe(ctx: Baglam, kademe: Kademe): OturumSahibi {
  const k = aktifKullanici(ctx);
  if (k.rol === 'epnexus') return k;
  if (k.kademe < kademe) {
    throw hatalar.yasak(`Bu işlem için en az Kademe ${kademe} yetkisi gerekir.`);
  }
  return k;
}

export function epnexusEkibi(ctx: Baglam): OturumSahibi {
  const k = aktifKullanici(ctx);
  if (k.rol !== 'epnexus') throw hatalar.yasak('Bu işlem EPNEXUS ekibine ayrılmıştır.');
  return k;
}

export interface IsleyiciSecenekleri {
  yonlendirici: Yonlendirici;
  /** Rota bulunamazsa devreye giren yedek (statik dosya sunumu gibi). */
  yedek?: (istek: IncomingMessage, yanit: ServerResponse) => Promise<boolean> | boolean;
}

export function istekIsleyici(opts: IsleyiciSecenekleri) {
  return async (istek: IncomingMessage, yanit: ServerResponse): Promise<void> => {
    const url = new URL(istek.url ?? '/', `http://${istek.headers.host ?? 'localhost'}`);

    yanit.setHeader('x-content-type-options', 'nosniff');
    yanit.setHeader('referrer-policy', 'same-origin');

    if (istek.method === 'OPTIONS') {
      yanit.writeHead(204, {
        'access-control-allow-methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
        'access-control-allow-headers': 'content-type,authorization',
      });
      yanit.end();
      return;
    }

    const eslesme = opts.yonlendirici.eslestir(istek.method ?? 'GET', url.pathname);

    if (!eslesme) {
      if (opts.yedek && (await opts.yedek(istek, yanit))) return;
      if (opts.yonlendirici.yontemVarMi(url.pathname)) {
        jsonYaz(yanit, 405, { hata: 'Bu yol için yöntem desteklenmiyor.' });
        return;
      }
      jsonYaz(yanit, 404, { hata: 'Uç bulunamadı.', yol: url.pathname });
      return;
    }

    try {
      const ctx: Baglam = {
        istek,
        yanit,
        params: eslesme.params,
        sorgu: url.searchParams,
        govde: () => govdeOku(istek),
        kullanici: kullaniciCoz(istek),
      };
      const sonuc = await eslesme.rota.isleyici(ctx);
      if (yanit.headersSent) return;
      if (sonuc === undefined) {
        yanit.writeHead(204).end();
        return;
      }
      jsonYaz(yanit, 200, sonuc);
    } catch (e) {
      if (yanit.headersSent) return;
      if (e instanceof ApiHatasi) {
        jsonYaz(yanit, e.durum, { hata: e.message, detay: e.detay ?? undefined });
        return;
      }
      const mesaj = e instanceof Error ? e.message : String(e);
      console.error('[epnexus] beklenmeyen hata:', e);
      jsonYaz(yanit, 500, { hata: 'Sunucu hatası.', detay: process.env.NODE_ENV === 'production' ? undefined : mesaj });
    }
  };
}
