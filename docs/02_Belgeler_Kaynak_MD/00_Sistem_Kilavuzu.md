# EPNEXUS FASİLİTATÖR AĞI — SİSTEM KILAVUZU
## Sekiz belge, bir sertifika seti, bir prototip, bir uygulama sırası

**Sürüm:** v1.2 · **Tarih:** 12 Eylül 2026
**v1.2'de ne değişti:** Katmanlı fikri mülkiyet modeli onaylandı ve belgelere karar olarak işlendi; lansman kitine oyun tasarımı şartı eklendi.
**v1.1'de ne değişti:** Oyun Atölyesi programı eklendi — her kademe artık kendi alanında bir eğitsel oyun üretmeden tamamlanmıyor. Yönetmeliğe fikri mülkiyet modeli ve EK-C Oyun Yayın Sözleşmesi, müfredatlara tasarım modülleri (M8 / KM7 / MM8) girdi. Sertifika tasarımı hazırlandı.
**Bu dosya nedir:** Sistemin haritası. Hangi belgenin ne işe yaradığını ve hangi sırayla kullanılacağını söyler. Önce bunu okuyun.

---

## 1. SİSTEM NEDEN VAR — TEK PARAGRAF

EPNEXUS'un elinde çalışan bir ürün var: dört kutulu matematik oyunu, üç yıllık saha doğrulaması, 30'dan fazla devlet okulu, 3.000'den fazla katılımcı, 8,7/10 memnuniyet. Olmayan şey satış değil, **dağıtım kanalı.** Benchmark araştırması, incelenen sekiz girişimin hiçbirinin oyun satarak büyümediğini gösterdi — hepsi önce bir insan ağı kurdu, oyunu o ağın içinden akıttı. Bu sistem o ağı kurar: dört kademe, üç müfredat, bir yönetmelik, bir lansman planı ve çalışan bir platform prototipi.

---

## 2. BELGELER VE NE İŞE YARARLAR

| # | Belge (dosya adı) | Ne için | Kimin elinde olmalı |
|---|---|---|---|
| **00** | **Sistem Kılavuzu** *(bu dosya)*<br>`EPNEXUS_00_Sistem_Kilavuzu.md` | Harita ve uygulama sırası | Kübra |
| **01** | **Fasilitatör Ağı Raporu**<br>`EPNEXUS_Fasilitator_Agi_Raporu.md` | Neden bu model? 8 girişimin benchmark analizi, fiyatlar, gelir modelleri, 12 aylık projeksiyon, kanal planı, riskler | Kübra, yatırımcı/kurum sunumları |
| **02** | **Fasilitatör Ağı Yönetmeliği**<br>`EPNEXUS_Fasilitator_Agi_Yonetmeligi.md` | Ağın anayasası: kademeler, haklar, yükümlülükler, gelir paylaşımı, kalite, yaptırım, itiraz. **EK-A: imzalanabilir Marka ve Etik Sözleşmesi.** EK-B: tek sayfa kademe tablosu | Tüm ekip · hukuk danışmanı · her fasilitatöre verilir |
| **03** | **Kademe 1 Müfredatı**<br>`EPNEXUS_Kademe1_Fasilitator_Mufredati.md` | 27 saatlik Fasilitatör eğitimi: 8 modül ders planı (M8 oyun tasarımı dahil), dört oyunun uygulamalı öğretimi, 67 soruluk sınav bankası, 6 şablon | Kübra, Güneş (eğitmenler) |
| **04** | **Kademe 2 Müfredatı**<br>`EPNEXUS_Kademe2_Kidemli_Fasilitator_Mufredati.md` | 18 saatlik Kıdemli Fasilitatör kampı: program tasarımı, turnuva direktörlüğü, kurumsal satış, işletmecilik, mentorluk, ileri oyun tasarımı. İki parçalı bitirme projesi + 9 işletme şablonu | Kübra, Master eğitmenler |
| **05** | **Kademe 3 Müfredatı**<br>`EPNEXUS_Kademe3_Master_Fasilitator_Mufredati.md` | 59 saatlik Master Fasilitatör (eğitmen eğitimi): andragoji, mikro öğretim, kamp yönetimi, sertifika kararı, ürün kurulu, tasarım mentorluğu ve oyun jürisi. + gölge ve süpervizyonlu ko-eğitmenlik protokolü | Kübra (ilk Master kohortunu o yürütecek) |
| **06** | **Kurucu Kohort Lansman Kiti**<br>`EPNEXUS_Kurucu_Kohort_Lansman_Kiti.md` | İlk 50 fasilitatörü kazanma planı: 5 e-posta, WhatsApp/sosyal medya metinleri, webinar akışı, 10 SSS cevabı, TAZOF ve SEM teklif mektupları, 90 günlük takvim, ölçüm panosu | Kübra, Güneş, Esra (satış) |
| **07** | **Oyun Atölyesi Programı**<br>`EPNEXUS_Oyun_Atolyesi_Programi.md` | Her kademenin oyun tasarım çıktısı, tasarım çerçevesi ve mekanik kütüphanesi, test protokolü, jüri rubriği, Oyun Havuzu ve **fikri mülkiyet modeli** | Tüm ekip · hukuk danışmanı · her fasilitatöre verilir |
| **08** | **Sertifika seti** *(PDF + HTML şablon)* | Kademe 1/2/3 sertifikaları, Kurucu varyantı, QR doğrulamalı ön yüz + yetkinlik özeti arka yüz, yer tutuculu şablon | Mücahit (platform entegrasyonu), matbaa |
| **09** | **Platform prototipi** *(claude.ai artifact — sohbetteki kart)* | Tıklanabilir web sitesi ve fasilitatör paneli: NX puan sistemi, akademi, rapor akışı, rozetler, lig, mağaza, Master yönetim ekranı | Mücahit (teknik), geliştirici brief'i olarak |

