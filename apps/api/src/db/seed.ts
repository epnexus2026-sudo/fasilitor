/**
 * Kurucu Kohort senaryosuna göre demo verisi.
 * Lansman Kiti § 8 (Sakarya saha listesi) ve Sistem Kılavuzu § 3.4 hedefleriyle uyumlu,
 * sistemi uçtan uca denemeye yetecek küçük bir veri kümesi kurar.
 *
 * Çalıştırma:  npm run seed          (mevcut veritabanının üstüne yazar)
 */
import { veritabaniAc, dbAyarla, calistir, tek, islem } from './index.ts';
import { config } from '../config.ts';
import { parolaOzetle } from '../lib/kimlik.ts';
import { simdi } from '../lib/id.ts';
import { sertifikaNoUret, sertifikaOlustur } from '../domain/sertifika.ts';
import { gecerlilikSonu } from '../domain/kademe.ts';
import { MODULLER_K1 } from '../data/catalog.ts';

const DEMO_PAROLA = process.env.EPNEXUS_DEMO_PAROLA ?? 'epnexus2026';

interface DemoUye {
  id: string;
  ad: string;
  eposta: string;
  il: string;
  ilce: string;
  okul: string | null;
  brans: string | null;
  kademe: 0 | 1 | 2 | 3;
  rol?: 'uye' | 'epnexus';
  kurucu?: boolean;
}

const UYELER: DemoUye[] = [
  { id: 'uye_epnexus', ad: 'EPNEXUS Ekibi', eposta: 'ekip@epnexusgames.com', il: 'Sakarya', ilce: 'Serdivan', okul: null, brans: null, kademe: 3, rol: 'epnexus' },
  { id: 'uye_master1', ad: 'Kübra Yıldız', eposta: 'kubra@epnexusgames.com', il: 'Sakarya', ilce: 'Serdivan', okul: null, brans: 'Matematik', kademe: 3 },
  { id: 'uye_master2', ad: 'Güneş Ardıç', eposta: 'gunes@epnexusgames.com', il: 'Kocaeli', ilce: 'İzmit', okul: null, brans: 'Matematik', kademe: 3 },
  { id: 'uye_k2_zeynep', ad: 'Zeynep Aktaş', eposta: 'zeynep@ornek.com', il: 'Sakarya', ilce: 'Adapazarı', okul: 'Adapazarı Ortaokulu', brans: 'Matematik', kademe: 2, kurucu: true },
  { id: 'uye_k2_fatma', ad: 'Fatma Şenel', eposta: 'fatma@ornek.com', il: 'Sakarya', ilce: 'Serdivan', okul: 'Özel Serdivan Koleji', brans: 'Matematik', kademe: 2, kurucu: true },
  { id: 'uye_k1_elif', ad: 'Elif Karaca', eposta: 'elif@ornek.com', il: 'Sakarya', ilce: 'Hendek', okul: 'Hendek Şehit Şükrü O.O.', brans: 'Matematik', kademe: 1, kurucu: true },
  { id: 'uye_k1_burak', ad: 'Burak Demirtaş', eposta: 'burak@ornek.com', il: 'Bursa', ilce: 'Nilüfer', okul: 'Nilüfer Ortaokulu', brans: 'Matematik', kademe: 1, kurucu: true },
  { id: 'uye_k1_mehmet', ad: 'Mehmet Arıcan', eposta: 'mehmet@ornek.com', il: 'Kocaeli', ilce: 'İzmit', okul: 'İzmit Cumhuriyet O.O.', brans: 'Matematik', kademe: 1, kurucu: true },
  { id: 'uye_k0_derya', ad: 'Derya Ünal', eposta: 'derya@ornek.com', il: 'Ankara', ilce: 'Çankaya', okul: 'Çankaya Ortaokulu', brans: 'Sınıf öğretmeni', kademe: 0 },
];

const OYUNLAR = ['hazine', 'harmonia', 'salur', 'afrodisias'] as const;
const KAZANIMLAR: Record<string, string> = {
  hazine: 'MAT.5.2.1', harmonia: 'MAT.6.2.2', salur: 'MAT.7.2.4', afrodisias: 'MAT.7.1.5',
};

function gunOnce(gun: number): string {
  return new Date(Date.now() - gun * 86_400_000).toISOString();
}

