/**
 * Oyun Atölyesi, jüri değerlendirmesi ve Oyun Havuzu.
 * Kaynak: Oyun Atölyesi Programı (EK-3 rubriği, § 5 jüri, § 6 havuz)
 *         + Yönetmelik Md. 13.6-13.11 katmanlı fikri mülkiyet modeli.
 */
import type { JuriKarari, JuriRubrigi, Kademe, Olgunluk, TelifTuru } from './types.ts';

export interface RubrikBoyutu {
  anahtar: keyof JuriRubrigi;
  ad: string;
  maksPuan: number;
  zayif: string;
  yeterli: string;
  guclu: string;
}

/** EK-3 — Oyun Tasarım Jüri Rubriği (toplam 100 puan). */
export const JURI_RUBRIGI: RubrikBoyutu[] = [
  { anahtar: 'mekanik_kazanim', ad: 'Mekanik–kazanım uyumu', maksPuan: 25,
    zayif: 'Tema giydirme; kazanım oyunun üstünde', yeterli: 'Kazanım oyunda kullanılıyor', guclu: 'Kazanım olmadan oyun çöküyor' },
  { anahtar: 'oynanabilirlik', ad: 'Oynanabilirlik', maksPuan: 20,
    zayif: 'Kural karışık, ilk tur uzun', yeterli: 'Akıyor ama takılmalar var', guclu: '3 dk kural, 5 dk ilk tur, akıcı' },
  { anahtar: 'karar_kalitesi', ad: 'Karar kalitesi', maksPuan: 15,
    zayif: 'Şans belirleyici, karar yok', yeterli: 'Karar var ama tek boyutlu', guclu: 'Her turda anlamlı, çok boyutlu karar' },
  { anahtar: 'geri_bildirim', ad: 'Geri bildirim', maksPuan: 10,
    zayif: 'Yanlış karar görünmüyor', yeterli: 'Kısmen görünüyor', guclu: 'Anında ve net görünüyor' },
  { anahtar: 'test_kaniti', ad: 'Test kanıtı', maksPuan: 15,
    zayif: 'Eksik veya tek grup', yeterli: 'Ölçütü karşılıyor', guclu: 'Ölçütün üstünde, veri zengin' },
  { anahtar: 'revizyon', ad: 'Revizyon niteliği', maksPuan: 10,
    zayif: 'Değişiklik yok veya kozmetik', yeterli: 'Makul revizyon', guclu: 'Veriye dayalı, gerekçeli revizyon' },
  { anahtar: 'uretilebilirlik', ad: 'Üretilebilirlik', maksPuan: 5,
    zayif: 'Basılamaz', yeterli: 'Basılabilir', guclu: 'Maliyet ve bileşen optimize' },
];

export const JURI_TOPLAM_PUAN = JURI_RUBRIGI.reduce((s, b) => s + b.maksPuan, 0); // 100

/** EK-3 barajları: Kademe 1 ≥60 · Kademe 2 ≥70 · Kademe 3 ≥80. */
export const TASARIM_BARAJI: Record<1 | 2 | 3, number> = { 1: 60, 2: 70, 3: 80 };

/** Kademe 2'de ayrıca mekanik–kazanım boyutundan en az 3/5 istenir (25 puanın %60'ı = 15). */
export const K2_MEKANIK_KAZANIM_MIN = 15;

/** § 5.1 jüri yapısı ve karar süreleri (iş günü). */
export const JURI_YAPISI: Record<1 | 2 | 3, { kisi: number; bilesim: string; kararIsGunu: number; urunKuruluOnayi: boolean }> = {
  1: { kisi: 1, bilesim: '1 Master Fasilitatör', kararIsGunu: 10, urunKuruluOnayi: false },
  2: { kisi: 2, bilesim: '1 Master + 1 alan uzmanı (tasarımcının branşından)', kararIsGunu: 20, urunKuruluOnayi: false },
  3: { kisi: 3, bilesim: '2 Master + 1 EPNEXUS ekip üyesi', kararIsGunu: 30, urunKuruluOnayi: true },
};