---

## 3. SİSTEMİN ÖZETİ — BİR SAYFA

### 3.1 Kademe merdiveni

```
KADEME 0 — Kâşif                 ücretsiz · sertifikasız · huninin ağzı
      ↓ 27 sa eğitim + sınav + 3 onaylı uygulama + 1 OYUN VARYANTI 🌱
KADEME 1 — Fasilitatör            1.950 ₺ (Kurucu) / 3.900 ₺ · 2 yıl
      ↓ 10 uygulama + 1 turnuva + rubrik ≥3,0 + seçim + 18 sa kamp
      ↓ + işletme dosyası + ÖZGÜN OYUN PROTOTİPİ 🌿
KADEME 2 — Kıdemli Fasilitatör    6.500 ₺ · 3 yıl · kendi kursunu açar, turnuva düzenler
      ↓ 1 yıl aktiflik + 20 mentorluk + 2 turnuva + kalibrasyon ≥%85 + DAVET
      ↓ + 59 sa program + YAYINA HAZIR OYUN 🌳 + tasarım mentorluğu
KADEME 3 — Master Fasilitatör     ücretsiz · 2 yıl · Kademe 1 eğitimi verir, sertifika kararı verir
```

**Her kademe bir oyun üretir.** Fasilitatör sadece eğitim tamamlayarak mezun olmaz; kendi branşında,
kendi kazanımına bağlı bir eğitsel oyun teslim eder. Bu tasarımlar **EPNEXUS Oyun Havuzu**'nda
toplanır ve EPNEXUS fen, Türkçe, okul öncesi gibi yeni alanlara açılırken hem hammaddeyi hem de
o alanı bilen tasarımcıyı hazır bulur. Tasarımcı eserinin sahibi kalır (bkz. 3.5).

### 3.2 Paranın aktığı yer

| Kaynak | Fasilitatör | EPNEXUS |
|---|---|---|
| Fasilitatörün kendi kursu | **%100** | %0 |
| Materyal | Fiyat kademesi farkı | Üretim + marj |
| Turnuva | %40 | %30 (+%30 operasyon) |
| Okul lisansı yönlendirmesi | %15 | %85 |
| Kademe 1 eğitimi | %40 (yalnız Master) | %60 |

**Neden fasilitatörün kursundan pay alınmıyor:** Denetlenemez, tahsil edilemez, ağda küskünlük üretir. EPNEXUS materyalden, sertifikasyondan ve yenilemeden kazanır — bunlar ölçülebilir ve fasilitatörün kazancıyla aynı yöne çalışır.

### 3.3 Ağı diri tutan üç mekanizma