function tohumla(): void {
  const t = simdi();
  const parolaHash = parolaOzetle(DEMO_PAROLA);

  islem(() => {
    for (const u of UYELER) {
      const gecerlilik = u.kademe > 0
        ? gecerlilikSonu(u.kademe as 1 | 2 | 3, new Date(Date.now() - 200 * 86_400_000)).toISOString()
        : null;
      calistir(
        `INSERT OR REPLACE INTO uyeler
          (id, ad_soyad, eposta, parola_hash, il, ilce, okul, brans, kademe, durum, rol,
           kurucu_kohort, kademe_gecerlilik, ek_a_imza_tarihi, olusturuldu, guncellendi)
         VALUES (?,?,?,?,?,?,?,?,?,'aktif',?,?,?,?,?,?)`,
        u.id, u.ad, u.eposta, parolaHash, u.il, u.ilce, u.okul, u.brans, u.kademe,
        u.rol ?? 'uye', u.kurucu ? 1 : 0, gecerlilik,
        u.kademe > 0 ? gunOnce(210) : null, gunOnce(240), t,
      );

      // Md. 9.5 — fasilitatörün çalıştığı okul kaydı.
      if (u.okul && u.kademe >= 1) {
        calistir(
          'INSERT OR IGNORE INTO uye_okullari (uye_id, okul_adi, baslangic) VALUES (?,?,?)',
          u.id, u.okul, gunOnce(200),
        );
      }

      // Sertifikalı üyeler için Kademe 1 modülleri tamamlanmış sayılır.
      if (u.kademe >= 1) {
        for (const m of MODULLER_K1) {
          calistir(
            'INSERT OR IGNORE INTO modul_ilerlemesi (uye_id, modul_kodu, tamamlandi) VALUES (?,?,?)',
            u.id, m.kod, gunOnce(215),
          );
          calistir(
            `INSERT OR IGNORE INTO nx_defteri (uye_id, eylem, anahtar, nx, aciklama, tarih)
             VALUES (?, 'modul_tamamlama', ?, 100, ?, ?)`,
            u.id, m.kod, `${m.kod} — ${m.ad}`, gunOnce(215),
          );
        }
        calistir(
          'INSERT INTO sinav_sonuclari (uye_id, kademe, puan, gecti, tarih) VALUES (?,1,?,1,?)',
          u.id, 78 + (u.kademe * 4), gunOnce(212),
        );
      }

      // Profil tamamlama NX'i (Md. 11.1).
      calistir(
        `INSERT OR IGNORE INTO nx_defteri (uye_id, eylem, anahtar, nx, aciklama, tarih)
         VALUES (?, 'profil_tamamlama', NULL, 50, 'Profil tamamlama', ?)`,
        u.id, gunOnce(238),
      );
    }

    // ---- Sertifikalar (Md. 6.1) --------------------------------------------
    let sira = 0;
    for (const u of UYELER) {
      if (u.kademe < 1 || u.rol === 'epnexus') continue;
      for (let kd = 1; kd <= u.kademe; kd++) {
        sira++;
        const verilis = new Date(Date.now() - (200 - kd * 20) * 86_400_000);
        const no = sertifikaNoUret(kd as 1 | 2 | 3, verilis.getUTCFullYear(), sira);
        const s = sertifikaOlustur({
          no: no.tam, uyeId: u.id, adSoyad: u.ad, kademe: kd as 1 | 2 | 3, verilis,
          kurucuKohort: Boolean(u.kurucu) && kd === 1,
          kararVerenMaster: 'uye_master1',
          universiteSem: config.universiteSem,
        });
        calistir(
          `INSERT OR REPLACE INTO sertifikalar
            (no, uye_id, ad_soyad, kademe, verilis, gecerlilik, durum, kurucu_kohort, karar_veren_master, universite_sem)
           VALUES (?,?,?,?,?,?,'gecerli',?,?,?)`,
          s.no, s.uyeId, s.adSoyad, s.kademe, s.verilis, s.gecerlilik,
          s.kurucuKohort ? 1 : 0, s.kararVerenMaster, s.universiteSem,
        );
      }
    }

    // ---- Onaylı uygulama raporları (Md. 7.2) --------------------------------
    const raporlayanlar = UYELER.filter((u) => u.kademe >= 1 && u.rol !== 'epnexus');
    let raporNo = 0;
    for (const u of raporlayanlar) {
      const adet = u.kademe === 2 ? 14 : 7;
      for (let i = 0; i < adet; i++) {
        raporNo++;
        const oyun = OYUNLAR[i % OYUNLAR.length]!;
        const id = `rapor_seed_${raporNo}`;
        const tarih = gunOnce(7 * i + 3);
        // Md. 4.2 — sertifikalı fasilitatör rubrik ortalamasını ≥3,0 tutmakla yükümlüdür.
        const taban = 3;
        calistir(
          `INSERT OR REPLACE INTO uygulama_raporlari
            (id, uye_id, oyun_id, okul_adi, sinif_duzeyi, ogrenci_sayisi, kazanim_kodu, tarih, sure_dk,
             rb_kazanim, rb_soylem, rb_katilim, rb_fasilitasyon, gozlem_notu,
             ogrenci_verisi_anonim, fotograf_politikasi_onay, durum, on_onay_veren, on_onay_tarihi,
             onay_veren, onay_tarihi, olusturuldu)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,1,'onayli',?,?,?,?,?)`,
          id, u.id, oyun, u.okul ?? 'Ziyaret edilen okul', 5 + (i % 4), 22 + (i % 8),
          KAZANIMLAR[oyun]!, tarih, 40,
          Math.min(4, taban + (i % 2)), Math.min(4, taban + ((i + 1) % 2)),
          Math.min(4, taban + (u.kademe >= 2 ? 1 : 0)), Math.min(4, taban + (i % 2)),
          'Öğrenciler eşitliğin korunumunu oyun içinde fark etti.',
          'uye_k2_zeynep', tarih, 'uye_master1', tarih, tarih,
        );
        calistir(
          `INSERT OR IGNORE INTO nx_defteri (uye_id, eylem, anahtar, nx, aciklama, tarih)
           VALUES (?, 'uygulama_raporu', ?, 300, 'Onaylı uygulama raporu', ?)`,
          u.id, id, tarih,
        );
        // Md. 7.1/5 — anonim QR anketi.
        calistir(
          'INSERT INTO geri_bildirimler (rapor_id, s1, s2, s3, s4, s5, tarih) VALUES (?,?,?,?,?,?,?)',
          id, 5, 4, 5, 4, 4, tarih,
        );
      }
    }

    // ---- Etkinlik ve mentorluk (Md. 6.2 yenileme sayaçları) ------------------
    calistir(
      "INSERT OR REPLACE INTO etkinlikler (id, uye_id, tur, ad, katilimci, tarih) VALUES ('etk_seed_1','uye_k2_zeynep','turnuva','Adapazarı İlçe Turnuvası',48,?)",
      gunOnce(60),
    );
    calistir(
      "INSERT OR REPLACE INTO etkinlikler (id, uye_id, tur, ad, katilimci, tarih) VALUES ('etk_seed_2','uye_k2_fatma','atolye','Serdivan Veli Atölyesi',30,?)",
      gunOnce(45),
    );
    calistir(
      "INSERT OR REPLACE INTO mentorluklar (id, mentor_id, mentee_id, tur, not_metni, tarih) VALUES ('men_seed_1','uye_k2_zeynep','uye_k1_elif','oturum','Karşılama oturumu yapıldı.',?)",
      gunOnce(90),
    );
    calistir(
      "INSERT OR REPLACE INTO mentorluklar (id, mentor_id, mentee_id, tur, not_metni, tarih) VALUES ('men_seed_2','uye_k2_zeynep','uye_k1_burak','oturum','Rubrik okuma oturumu.',?)",
      gunOnce(40),
    );

    // ---- Kalibrasyon (Md. 7.1/3) -------------------------------------------
    calistir(
      "INSERT OR REPLACE INTO kalibrasyonlar (id, lider_id, tarih, aciklama) VALUES ('kal_seed_1','uye_master1',?,'2026 Güz kalibrasyonu')",
      gunOnce(70),
    );
    for (const [uye, uyum] of [['uye_k2_zeynep', 88], ['uye_k2_fatma', 84], ['uye_k1_elif', 79]] as const) {
      calistir(
        'INSERT OR REPLACE INTO kalibrasyon_katilimlari (kalibrasyon_id, uye_id, uyum_yuzdesi) VALUES (?,?,?)',
        'kal_seed_1', uye, uyum,
      );
    }

    // ---- Oyun Havuzu tasarımları (Oyun Atölyesi § 6) ------------------------
    const tasarimlar = [
      {
        id: 'tasarim_seed_1', tasarimci: 'uye_k1_elif', ad: 'Hazine Avcısı — Kesirli Varyant',
        kademe: 1, alan: 'matematik', sinif: 6, kazanim: 'MAT.6.1.4',
        mekanikler: ['set-toplama', 'blok-yerlestirme'], olgunluk: 'tohum', puan: 72,
        ozet: 'Hazineleri Topla mekaniğinin kesirlerle çalışan varyantı; hedef sayı yerine hedef kesir kullanılır.',
        telif: 'varyant',
      },
      {
        id: 'tasarim_seed_2', tasarimci: 'uye_k2_zeynep', ad: 'Denge Kulesi',
        kademe: 2, alan: 'matematik', sinif: 7, kazanim: 'MAT.7.2.1',
        mekanikler: ['risk-secimi', 'kaynak-yonetimi'], olgunluk: 'prototip', puan: 81,
        ozet: 'Cebirsel ifadelerle kule dengelenir; yanlış işaret kuleyi devirir, geri bildirim anında görünür.',
        telif: 'ozgun',
      },
      {
        id: 'tasarim_seed_3', tasarimci: 'uye_k2_fatma', ad: 'Örüntü Tarlası',
        kademe: 2, alan: 'matematik', sinif: 5, kazanim: 'MAT.5.2.3',
        mekanikler: ['desen-olusturma', 'eslestirme'], olgunluk: 'prototip', puan: 76,
        ozet: 'Oyuncular tarlaya ektikleri örüntüyü genelleyerek hasat kazanır.',
        telif: 'ozgun',
      },
    ];
    for (const d of tasarimlar) {
      calistir(
        `INSERT OR REPLACE INTO tasarimlar
          (id, tasarimci_id, ad, kademe, alan, sinif_duzeyi, meb_kazanim, mekanikler, oyuncu_sayisi,
           sure_dk, bilesen_karmasikligi, test_edilen_ogrenci, dil, ozet, kaynak_beyani, teslim_no,
           durum, olgunluk, rubrik_puani, telif_turu, olusturuldu)
         VALUES (?,?,?,?,?,?,?,?,'2-4',25,'orta',?, 'tr', ?, ?, 1, 'kabul', ?, ?, ?, ?)`,
        d.id, d.tasarimci, d.ad, d.kademe, d.alan, d.sinif, d.kazanim,
        JSON.stringify(d.mekanikler), 24 + d.kademe * 12, d.ozet,
        'Esinlenilen oyun: EPNEXUS Hazineleri Topla (mekanik), Blokus (alan kontrolü fikri).',
        d.olgunluk, d.puan, d.telif, gunOnce(100),
      );
      calistir(
        `INSERT OR IGNORE INTO nx_defteri (uye_id, eylem, anahtar, nx, aciklama, tarih)
         VALUES (?, 'oyun_varyanti', ?, 250, 'Kabul edilen tasarım', ?)`,
        d.tasarimci, d.id, gunOnce(95),
      );
    }

    // ---- Talepler (Md. 9) ---------------------------------------------------
    calistir(
      `INSERT OR REPLACE INTO talepler
        (id, kaynak, iletisim_ad, iletisim_eposta, telefon, il, ilce, okul_adi, aciklama,
         durum, atanan_uye_id, atama_kurali, atama_gerekcesi, yanit_son_tarihi, kademe2_acigi,
         olusturuldu, guncellendi)
       VALUES ('talep_seed_1','okul','Ayşe Müdür','mudur@ornekokul.k12.tr','05001112233','Sakarya','Adapazarı',
               'Adapazarı Ortaokulu','6. sınıflar için 4 haftalık atölye talebi.','kabul','uye_k2_zeynep',
               'mevcut_okul_sahibi','Md. 9.5 — okulla çalışan fasilitatör var.',?,0,?,?)`,
      gunOnce(28), gunOnce(30), gunOnce(29),
    );
    calistir(
      `INSERT OR REPLACE INTO talepler
        (id, kaynak, iletisim_ad, iletisim_eposta, il, ilce, okul_adi, aciklama,
         durum, atama_kurali, atama_gerekcesi, kademe2_acigi, olusturuldu, guncellendi)
       VALUES ('talep_seed_2','veli','Murat Veli','veli@ornek.com','Van','İpekyolu',NULL,
               'Bölgemizde fasilitatör var mı?','epnexus','epnexus',
               'Md. 9.2/5 — bölgede fasilitatör yok; Kademe 2 açığı.',1,?,?)`,
      gunOnce(12), gunOnce(12),
    );

    // ---- Turnuva (Md. 10) ---------------------------------------------------
    calistir(
      `INSERT OR REPLACE INTO turnuvalar
        (id, ad, duzenleyen_id, il, ilce, tarih, basvuru_tarihi, beklenen_katilimci, tur_sayisi,
         durum, net_gelir, duzenleyen_payi, epnexus_payi, operasyon_rezervi, rapor_son_tarihi, rapor_tarihi)
       VALUES ('turnuva_seed_1','EPNEXUS Ligi — Adapazarı İlçe Turnuvası','uye_k2_zeynep','Sakarya','Adapazarı',
               ?,?,48,6,'raporlandi',60000,24000,18000,18000,?,?)`,
      gunOnce(60), gunOnce(120), gunOnce(50), gunOnce(55),
    );
    // 3 turluk tamamlanmış turnuva: rakip listeleri Buchholz hesabını besler (Md. 10.5).
    const takimlar = [
      ['A1', 'Adapazarı Yıldızlar', 'Adapazarı Ortaokulu', 3, 12, ['A2', 'A3', 'A5']],
      ['A2', 'Serdivan Kâşifler', 'Özel Serdivan Koleji', 2, 11, ['A1', 'A4', 'A3']],
      ['A3', 'Hendek Fatihler', 'Hendek Şehit Şükrü O.O.', 2, 14, ['A4', 'A1', 'A2']],
      ['A4', 'İzmit Gezginler', 'İzmit Cumhuriyet O.O.', 2, 9, ['A3', 'A2', 'A6']],
      ['A5', 'Nilüfer Mimarlar', 'Nilüfer Ortaokulu', 1.5, 8, ['A6', 'A7', 'A1']],
      ['A6', 'Sapanca Denizciler', 'Sapanca O.O.', 1, 6, ['A5', 'A8', 'A4']],
      ['A7', 'Karasu Kartallar', 'Karasu O.O.', 1, 5, ['A8', 'A5', 'A8']],
      ['A8', 'Ferizli Filozoflar', 'Ferizli O.O.', 0.5, 3, ['A7', 'A6', 'A7']],
    ] as const;
    for (const [kod, ad, okul, puan, kart, rakipler] of takimlar) {
      calistir(
        `INSERT OR REPLACE INTO turnuva_oyunculari (turnuva_id, oyuncu_kodu, ad, okul, puan, gorev_karti, rakipler, bye_aldi)
         VALUES ('turnuva_seed_1',?,?,?,?,?,?,0)`,
        kod, ad, okul, puan, kart, JSON.stringify(rakipler),
      );
    }

    // ---- Kohortlar ----------------------------------------------------------
    calistir(
      `INSERT OR REPLACE INTO kohortlar (id, ad, kademe, baslangic, bitis, kontenjan, kurucu_kohort, egitmen_uye_id, durum)
       VALUES ('kohort_kurucu','Kurucu Kohort — Sakarya',1,?,?,50,1,'uye_master1','tamamlandi')`,
      gunOnce(220), gunOnce(190),
    );
    calistir(
      `INSERT OR REPLACE INTO kohortlar (id, ad, kademe, baslangic, bitis, kontenjan, kurucu_kohort, egitmen_uye_id, durum)
       VALUES ('kohort_2027_1','2027-1 Kademe 1 Kohortu',1,?,?,40,0,'uye_master2','planlandi')`,
      new Date(Date.now() + 30 * 86_400_000).toISOString(),
      new Date(Date.now() + 90 * 86_400_000).toISOString(),
    );
  });
}

const db = veritabaniAc(config.dbYolu);
dbAyarla(db);
tohumla();

const sayac = (tablo: string) => tek<{ n: number }>(`SELECT COUNT(*) AS n FROM ${tablo}`)?.n ?? 0;
console.log('[epnexus] Demo verisi yüklendi:');
console.log(`  üye: ${sayac('uyeler')} · sertifika: ${sayac('sertifikalar')} · rapor: ${sayac('uygulama_raporlari')}`);
console.log(`  tasarım: ${sayac('tasarimlar')} · talep: ${sayac('talepler')} · turnuva: ${sayac('turnuvalar')}`);
console.log(`  NX kaydı: ${sayac('nx_defteri')}`);
console.log(`\n  Demo giriş: kubra@epnexusgames.com / ${DEMO_PAROLA} (Master)`);
console.log(`              zeynep@ornek.com / ${DEMO_PAROLA} (Kıdemli Fasilitatör)`);
console.log(`              ekip@epnexusgames.com / ${DEMO_PAROLA} (EPNEXUS ekibi)`);
