# EPNEXUS FASİLİTATÖR AĞI — DOSYA SETİ
## İçindekiler ve kullanım kılavuzu

**Sürüm:** v1.2 · **Derleme tarihi:** 14 Eylül 2026
**Toplam:** 8 belge (171 sayfa) · 4 sertifika örneği · 1 hukuk dosyası · 2 web prototipi

---

## NEREDEN BAŞLAMALI?

| Amacınız | Açacağınız dosya |
|---|---|
| Sistemi bir bütün olarak anlamak | `01_Belgeler_PDF/EPNEXUS_00_Sistem_Kilavuzu.pdf` — **önce bunu okuyun** |
| Her şeyi tek dosyada okumak/yazdırmak | `01_Belgeler_PDF/00_TUM_BELGELER_BIRLESIK.pdf` (171 sayfa, yer imli) |
| Hukuk danışmanına göndermek | `04_Hukuk_Dosyasi/` içindeki PDF — tek başına gönderilebilir |
| Eğitimi hazırlamak / vermek | `01_Belgeler_PDF/EPNEXUS_03/04/05_*_Mufredati.pdf` |
| Kurucu Kohort'u davet etmek | `01_Belgeler_PDF/EPNEXUS_06_Kurucu_Kohort_Lansman_Kiti.pdf` |
| Sertifikayı matbaaya vermek | `03_Sertifika/` |
| Geliştiriciye brief vermek | `05_Web_Prototipleri/` |
| Belgeleri düzenlemek | `02_Belgeler_Kaynak_MD/` (markdown kaynaklar) |

---

## KLASÖR KLASÖR

### 📁 01_Belgeler_PDF — Ana belge seti

Baskıya hazır, A4, kapak + içindekiler + sayfa numaralı.

| Dosya | Sayfa | İçerik |
|---|---|---|
| `00_TUM_BELGELER_BIRLESIK.pdf` | 171 | Sekiz belgenin tamamı, belge başlıklarına yer imiyle atlanabilir |
| `EPNEXUS_00_Sistem_Kilavuzu.pdf` | 8 | **Sistemin haritası.** Belgeler, kademe merdiveni, gelir akışı, uygulama sırası, kararlar, riskler |
| `EPNEXUS_01_Fasilitator_Agi_Raporu.pdf` | 23 | 8 girişimin benchmark analizi (Math Pentathlon, Math for Love, Pentalitha, TAZOF, FLL, FIRST, Cuemath, Nearpod/Google), fiyatlar, gelir modelleri, 12 aylık projeksiyon, kanal planı |
| `EPNEXUS_02_Fasilitator_Agi_Yonetmeligi.pdf` | 25 | **Ağın anayasası.** 15 madde + EK-A imzalanabilir Marka ve Etik Sözleşmesi + EK-B kademe tablosu + EK-C Oyun Yayın Sözleşmesi |
| `EPNEXUS_03_Kademe_1_Mufredati.pdf` | 28 | 27 saat, 8 modül, dört oyunun uygulamalı öğretimi, 67 soruluk sınav bankası, 6 şablon |
| `EPNEXUS_04_Kademe_2_Mufredati.pdf` | 27 | 18 saatlik Kıdemli Fasilitatör kampı, iki parçalı bitirme projesi, 9 işletme şablonu |
| `EPNEXUS_05_Kademe_3_Mufredati.pdf` | 23 | 59 saatlik eğitmen eğitimi, gölge + süpervizyonlu ko-eğitmenlik protokolü |
| `EPNEXUS_06_Kurucu_Kohort_Lansman_Kiti.pdf` | 18 | 5 e-posta, WhatsApp/sosyal medya metinleri, webinar akışı, 13 SSS, TAZOF ve SEM teklif mektupları, 90 günlük takvim |
| `EPNEXUS_07_Oyun_Atolyesi_Programi.pdf` | 19 | Kademeli oyun tasarımı, mekanik kütüphanesi, jüri rubriği, Oyun Havuzu, fikri mülkiyet modeli |

### 📁 02_Belgeler_Kaynak_MD — Düzenlenebilir kaynaklar

Yukarıdaki sekiz belgenin markdown hâli. Değişiklik yapacaksanız **bunları düzenleyin**; PDF'ler bunlardan üretilir.

### 📁 03_Sertifika — Sertifika tasarımı

