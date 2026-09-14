-- EPNEXUS Fasilitatör Ağı — veritabanı şeması
-- Yönetmelik v1.1 ve Oyun Atölyesi Programı v1.2 hükümlerini taşır.
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------- üyeler
CREATE TABLE IF NOT EXISTS uyeler (
  id                    TEXT PRIMARY KEY,
  ad_soyad              TEXT NOT NULL,
  eposta                TEXT NOT NULL UNIQUE,
  parola_hash           TEXT NOT NULL,
  telefon               TEXT,
  il                    TEXT NOT NULL DEFAULT '',
  ilce                  TEXT NOT NULL DEFAULT '',
  okul                  TEXT,
  brans                 TEXT,
  kademe                INTEGER NOT NULL DEFAULT 0 CHECK (kademe BETWEEN 0 AND 3),
  durum                 TEXT NOT NULL DEFAULT 'aktif'
                          CHECK (durum IN ('aktif','askida','iptal','ek_sure')),
  rol                   TEXT NOT NULL DEFAULT 'uye' CHECK (rol IN ('uye','epnexus')),
  kurucu_kohort         INTEGER NOT NULL DEFAULT 0,
  kademe_gecerlilik     TEXT,
  -- Md. 9.4 talep yönlendirme sayaçları
  yanitsiz_sayac        INTEGER NOT NULL DEFAULT 0,
  yonlendirme_disi_bitis TEXT,
  -- Md. 4.2 profil/dizin
  dizinde_yayinla       INTEGER NOT NULL DEFAULT 1,
  ek_a_imza_tarihi      TEXT,
  olusturuldu           TEXT NOT NULL,
  guncellendi           TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_uyeler_bolge ON uyeler (il, ilce, kademe, durum);

-- Md. 9.5 — fasilitatörün hâlihazırda çalıştığı okullar
CREATE TABLE IF NOT EXISTS uye_okullari (
  uye_id     TEXT NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
  okul_adi   TEXT NOT NULL,
  baslangic  TEXT NOT NULL,
  PRIMARY KEY (uye_id, okul_adi)
);

-- ------------------------------------------------------------------- NX
-- Md. 11 — olay kaynaklı defter; bakiye ve rütbe buradan türetilir.
CREATE TABLE IF NOT EXISTS nx_defteri (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  uye_id     TEXT NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
  eylem      TEXT NOT NULL,
  anahtar    TEXT,
  nx         INTEGER NOT NULL,
  aciklama   TEXT,
  tarih      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_nx_uye ON nx_defteri (uye_id, eylem, tarih);
-- Aynı kayıt için NX iki kez yazılamaz (Md. 11.1 sınırları).
CREATE UNIQUE INDEX IF NOT EXISTS ux_nx_anahtar
  ON nx_defteri (uye_id, eylem, anahtar) WHERE anahtar IS NOT NULL;

-- --------------------------------------------------------------- akademi
CREATE TABLE IF NOT EXISTS kohortlar (
  id              TEXT PRIMARY KEY,
  ad              TEXT NOT NULL,
  kademe          INTEGER NOT NULL CHECK (kademe BETWEEN 1 AND 3),
  baslangic       TEXT NOT NULL,
  bitis           TEXT NOT NULL,
  kontenjan       INTEGER NOT NULL,
  kurucu_kohort   INTEGER NOT NULL DEFAULT 0,
  egitmen_uye_id  TEXT REFERENCES uyeler(id),
  durum           TEXT NOT NULL DEFAULT 'planlandi'
                    CHECK (durum IN ('planlandi','devam','tamamlandi','iptal'))
);

CREATE TABLE IF NOT EXISTS kayitlar (
  id              TEXT PRIMARY KEY,
  uye_id          TEXT NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
  kohort_id       TEXT NOT NULL REFERENCES kohortlar(id) ON DELETE CASCADE,
  ucret_kalemi    TEXT NOT NULL,
  odenen          INTEGER NOT NULL DEFAULT 0,
  ilk_modul_tamam INTEGER NOT NULL DEFAULT 0,
  devir_kullanildi INTEGER NOT NULL DEFAULT 0,
  tarih           TEXT NOT NULL,
  UNIQUE (uye_id, kohort_id)
);

CREATE TABLE IF NOT EXISTS modul_ilerlemesi (
  uye_id      TEXT NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
  modul_kodu  TEXT NOT NULL,
  tamamlandi  TEXT NOT NULL,
  PRIMARY KEY (uye_id, modul_kodu)
);

CREATE TABLE IF NOT EXISTS sinav_sonuclari (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  uye_id     TEXT NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
  kademe     INTEGER NOT NULL CHECK (kademe BETWEEN 1 AND 3),
  puan       INTEGER NOT NULL CHECK (puan BETWEEN 0 AND 100),
  gecti      INTEGER NOT NULL,
  tarih      TEXT NOT NULL
);

-- ------------------------------------------------------ uygulama raporları
-- Md. 7.2 akış: fasilitatör → K2 ön onay → K3 onay → NX
CREATE TABLE IF NOT EXISTS uygulama_raporlari (
  id                TEXT PRIMARY KEY,
  uye_id            TEXT NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
  oyun_id           TEXT NOT NULL,
  okul_adi          TEXT NOT NULL,
  sinif_duzeyi      INTEGER NOT NULL,
  ogrenci_sayisi    INTEGER NOT NULL,
  kazanim_kodu      TEXT NOT NULL,
  tarih             TEXT NOT NULL,
  sure_dk           INTEGER NOT NULL,
  -- Rubrik 4 boyut × 4 düzey
  rb_kazanim        INTEGER NOT NULL CHECK (rb_kazanim BETWEEN 1 AND 4),
  rb_soylem         INTEGER NOT NULL CHECK (rb_soylem BETWEEN 1 AND 4),
  rb_katilim        INTEGER NOT NULL CHECK (rb_katilim BETWEEN 1 AND 4),
  rb_fasilitasyon   INTEGER NOT NULL CHECK (rb_fasilitasyon BETWEEN 1 AND 4),
  gozlem_notu       TEXT NOT NULL DEFAULT '',
  -- Md. 13.1/13.2 KVKK beyanları
  ogrenci_verisi_anonim INTEGER NOT NULL DEFAULT 1,
  fotograf_politikasi_onay INTEGER NOT NULL DEFAULT 0,
  durum             TEXT NOT NULL DEFAULT 'taslak'
                      CHECK (durum IN ('taslak','gonderildi','on_onayli','onayli','duzeltme_istendi','reddedildi')),
  on_onay_veren     TEXT REFERENCES uyeler(id),
  on_onay_tarihi    TEXT,
  onay_veren        TEXT REFERENCES uyeler(id),
  onay_tarihi       TEXT,
  red_gerekcesi     TEXT,
  duzeltme_sayisi   INTEGER NOT NULL DEFAULT 0,
  olusturuldu       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_rapor_uye ON uygulama_raporlari (uye_id, durum, tarih);

-- Md. 7.1/5 — her uygulamada anonim QR anketi (5 soru)
CREATE TABLE IF NOT EXISTS geri_bildirimler (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  rapor_id   TEXT NOT NULL REFERENCES uygulama_raporlari(id) ON DELETE CASCADE,
  s1 INTEGER NOT NULL CHECK (s1 BETWEEN 1 AND 5),
  s2 INTEGER NOT NULL CHECK (s2 BETWEEN 1 AND 5),
  s3 INTEGER NOT NULL CHECK (s3 BETWEEN 1 AND 5),
  s4 INTEGER NOT NULL CHECK (s4 BETWEEN 1 AND 5),
  s5 INTEGER NOT NULL CHECK (s5 BETWEEN 1 AND 5),
  tarih      TEXT NOT NULL
);

-- ----------------------------------------------------------- sertifikalar
CREATE TABLE IF NOT EXISTS sertifikalar (
  no                 TEXT PRIMARY KEY,
  uye_id             TEXT NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
  ad_soyad           TEXT NOT NULL,
  kademe             INTEGER NOT NULL CHECK (kademe BETWEEN 1 AND 3),
  verilis            TEXT NOT NULL,
  gecerlilik         TEXT NOT NULL,
  durum              TEXT NOT NULL DEFAULT 'gecerli'
                       CHECK (durum IN ('gecerli','suresi_doldu','askida','iptal')),
  kurucu_kohort      INTEGER NOT NULL DEFAULT 0,
  karar_veren_master TEXT REFERENCES uyeler(id),
  universite_sem     TEXT,
  iptal_gerekcesi    TEXT
);
CREATE INDEX IF NOT EXISTS ix_sertifika_uye ON sertifikalar (uye_id);

-- --------------------------------------------------------- oyun tasarımları
CREATE TABLE IF NOT EXISTS tasarimlar (
  id                TEXT PRIMARY KEY,
  tasarimci_id      TEXT NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
  ad                TEXT NOT NULL,
  kademe            INTEGER NOT NULL CHECK (kademe BETWEEN 1 AND 3),
  alan              TEXT NOT NULL DEFAULT 'matematik',
  sinif_duzeyi      INTEGER NOT NULL,
  meb_kazanim       TEXT NOT NULL,
  mekanikler        TEXT NOT NULL DEFAULT '[]',
  oyuncu_sayisi     TEXT NOT NULL DEFAULT '2-4',
  sure_dk           INTEGER NOT NULL DEFAULT 20,
  bilesen_karmasikligi TEXT NOT NULL DEFAULT 'orta'
                       CHECK (bilesen_karmasikligi IN ('dusuk','orta','yuksek')),
  test_edilen_ogrenci INTEGER NOT NULL DEFAULT 0,
  dil               TEXT NOT NULL DEFAULT 'tr',
  ozet              TEXT NOT NULL DEFAULT '',
  -- Md. 13.10 — kaynak beyanı zorunlu
  kaynak_beyani     TEXT,
  teslim_no         INTEGER NOT NULL DEFAULT 1,
  durum             TEXT NOT NULL DEFAULT 'taslak'
                      CHECK (durum IN ('taslak','juride','kabul','revizyonla_kabul','yeniden_tasarim','red','puanlanmadi')),
  olgunluk          TEXT CHECK (olgunluk IN ('tohum','prototip','yayin_adayi','yayinlanmis')),
  rubrik_puani      INTEGER,
  revizyon_son      TEXT,
  -- Md. 13.7 katman 3/4
  ilk_teklif_bildirimi TEXT,
  ekc_sozlesme_tarihi  TEXT,
  telif_turu        TEXT CHECK (telif_turu IN ('ozgun','ortak_gelistirme','varyant')),
  olusturuldu       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_tasarim_havuz ON tasarimlar (olgunluk, alan, sinif_duzeyi);

CREATE TABLE IF NOT EXISTS juri_degerlendirmeleri (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  tasarim_id      TEXT NOT NULL REFERENCES tasarimlar(id) ON DELETE CASCADE,
  juri_uye_id     TEXT NOT NULL REFERENCES uyeler(id),
  mekanik_kazanim INTEGER NOT NULL,
  oynanabilirlik  INTEGER NOT NULL,
  karar_kalitesi  INTEGER NOT NULL,
  geri_bildirim   INTEGER NOT NULL,
  test_kaniti     INTEGER NOT NULL,
  revizyon        INTEGER NOT NULL,
  uretilebilirlik INTEGER NOT NULL,
  gerekceler      TEXT NOT NULL DEFAULT '{}',
  karar           TEXT NOT NULL,
  toplam_puan     INTEGER NOT NULL,
  tarih           TEXT NOT NULL,
  UNIQUE (tasarim_id, juri_uye_id)
);

-- ------------------------------------------------------------- turnuvalar
CREATE TABLE IF NOT EXISTS turnuvalar (
  id                TEXT PRIMARY KEY,
  ad                TEXT NOT NULL,
  duzenleyen_id     TEXT NOT NULL REFERENCES uyeler(id),
  il                TEXT NOT NULL,
  ilce              TEXT NOT NULL,
  tarih             TEXT NOT NULL,
  basvuru_tarihi    TEXT NOT NULL,
  beklenen_katilimci INTEGER NOT NULL,
  tur_sayisi        INTEGER NOT NULL DEFAULT 0,
  durum             TEXT NOT NULL DEFAULT 'basvuruldu'
                      CHECK (durum IN ('basvuruldu','onaylandi','reddedildi','tamamlandi','raporlandi')),
  red_gerekcesi     TEXT,
  net_gelir         INTEGER,
  duzenleyen_payi   INTEGER,
  epnexus_payi      INTEGER,
  operasyon_rezervi INTEGER,
  rapor_son_tarihi  TEXT,
  rapor_tarihi      TEXT
);

CREATE TABLE IF NOT EXISTS turnuva_oyunculari (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  turnuva_id   TEXT NOT NULL REFERENCES turnuvalar(id) ON DELETE CASCADE,
  oyuncu_kodu  TEXT NOT NULL,
  ad           TEXT NOT NULL,
  okul         TEXT,
  puan         REAL NOT NULL DEFAULT 0,
  gorev_karti  INTEGER NOT NULL DEFAULT 0,
  rakipler     TEXT NOT NULL DEFAULT '[]',
  bye_aldi     INTEGER NOT NULL DEFAULT 0,
  UNIQUE (turnuva_id, oyuncu_kodu)
);

-- -------------------------------------------------------- talep yönlendirme
CREATE TABLE IF NOT EXISTS talepler (
  id                TEXT PRIMARY KEY,
  kaynak            TEXT NOT NULL CHECK (kaynak IN ('okul','kurum','veli')),
  iletisim_ad       TEXT NOT NULL,
  iletisim_eposta   TEXT NOT NULL,
  telefon           TEXT,
  il                TEXT NOT NULL,
  ilce              TEXT NOT NULL,
  okul_adi          TEXT,
  aciklama          TEXT NOT NULL DEFAULT '',
  durum             TEXT NOT NULL DEFAULT 'yeni'
                      CHECK (durum IN ('yeni','atandi','kabul','red','zaman_asimi','epnexus')),
  atanan_uye_id     TEXT REFERENCES uyeler(id),
  atama_kurali      TEXT,
  atama_gerekcesi   TEXT,
  yanit_son_tarihi  TEXT,
  kademe2_acigi     INTEGER NOT NULL DEFAULT 0,
  olusturuldu       TEXT NOT NULL,
  guncellendi       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_talep_atama ON talepler (atanan_uye_id, durum, olusturuldu);

-- ------------------------------------------------------------ mentorluk
CREATE TABLE IF NOT EXISTS mentorluklar (
  id         TEXT PRIMARY KEY,
  mentor_id  TEXT NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
  mentee_id  TEXT NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
  tur        TEXT NOT NULL DEFAULT 'oturum'
               CHECK (tur IN ('oturum','karsilama','tasarim','zorunlu_atama')),
  not_metni  TEXT NOT NULL DEFAULT '',
  tarih      TEXT NOT NULL
);

-- Md. 7.1/3 — kalibrasyon oturumları
CREATE TABLE IF NOT EXISTS kalibrasyonlar (
  id          TEXT PRIMARY KEY,
  lider_id    TEXT NOT NULL REFERENCES uyeler(id),
  tarih       TEXT NOT NULL,
  aciklama    TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS kalibrasyon_katilimlari (
  kalibrasyon_id TEXT NOT NULL REFERENCES kalibrasyonlar(id) ON DELETE CASCADE,
  uye_id         TEXT NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
  uyum_yuzdesi   INTEGER NOT NULL CHECK (uyum_yuzdesi BETWEEN 0 AND 100),
  PRIMARY KEY (kalibrasyon_id, uye_id)
);

-- Md. 4 — etkinlik/atölye kayıtları (yenileme sayaçları)
CREATE TABLE IF NOT EXISTS etkinlikler (
  id          TEXT PRIMARY KEY,
  uye_id      TEXT NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
  tur         TEXT NOT NULL CHECK (tur IN ('atolye','etkinlik','turnuva','bolge_bulusmasi','kohort','urun_kurulu','juri')),
  ad          TEXT NOT NULL,
  katilimci   INTEGER NOT NULL DEFAULT 0,
  tarih       TEXT NOT NULL
);

-- ------------------------------------------------------------- yaptırımlar
CREATE TABLE IF NOT EXISTS yaptirimlar (
  id                 TEXT PRIMARY KEY,
  uye_id             TEXT NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
  basamak            TEXT NOT NULL,
  sebep              TEXT NOT NULL,
  dogrudan_iptal_sebebi TEXT,
  savunma_son_tarihi TEXT,
  savunma_metni      TEXT,
  itiraz_durumu      TEXT CHECK (itiraz_durumu IN ('yok','beklemede','kabul','red')),
  uygulayan_id       TEXT REFERENCES uyeler(id),
  tarih              TEXT NOT NULL
);

-- Md. 6.3 — yenileme hatırlatmaları
CREATE TABLE IF NOT EXISTS hatirlatmalar (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  uye_id    TEXT NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
  esik_gun  INTEGER NOT NULL,
  gonderim  TEXT NOT NULL,
  UNIQUE (uye_id, esik_gun, gonderim)
);

-- Denetim izi — Md. 8 ve Md. 11.4 (NX geri alma) için
CREATE TABLE IF NOT EXISTS denetim_kaydi (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  aktor_id  TEXT,
  eylem     TEXT NOT NULL,
  hedef     TEXT,
  detay     TEXT,
  tarih     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS oturumlar (
  jti        TEXT PRIMARY KEY,
  uye_id     TEXT NOT NULL REFERENCES uyeler(id) ON DELETE CASCADE,
  olusturuldu TEXT NOT NULL,
  gecerlilik TEXT NOT NULL
);