/** § 6.2 olgunluk düzeyleri. */
export const OLGUNLUK_TANIMI: Record<Olgunluk, { emoji: string; ad: string; kimGorur: string; neYapilabilir: string }> = {
  tohum: { emoji: '🌱', ad: 'Tohum', kimGorur: 'Tüm sertifikalı fasilitatörler', neYapilabilir: 'Kendi sınıfında kullanma (tasarımcı izniyle)' },
  prototip: { emoji: '🌿', ad: 'Prototip', kimGorur: 'Tüm sertifikalı fasilitatörler', neYapilabilir: 'Kullanma + geliştirme önerisi' },
  yayin_adayi: { emoji: '🌳', ad: 'Yayın adayı', kimGorur: 'Fasilitatörler + Ürün Kurulu', neYapilabilir: 'Yayın değerlendirmesine alınabilir' },
  yayinlanmis: { emoji: '⭐', ad: 'Yayınlanmış', kimGorur: 'Herkes', neYapilabilir: 'EPNEXUS ürünü olarak satılır' },
};

/** Kademe → teslim edilen tasarımın olgunluk düzeyi. */
export const KADEME_OLGUNLUK: Record<1 | 2 | 3, Olgunluk> = {
  1: 'tohum',
  2: 'prototip',
  3: 'yayin_adayi',
};

/** Kademe → telif türü (Md. 5.2 · kademe tablosu). */
export const KADEME_TELIF: Record<1 | 2 | 3, TelifTuru> = {
  1: 'varyant',
  2: 'ozgun',
  3: 'ozgun',
};

export function juriPuanToplami(p: JuriRubrigi): number {
  return JURI_RUBRIGI.reduce((s, b) => s + (p[b.anahtar] ?? 0), 0);
}

export interface JuriGirdisi {
  kademe: 1 | 2 | 3;
  puanlar: JuriRubrigi;
  /** EK-3 — her boyut için en az bir cümle yazılı gerekçe zorunludur. */
  gerekceler: Partial<Record<keyof JuriRubrigi, string>>;
  /** Md. 13.10 — kaynak beyanı olmayan dosya puanlanmadan geri gönderilir. */
  kaynakBeyaniVar: boolean;
  /** Etik ihlal, intihal veya test uydurma tespiti. */
  etikIhlal?: boolean;
  /** Kaçıncı teslim (revizyonla kabul sonrası bir kez tekrar hakkı vardır). */
  teslimNo: number;
}

export interface JuriSonucu {
  karar: JuriKarari | 'puanlanmadi';
  toplamPuan: number;
  baraj: number;
  olgunluk: Olgunluk | null;
  havuzaGirer: boolean;
  kademeKosuluTamam: boolean;
  aciklama: string;
  eksikGerekceler: string[];
  /** Revizyonla kabulde 6 hafta süre verilir. */
  revizyonSonTarihi: string | null;
}

/** § 5.2 revizyon süresi. */
export const REVIZYON_HAFTA = 6;