| Mekanizma | Nasıl çalışır | Nerede tanımlı |
|---|---|---|
| **Talep yönlendirme** | EPNEXUS'a gelen okul/veli talepleri bölgedeki aktif fasilitatöre atanır; Kademe 2 öncelikli | Yönetmelik Md. 9 |
| **Yenileme koşulu** | K1: yılda 6 uygulama veya 2 atölye. Karşılanmazsa kademe düşer | Yönetmelik Md. 6 |
| **Sezon takvimi** | EPNEXUS Matematik Oyunları Ligi — okulun bütçe kararını tetikleyen şey turnuvadır | Yönetmelik Md. 10 |

> Bu üçünden en az biri kurulmazsa ağ 12. ayda erir. Benchmark'taki sekiz girişimin tamamı bunlardan en az birine sahipti.

### 3.4 12 aylık gerçekçi hedef

| | Hedef |
|---|---|
| Kademe 0 üye | 5.000 |
| **Kademe 1 sertifika** | **250** |
| Kademe 2 | 30 |
| Master Fasilitatör | 20-30 |
| Toplam ciro | **~3,16 milyon ₺** |
| En kritik metrik | **90 gün sonra hâlâ aktif fasilitatör oranı ≥%55** |

### 3.5 Oyun Havuzu ve fikri mülkiyet

**Temel ilke (onaylandı, 12.09.2026):** *Tasarımcı, ürettiği oyunun eser sahibidir.* Bir tasarımın sertifika koşulu olması telif devri anlamına gelmez. EPNEXUS havuzdaki hiçbir oyunu, tasarımcısıyla ayrı bir yayın sözleşmesi (Yönetmelik EK-C) imzalamadan ürünleştirmez.

| Katman | İçerik |
|---|---|
| 1 — Sahiplik | Eser tasarımcıya aittir |
| 2 — EPNEXUS lisansı | Havuzda yayımlama + eğitimde örnek gösterme; münhasır değil, ücretsiz, süresiz |
| 3 — İlk teklif hakkı | Tasarımcı başka yayıncıya giderse EPNEXUS 90 gün içinde teklif verebilir |
| 4 — Yayın sözleşmesi | Telif: özgün %10 · ortak geliştirme %6 · varyant %4 (net satış üzerinden) |
| 5 — Manevi haklar | Tasarımcının adı türeyen her üründe anılır |

**Neden böyle:** Öğretmenlerin sertifika için ürettiği tasarımları karşılıksız toplayan bir yapı, ilk ürün çıktığında dağılır. Bu model hem adil hem de EPNEXUS'un genişlemesi için fazlasıyla yeterlidir.

---

## 4. UYGULAMA SIRASI — NE ÖNCE YAPILIR?

### 🔴 AY 1 — BUNLAR OLMADAN HİÇBİR ŞEY BAŞLAMAZ

| Sıra | İş | Belge | Neden önce |
|---|---|---|---|
| 1 | **Tüzel kişilik kurulumu** | — | Ücret tahsili, fatura ve sözleşme için zorunlu. Bu olmadan Kurucu Kohort daveti gönderilemez |
| 2 | **Üniversite SEM protokol görüşmesi** (Sakarya Ü. / YTÜ) | 06 § 7.2 | "Sertifika geçerli mi?" sorusunun cevabı. Protokol yoksa **"MEB'de geçerli" denmez** — Lansman Kiti SSS 5.1'in dürüst versiyonu kullanılır |
| 3 | **Yönetmelik + EK-A sözleşmesinin hukuki kontrolü** | 02 | Sertifika verilmeden imzalanacak belge |
| 4 | **TAZOF toplantısı** | 06 § 7.1 | Hasan Gök bağlantısı hazır; karşılıklı tanıma 30-50 kişilik hazır kitle demek |
| 5 | **Sakarya saha listesinin çıkarılması** | 06 § 8 | Kurucu Kohort'un çıkacağı tek liste bu |
| 6 | **Fiyat listesinin dinamik tabloyla mutabakatı** | 01, 02 | Materyal fiyatları kataloğa göre düzeltildi; Sheets ile hizalanmalı |

### 🟡 AY 2 — İNŞA

| Sıra | İş | Belge |
|---|---|---|
| 7 | 19 saatlik asenkron video çekimi (M1-M8) | 03 |
| 8 | Sınav bankasının platforma girilmesi | 03 § Bölüm 3 |
| 8b | **EK-C hukuki kontrolü + Oyun Havuzu veri yapısı** | 02 EK-C · 07 § 6 |
| 9 | Platform MVP — 6 hafta, WordPress + LearnDash + GamiPress önerisi | 01 § C.4, 07 |
| 10 | **Kurucu Kohort davet e-postaları** (E-posta 1) | 06 § 2 |
| 11 | Bilgilendirme webinarı (2 oturum) | 06 § 4 |

