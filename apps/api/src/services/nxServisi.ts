/**
 * NX defteri işlemleri — Yönetmelik Md. 11.
 * Limit denetimi domain/nx.ts'te, yazma burada.
 */
import { calistir, tumu, denetimYaz } from '../db/index.ts';
import {
  bakiyeHesapla, nxKazanimDegerlendir, nxHarcamaDegerlendir,
  type NxEylem, type NxKaydi, type NxBakiyesi,
} from '../domain/nx.ts';
import { hatalar } from '../lib/hata.ts';

interface DefterSatiri {
  eylem: string;
  anahtar: string | null;
  nx: number;
  tarih: string;
  aciklama: string | null;
}

export function defterOku(uyeId: string): NxKaydi[] {
  return tumu<DefterSatiri>(
    'SELECT eylem, anahtar, nx, tarih FROM nx_defteri WHERE uye_id = ? ORDER BY id',
    uyeId,
  ).map((s) => ({ eylem: s.eylem as NxKaydi['eylem'], anahtar: s.anahtar, nx: s.nx, tarih: s.tarih }));
}

export function bakiye(uyeId: string): NxBakiyesi {
  return bakiyeHesapla(defterOku(uyeId));
}

export interface KazanimSonucu {
  yazildi: boolean;
  nx: number;
  sebep?: string;
  bakiye: NxBakiyesi;
}

/**
 * NX yazar. Md. 11.1 sınırları karşılanmıyorsa sessizce atlar —
 * çağıran akışın (rapor onayı, modül tamamlama) başarısı buna bağlı değildir.
 */
export function nxYaz(
  uyeId: string,
  eylem: NxEylem,
  opts: { anahtar?: string | null; hafta?: number; aciklama?: string } = {},
): KazanimSonucu {
  const oncekiler = defterOku(uyeId);
  const karar = nxKazanimDegerlendir(eylem, {
    oncekiler,
    simdi: new Date(),
    anahtar: opts.anahtar ?? null,
    hafta: opts.hafta,
  });

  if (!karar.kabul) {
    return { yazildi: false, nx: 0, sebep: karar.sebep, bakiye: bakiyeHesapla(oncekiler) };
  }

  calistir(
    'INSERT INTO nx_defteri (uye_id, eylem, anahtar, nx, aciklama, tarih) VALUES (?,?,?,?,?,?)',
    uyeId, eylem, opts.anahtar ?? null, karar.nx, opts.aciklama ?? karar.kural.ad, new Date().toISOString(),
  );
  return { yazildi: true, nx: karar.nx, bakiye: bakiye(uyeId) };
}

export function nxHarca(uyeId: string, kod: string) {
  const mevcut = bakiye(uyeId);
  const karar = nxHarcamaDegerlendir(kod, mevcut.bakiye);
  if (!karar.kabul) throw hatalar.gecersizIstek(karar.sebep);

  calistir(
    'INSERT INTO nx_defteri (uye_id, eylem, anahtar, nx, aciklama, tarih) VALUES (?,?,?,?,?,?)',
    uyeId, 'harcama', `${kod}:${Date.now()}`, -karar.kalem.nx, karar.kalem.ad, new Date().toISOString(),
  );
  denetimYaz(uyeId, 'nx_harcama', kod, { nx: karar.kalem.nx });
  return { kalem: karar.kalem, bakiye: bakiye(uyeId) };
}

/**
 * Md. 11.4 — sahte rapor tespitinde ilgili NX geri alınır.
 * Kazanım kaydı silinmez; dengeleyici negatif kayıt yazılır ki denetim izi kalsın.
 */
export function nxGeriAl(uyeId: string, eylem: NxEylem, anahtar: string, gerekce: string): number {
  const kayitlar = tumu<DefterSatiri>(
    'SELECT eylem, anahtar, nx, tarih, aciklama FROM nx_defteri WHERE uye_id = ? AND eylem = ? AND anahtar = ?',
    uyeId, eylem, anahtar,
  );
  const toplam = kayitlar.reduce((s, k) => s + k.nx, 0);
  if (toplam <= 0) return 0;

  calistir(
    'INSERT INTO nx_defteri (uye_id, eylem, anahtar, nx, aciklama, tarih) VALUES (?,?,?,?,?,?)',
    uyeId, 'geri_alma', `${eylem}:${anahtar}:${Date.now()}`, -toplam,
    `Md. 11.4 geri alma — ${gerekce}`, new Date().toISOString(),
  );
  denetimYaz(null, 'nx_geri_alma', uyeId, { eylem, anahtar, nx: toplam, gerekce });
  return toplam;
}

/** Md. 11.1 — haftalık aktiflik serisi; son 8 haftanın kaçında onaylı rapor var. */
export function haftalikSeriHesapla(uyeId: string, simdi = new Date()): number {
  const sekizHaftaOnce = new Date(simdi.getTime() - 8 * 7 * 86_400_000).toISOString();
  const raporlar = tumu<{ tarih: string }>(
    "SELECT tarih FROM uygulama_raporlari WHERE uye_id = ? AND durum = 'onayli' AND tarih >= ? ORDER BY tarih DESC",
    uyeId, sekizHaftaOnce,
  );
  const haftalar = new Set(
    raporlar.map((r) => Math.floor((simdi.getTime() - new Date(r.tarih).getTime()) / (7 * 86_400_000))),
  );
  let seri = 0;
  for (let h = 0; h < 8; h++) {
    if (!haftalar.has(h)) break;
    seri++;
  }
  return seri;
}