export function juriDegerlendir(g: JuriGirdisi, simdi: Date = new Date()): JuriSonucu {
  const toplam = juriPuanToplami(g.puanlar);
  const baraj = TASARIM_BARAJI[g.kademe];

  // Md. 13.10 — kaynak beyanı yoksa dosya puanlanmaz.
  if (!g.kaynakBeyaniVar) {
    return {
      karar: 'puanlanmadi', toplamPuan: 0, baraj, olgunluk: null,
      havuzaGirer: false, kademeKosuluTamam: false,
      aciklama: 'Md. 13.10 — kaynak beyanı olmayan dosya puanlanmadan geri gönderilir.',
      eksikGerekceler: [], revizyonSonTarihi: null,
    };
  }

  // § 5.2 — etik ihlal / intihal / test uydurma → red, Md. 8 işler.
  if (g.etikIhlal) {
    return {
      karar: 'red', toplamPuan: toplam, baraj, olgunluk: null,
      havuzaGirer: false, kademeKosuluTamam: false,
      aciklama: 'Etik ihlal, intihal veya test uydurma — kademe koşulu düşer; Yönetmelik Md. 8 işler.',
      eksikGerekceler: [], revizyonSonTarihi: null,
    };
  }

  // EK-3 — her boyut için yazılı gerekçe zorunlu.
  const eksikGerekceler = JURI_RUBRIGI
    .filter((b) => !(g.gerekceler[b.anahtar] ?? '').trim())
    .map((b) => b.ad);

  const revizyonSon = new Date(simdi);
  revizyonSon.setUTCDate(revizyonSon.getUTCDate() + REVIZYON_HAFTA * 7);

  // § 5.2 "Yeniden tasarım: mekanik–kazanım uyumu yok" — bu boyut EK-3'te 1-2/5
  // bandındaysa (25 puanın %40'ının altı) toplam puan ne olursa olsun kabul edilmez,
  // çünkü kazanım oyunun içinde değil üstündedir.
  const mekanikOran = g.puanlar.mekanik_kazanim / 25;
  if (mekanikOran < 0.4) {
    return {
      karar: 'yeniden_tasarim', toplamPuan: toplam, baraj, olgunluk: null,
      havuzaGirer: false, kademeKosuluTamam: false,
      aciklama: 'Mekanik–kazanım uyumu yok (tema giydirme); yeni dönemde tekrar teslim edilir.',
      eksikGerekceler, revizyonSonTarihi: null,
    };
  }

  // Kademe 2 ek ölçütü: mekanik–kazanım uyumu ≥3/5 (EK-3 barajları satırı).
  const mekanikYeterli =
    g.kademe !== 2 || g.puanlar.mekanik_kazanim >= K2_MEKANIK_KAZANIM_MIN;

  if (toplam >= baraj && mekanikYeterli) {
    return {
      karar: 'kabul', toplamPuan: toplam, baraj, olgunluk: KADEME_OLGUNLUK[g.kademe],
      havuzaGirer: true, kademeKosuluTamam: true,
      aciklama: `Ölçütler karşılandı (${toplam}/${JURI_TOPLAM_PUAN} ≥ ${baraj}). Tasarım havuza girer.`,
      eksikGerekceler, revizyonSonTarihi: null,
    };
  }

  // Baraja yakın (≥ barajın %85'i) ise revizyonla kabul; tekrar hakkı bir kezdir.
  if (toplam >= baraj * 0.85 && g.teslimNo < 2) {
    return {
      karar: 'revizyonla_kabul', toplamPuan: toplam, baraj, olgunluk: null,
      havuzaGirer: false, kademeKosuluTamam: false,
      aciklama: `1-2 eksik var; ${REVIZYON_HAFTA} hafta içinde bir kez tekrar teslim edilir.`,
      eksikGerekceler, revizyonSonTarihi: revizyonSon.toISOString(),
    };
  }

  return {
    karar: 'yeniden_tasarim', toplamPuan: toplam, baraj, olgunluk: null,
    havuzaGirer: false, kademeKosuluTamam: false,
    aciklama: `Baraj karşılanmadı (${toplam}/${JURI_TOPLAM_PUAN} < ${baraj}). Yeni dönemde tekrar teslim.`,
    eksikGerekceler, revizyonSonTarihi: null,
  };
}

/** § 5.1 tarafsızlık kuralı ve Md. 14.4. */
export function juriTarafsizlikKontrol(opts: {
  juriUyeId: string;
  tasarimciId: string;
  juriMentorlukYaptiklari: readonly string[];
  juriKurumu: string | null;
  tasarimciKurumu: string | null;
}): { uygun: boolean; sebep: string | null } {
  if (opts.juriUyeId === opts.tasarimciId) {
    return { uygun: false, sebep: 'Jüri üyesi kendi tasarımını değerlendiremez.' };
  }
  if (opts.juriMentorlukYaptiklari.includes(opts.tasarimciId)) {
    return { uygun: false, sebep: 'Jüri üyesi, mentorluk yaptığı kişinin tasarımını değerlendiremez (§ 5.1, Md. 14.4).' };
  }
  if (opts.juriKurumu && opts.tasarimciKurumu && opts.juriKurumu === opts.tasarimciKurumu) {
    return { uygun: false, sebep: 'Aynı okuldan/kurumdan olan üye jüriye alınmaz (§ 5.1).' };
  }
  return { uygun: true, sebep: null };
}