### 🟢 AY 3 — LANSMAN

| Sıra | İş | Belge |
|---|---|---|
| 12 | Kayıt kapanışı, kohort listesi | 06 § 8 |
| 13 | **Kurucu Kohort canlı atölyesi** (8 saat) | 03 § M3.5 |
| 14 | 48 saat içinde bireysel geri bildirim | 03 § Ek-6 |
| 15 | İlk 10 Master Fasilitatör adayının belirlenmesi | 05 § 0.2 |
| 16 | Lig 2027 takviminin ilanı | 02 Md. 10 |
| 17 | Sonuç ölçümü ve müfredat v1.1 | 06 § 9 |

---

## 5. TEMEL KARARLAR

Aşağıdaki kararlar alınmıştır ve belgelere işlenmiştir. Değiştirirseniz sağ sütundaki belgeler güncellenmelidir.

| # | Karar | Durum ve içerik | Nerede |
|---|---|---|---|
| 1 | **Fasilitatörün kurs gelirinden pay alınacak mı?** | ✅ **Hayır, %0** | 02 Md. 5.2 · 04 § 0.1 · 07 |
| 2 | **Kurucu Kohort fiyatı** | ✅ 1.950 ₺ (%50), yalnız ilk 50 | 02 Md. 5.1 · 06 tüm metinler · 07 |
| 3 | **Kademe 3 ücretli mi?** | ✅ **Hayır — davetle ve ücretsiz**, yükümlülük karşılığı | 05 § 0.1 · 02 Md. 5.1 |
| 4 | **Fasilitatörün tasarladığı oyun kime ait?** | ✅ **ONAYLANDI 12.09.2026 — Katmanlı model.** Eser tasarımcıya aittir; EPNEXUS'a ücretsiz eğitim/havuz lisansı + 90 günlük ilk teklif hakkı; ürünleştirme ayrı sözleşme ve telifle | 02 Md. 13.6-13.11 · 02 EK-C · 07 § 7 |
| 5 | **Telif oranları** | ✅ **ONAYLANDI** — özgün %10 · ortak geliştirme %6 · varyant %4 (net satış üzerinden) | 02 Md. 5.2 · 02 EK-C · 07 § 7.2 |

---

## 6. RİSKLER — EN YÜKSEK ÜÇÜ

| Risk | Olasılık | Önlem | Nerede |
|---|---|---|---|
| **Sertifikanın MEB'de geçersizliği** | Yüksek | SEM protokolü şart; protokolsüz "MEB'de geçerli" denmez | 01 § A.5 · 06 § 5.1 |
| **Fasilitatör ilk yıldan sonra pasifleşir** | Çok yüksek | Talep yönlendirme + yenileme koşulu + sezon takvimi | 02 Md. 6, 9, 10 |
| **Çekirdek ekibin kapasitesi (4 kişi)** | Yüksek | Kademe 3 ilk 6 ayda kurulmalı; eğitimin %65'i asenkron | 05 § 0 |
| **Tasarım şartı tamamlama oranını düşürür** | Yüksek | Kademe 1'de varyant yeterli (özgünlük istenmiyor), şablonlar hazır, 6 hafta süre. Oran %70'in altına düşerse şart kaldırılmaz, **hafifletilir** | 07 § 9 |
| **Telif/sahiplik uyuşmazlığı** | Orta | Katmanlı model + EK-C + oranların baştan ilanı + hukuk kontrolü | 02 Md. 13 · 07 § 7 |

---

## 7. AKADEMİK DAYANAK — TEK LİSTE

Sistemin her yerinde kullanılan kaynaklar. Okul sunumlarında ve fon başvurularında bu liste kullanılır; **abartısız aktarım kuralı Kademe 3 MM5'te tanımlıdır.**