| Dosya | İçerik |
|---|---|
| `EPNEXUS_Sertifika_Kademe1_ORNEK.pdf` | Kademe 1, standart — A4 yatay, ön yüz + yetkinlik özeti arka yüz |
| `EPNEXUS_Sertifika_Kademe1_KURUCU_ORNEK.pdf` | Kurucu Fasilitatör şeritli varyant (ilk 50 kişi) |
| `EPNEXUS_Sertifika_Kademe2_ORNEK.pdf` | Kıdemli Fasilitatör |
| `EPNEXUS_Sertifika_Kademe3_ORNEK.pdf` | Master Fasilitatör |
| `EPNEXUS_Sertifika_SABLON.html` | Yer tutuculu şablon — `{{AD_SOYAD}}`, `{{SERTIFIKA_NO}}`, `{{VERILIS}}`, `{{GECERLILIK}}`, `{{MASTER_FASILITATOR}}`, `{{UNIVERSITE_SEM}}` alanlarını platform doldurur |

QR kod sertifika numarasından üretilir ve `epnexusgames.com/dogrula/<no>` adresine gider.

### 📁 04_Hukuk_Dosyasi — Danışmana gidecek dosya

`EPNEXUS_EK-C_Oyun_Yayin_Sozlesmesi_Hukuki_Inceleme.pdf` (11 sayfa) — **tek başına gönderilebilir.** İçinde bağlam notu, EPNEXUS'un hukuki varsayımları, incelenmesi istenen 15 madde, sözleşme taslağı ve dayanak iç düzenlemeler var.

### 📁 05_Web_Prototipleri — Tarayıcıda açılabilir

| Dosya | Ne yapar |
|---|---|
| `EPNEXUS_Platform_Prototipi.html` | Kamuya açık site + fasilitatör paneli: NX puan sistemi, akademi, uygulama raporu akışı, Oyun Atölyesi, rozetler, lig, mağaza, Master yönetim ekranı |
| `EPNEXUS_Sertifika_Uretici.html` | Alanları doldurup A4 yatay PDF olarak yazdırılan sertifika üretici; QR kodu canlı üretir |

Her ikisi de çift tıklayıp tarayıcıda açılır. *(Sertifika üreticisi QR için internet bağlantısı ister.)*

---

## SİSTEMİN ÖZETİ

```
KADEME 0 — Kâşif                 ücretsiz · sertifikasız · huninin ağzı
      ↓ 27 sa eğitim + sınav + 3 onaylı uygulama + 1 OYUN VARYANTI
KADEME 1 — Fasilitatör            1.950 ₺ (Kurucu) / 3.900 ₺ · 2 yıl
      ↓ 10 uygulama + 1 turnuva + rubrik ≥3,0 + seçim + 18 sa kamp
      ↓ + işletme dosyası + ÖZGÜN OYUN PROTOTİPİ
KADEME 2 — Kıdemli Fasilitatör    6.500 ₺ · 3 yıl · kendi kursunu açar, turnuva düzenler
      ↓ 1 yıl aktiflik + 20 mentorluk + 2 turnuva + kalibrasyon ≥%85 + DAVET
      ↓ + 59 sa program + YAYINA HAZIR OYUN + tasarım mentorluğu
KADEME 3 — Master Fasilitatör     ücretsiz · 2 yıl · Kademe 1 eğitimi verir, sertifika kararı verir
```

**Alınmış kararlar:** Fasilitatörün kendi kurs gelirinden pay alınmaz (%0) · Kurucu Kohort 1.950 ₺, yalnız ilk 50 · Kademe 3 davetle ve ücretsiz · **Oyun tasarımları tasarımcıya aittir** (katmanlı model, 12.09.2026) · Telif: özgün %10, ortak geliştirme %6, varyant %4.

---

## BAŞLAMADAN ÖNCE TAMAMLANMASI GEREKENLER

Sistem Kılavuzu'ndaki Ay 1 listesinin özeti. **Bu üçü bitmeden Kurucu Kohort daveti gönderilmemelidir:**

1. **Tüzel kişilik kurulumu** — ücret tahsili, fatura ve sözleşme için zorunlu
2. **Üniversite SEM protokolü** (Sakarya Ü. / YTÜ) — protokol yoksa "MEB'de geçerli" ifadesi kullanılmaz; Lansman Kiti SSS 5.1'in dürüst versiyonu kullanılır
3. **Hukuki kontrol** — Yönetmelik EK-A ve EK-C (04 klasöründeki dosya)

---

*Bu set 11-14 Eylül 2026 tarihlerinde hazırlanmıştır. Hukuki, mali ve sertifika geçerliliğine ilişkin tüm maddeler yürürlükten önce uzman görüşüyle doğrulanmalıdır. Belgeler v1.x'tir ve Kurucu Kohort geri bildirimiyle revize edilmek üzere yazılmıştır.*