/** Md. 13.7 — katmanlı hak modeli; her tasarım kaydına iliştirilir. */
export const HAK_KATMANLARI = [
  { katman: 1, ad: 'Sahiplik', icerik: 'Eser tasarımcıya aittir.' },
  { katman: 2, ad: 'EPNEXUS lisansı', icerik: 'Havuzda yayımlama + eğitimde örnek gösterme. Münhasır değil, ücretsiz, süresiz.' },
  { katman: 3, ad: 'İlk teklif hakkı', icerik: 'Tasarımcı başka yayıncıya giderse EPNEXUS 90 gün içinde teklif verebilir.' },
  { katman: 4, ad: 'Yayın sözleşmesi', icerik: 'Ürünleştirme yalnız EK-C ile; telif Md. 5.2’de ilan edilmiştir.' },
  { katman: 5, ad: 'Manevi haklar', icerik: 'Tasarımcının adı türeyen her üründe anılır; feragat istenmez.' },
] as const;

export type HavuzEylemi = 'sinifta_kullan' | 'ticari_kullan' | 'cogalt' | 'turev_uret' | 'urunlestir';

export interface HavuzErisimKarari {
  izin: boolean;
  gerekce: string;
  tasarimciyaBildirim: boolean;
}

/** Md. 13.8 — havuz kullanım sınırları. */
export function havuzErisimDegerlendir(opts: {
  eylem: HavuzEylemi;
  talepEdenKademe: Kademe;
  talepEdenTasarimciMi: boolean;
  ekcSozlesmesiVar: boolean;
}): HavuzErisimKarari {
  if (opts.talepEdenTasarimciMi) {
    return { izin: true, gerekce: 'Tasarımcı eserinin sahibidir; sınır yoktur (Md. 13.8).', tasarimciyaBildirim: false };
  }
  if (opts.talepEdenKademe < 1) {
    return { izin: false, gerekce: 'Havuz yalnız sertifikalı fasilitatörlere açıktır (§ 6.2).', tasarimciyaBildirim: false };
  }
  switch (opts.eylem) {
    case 'sinifta_kullan':
      return { izin: true, gerekce: 'Sertifikalı fasilitatör havuzdaki tasarımı kendi sınıfında kullanabilir (Md. 13.8).', tasarimciyaBildirim: true };
    case 'urunlestir':
      return {
        izin: opts.ekcSozlesmesiVar,
        gerekce: opts.ekcSozlesmesiVar
          ? 'EK-C Oyun Yayın Sözleşmesi mevcut; ürünleştirme sözleşme şartlarına tabidir.'
          : 'Sözleşmesiz ürünleştirme yasaktır (Md. 13.6 — değiştirilemez madde).',
        tasarimciyaBildirim: true,
      };
    case 'ticari_kullan':
    case 'cogalt':
    case 'turev_uret':
      return { izin: false, gerekce: 'Md. 13.8 — ticari kullanım, çoğaltma ve türev üretimi yasaktır.', tasarimciyaBildirim: false };
  }
}

export interface HavuzEtiketi {
  alan: string;
  sinifDuzeyi: number;
  mebKazanim: string;
  mekanikler: string[];
  oyuncuSayisi: string;
  sureDk: number;
  bilesenKarmasikligi: 'dusuk' | 'orta' | 'yuksek';
  testEdilenOgrenci: number;
  rubrikPuani: number;
  olgunluk: Olgunluk;
  dil: string;
}

/** § 6.3 — "Havuzun değeri arşivde değil, aranabilirliğindedir." */
export function havuzAra(
  kayitlar: ReadonlyArray<HavuzEtiketi & { id: string; ad: string }>,
  filtre: Partial<Pick<HavuzEtiketi, 'alan' | 'sinifDuzeyi' | 'olgunluk' | 'dil'>> & {
    mekanik?: string;
    maksOyuncu?: number;
    maksSureDk?: number;
    minRubrik?: number;
  },
) {
  return kayitlar.filter((k) => {
    if (filtre.alan && k.alan !== filtre.alan) return false;
    if (filtre.sinifDuzeyi !== undefined && k.sinifDuzeyi !== filtre.sinifDuzeyi) return false;
    if (filtre.olgunluk && k.olgunluk !== filtre.olgunluk) return false;
    if (filtre.dil && k.dil !== filtre.dil) return false;
    if (filtre.mekanik && !k.mekanikler.includes(filtre.mekanik)) return false;
    if (filtre.maksSureDk !== undefined && k.sureDk > filtre.maksSureDk) return false;
    if (filtre.minRubrik !== undefined && k.rubrikPuani < filtre.minRubrik) return false;
    return true;
  });
}