- **Mert, B. & Koparan, T. (2024).** Matematik Öğretiminde Eğitsel Oyunların Akademik Başarıya Etkisi: Bir Meta-Analiz Çalışması. *Karaelmas Eğitim Bilimleri Dergisi*, 12(1), 45-60. → 32 çalışma, **0,544 etki büyüklüğü (orta düzey)**, anlamlı yayın yanlılığı yok. https://dergipark.org.tr/tr/pub/kebd/article/1426458
- **DeWitt, D., Alias, N. & Al Amri, M. (2026).** Systematic literature review: gamification in teacher professional training (2019-2025). *Frontiers in Education*. → Puan %88,9, rozet/seviye %48,1, liderlik tablosu %40,7 kullanım; geri bildirim kritik değişken; **boylamsal çalışma eksikliği uyarısı.** https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2026.1819092/full
- **Sağlam Arslan, A. & Şahinoğlu, A. (2021).** Grup Mentorluk Uygulamalarının Öğrencilerin Akademik Başarıları Üzerindeki Etkileri. *Gazi Eğitim Fakültesi Dergisi*, 41(1). → Öğretmenin mesleki gelişimini hedefleyen mentörlük, öğrenci başarısını olumlu etkiliyor. https://dergipark.org.tr/en/pub/gefad/article/853239
- **Kuran, K. (2014).** Mikro Öğretimin Öğretmenlik Meslek Bilgi ve Becerilerinin Kazanılmasına Etkisi. *MKÜ Sosyal Bilimler Enstitüsü Dergisi*, 6(11). → **Etki ikinci mikro öğretim turunda ortaya çıkıyor.** https://dergipark.org.tr/tr/pub/mkusbed/issue/19558/208498
- **Yeşilyurt, E. (2021).** Mikro Öğretim Yöntemi ve Örnek Ölçme-Değerlendirme Formunun Geliştirilmesi. *İnsan ve Toplum Bilimleri Araştırmaları Dergisi*. https://dergipark.org.tr/en/pub/itobiad/issue/66167/901409
- **Blankenship, S. S. & Ruona, W. E. A. (2007).** Professional Learning Communities and Communities of Practice. ERIC ED504776. → Başarı koşulları: liderlik, güven kültürü, **yapılandırılmış bilgi paylaşım mekanizması.** https://files.eric.ed.gov/fulltext/ED504776.pdf
- **Tam Sayılar Öğretiminde Eğitsel Oyun Kullanımı.** *Eğitim Bilim ve Araştırma Dergisi*. → Salur Kazan'ın doğrudan dayanağı. https://dergipark.org.tr/tr/pub/ebad/article/982300
- **Oyun-Tabanlı Öğrenme Ortamlarının Akademik Başarıya Etkisi: Meta-Analiz.** *Kastamonu Eğitim Dergisi*. https://dergipark.org.tr/tr/pub/kefdergi/article/479146
- **Knowles, M.** Yetişkin öğrenme kuramı (andragoji). https://www.ebsco.com/research-starters/education/andragogy

**Benchmark kaynakları** (01 no'lu raporun kaynakçasında tam liste): Math Pentathlon · Math for Love · Pentalitha · TAZOF · Bilim Kahramanları Derneği (FLL Türkiye) · FIRST · Cuemath · Google for Education Certified Trainer · Reach Capital (Nearpod PioNear analizi) · BO Enstitü ve üniversite SEM fiyat çıpaları.

**Ürün kaynağı:** EPNEXUS Ürün Kataloğu (Ağustos 2026) — tüm oyun bilgileri, kazanım kodları ve fiyatlar buradan alınmıştır.

---

## 8. SÜRÜM VE GÜNCELLEME

Tüm belgeler **v1.0**'dır ve Kurucu Kohort geri bildirimiyle revize edilmek üzere yazılmıştır.

**Revizyon tetikleyicileri:**
- SEM protokolü imzalandığında → 02, 06 (sertifika ifadeleri), 07
- İlk kohort tamamlandığında → 03 (v1.1), 06 (§9 gerçekleşen metrikler)
- Fiyat değişikliği → 01, 02, 06, 07 (**Yönetmelik Md. 15.2: en az 60 gün önce duyurulur, geriye dönük uygulanmaz**)
- İlk Master kohortu → 05 (v1.1)

**Belgelerin tek doğruluk kaynağı:** Ücret, gelir paylaşımı ve kademe koşullarında çelişki çıkarsa **Yönetmelik (02) esas alınır**; diğer belgeler ona göre düzeltilir.

---

*Bu sistem 11-12 Eylül 2026'da hazırlanmıştır. Hukuki, mali ve sertifika geçerliliğine ilişkin tüm maddeler yürürlükten önce uzman görüşüyle doğrulanmalıdır.*
