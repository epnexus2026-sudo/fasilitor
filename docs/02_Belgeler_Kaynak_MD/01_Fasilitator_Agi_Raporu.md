# EPNEXUS Fasilitatör Ağı — Benchmark Araştırması, Kuruluş Modeli ve Oyunlaştırılmış Web Platformu Planı

**Hazırlayan:** EPNEXUS için araştırma ve strateji raporu
**Tarih:** 11 Eylül 2026
**Kapsam:** (A) Ulusal/uluslararası eğitsel oyun + fasilitatör ağı girişimlerinin incelenmesi, (B) EPNEXUS fasilitatör ağı kuruluş modeli, (C) Oyunlaştırma tabanlı web platformu planı

> **Kaynak notu:** Her bulgunun yanında kaynağı belirtilmiştir. Fiyatlar kaynakların yayın tarihindeki değerleridir; TL tutarları Eylül 2026 itibarıyla ilgili kurumların ilan ettiği rakamlardır. Rapor sonundaki **Kaynakça** bölümünde tüm bağlantılar listelenmiştir.

---

## 0. YÖNETİCİ ÖZETİ

**Araştırmanın en kritik bulgusu:** İncelenen 8 girişimin hiçbiri "oyun satarak" büyümemiştir. Hepsi **önce bir ağ (insan) kurmuş, oyunu o ağın içinden akıtmıştır.** Oyun ürünü, ağın var olma gerekçesi değil, ağın çalıştırdığı yakıttır.

Bu, EPNEXUS'un bugünkü tıkanıklığının (4 kutulu oyun hazır, 3.000+ kullanıcı denemesi var, 8.7/10 memnuniyet var, **satış yok**) doğrudan teşhisidir: ürün sorunu değil, **dağıtım kanalı ve meşruiyet aktarıcısı** sorunu vardır. Fasilitatör ağı tam olarak bunu çözen yapıdır.

**Önerilen model — 4 kademeli "EPNEXUS Oyun Fasilitatörü" sertifikasyon ağı:**

| Kademe | Unvan | Kim | Ödediği | Kazandığı |
|---|---|---|---|---|
| 0 | Kaşif (ücretsiz) | Herkes | 0 TL | Dijital kaynaklar, topluluk, puan sistemi |
| 1 | Sertifikalı Fasilitatör | Öğretmen | ~3.900 TL | Sertifika + başlangıç seti + %15 materyal indirimi |
| 2 | Kıdemli Fasilitatör | Aktif uygulayıcı | ~6.500 TL | Bölgesel atölye açma hakkı + 500'lü fiyat kademesi + gelir payı |
| 3 | Eğitmen Eğitmeni (Master) | Seçilmiş 20-30 kişi | Davetle | Kademe 1 eğitimi verme + eğitim gelirinden %40 pay |

**İlk 12 ayda gerçekçi hedef:** 250 sertifikalı fasilitatör, **~1,9–2,4 milyon TL** doğrudan sertifikasyon geliri + bu fasilitatörlerin açacağı tahmini **400-600 kutu oyun seti** satışı. Kritik nokta: sertifikasyon geliri nakit akışını kurtarır, **asıl değer fasilitatörün okuluna açtığı kapıdır.**

**Web platformu:** Salesforce Trailhead mantığında, **puanın satın alma gücü olan** (indirim, kademe hakkı, turnuva kontenjanı) bir öğrenme + topluluk platformu. Saf "rozet toplama" değil — akademik literatür saf rozet sistemlerinin etkisinin kısa ömürlü olduğunu gösteriyor (DeWitt vd., 2026).

---

# BÖLÜM A — BENCHMARK ARAŞTIRMASI

## A.1 Karşılaştırmalı Panorama

| Girişim | Ülke | Çekirdek ürün | Ağ modeli | Fasilitatör ödüyor mu? | Ana gelir |
|---|---|---|---|---|---|
| **Math Pentathlon** | ABD | 5 matematik oyunu + turnuva | Okul kulübü + gönüllü oyun hakemi | Hayır (okul materyal alır) | Materyal seti satışı |
| **Math for Love** | ABD | Kutu oyunları + müfredat | Ağ yok; içerik + ücretsiz PD | Hayır | Oyun + PDF müfredat satışı |
| **Pentalitha** | Türkiye | Matematik oyunları programı | Doğrudan okul sözleşmesi + eğitimli öğretmen | Okul öder | Okul programı (B2B) |
| **TAZOF** | Türkiye | Akıl/zeka oyunları + turnuva | 3 kademeli eğitmenlik + 81 il temsilciliği + kulüp | **Evet** | Eğitmenlik + lisans + turnuva |
| **Bilim Kahramanları (FLL TR)** | Türkiye | STEM turnuva | Gönüllü antrenör + gönüllü hakem | Hayır (kayıt ücretsiz) | Sponsorluk + malzeme |
| **FIRST (global)** | ABD | STEM turnuva | Gönüllü mentor ağı | Hayır (takım öder) | Takım kayıt ücreti |
| **Cuemath** | Hindistan | Matematik metodolojisi | Ev tabanlı öğretmen partner ağı | **Evet** (kayıt bedeli) | Öğrenci ücretinden pay |
| **Nearpod / Google** | ABD | Yazılım | Elçi (ambassador) / sertifikalı eğitmen | Sembolik ($10-25) | Ürün lisansı (ağ = pazarlama) |

---

## A.2 Girişim Girişim Derin İnceleme

### 1) Math Pentathlon® (Pentathlon Institute, Indianapolis, ABD)

**Ne yapıyor:** Anaokulundan 7. sınıfa 4 seviyeli (Division I-IV), her seviyede **5 matematik oyunundan** oluşan bir program; okulda ders içinde, kulüpte veya evde kullanılıyor ve yılda bir **turnuvayla** taçlanıyor. ([mathpentath.org/programs](https://www.mathpentath.org/programs/))

**Kurgunun mantığı — ve EPNEXUS için en önemli ders:**
Turnuva, oyunun kendisinden daha değerli bir üründür. Oyun tek başına "güzel bir materyal"dir; turnuva ise okulun takvimine giren, velinin izlediği, öğrencinin hazırlandığı bir **etkinliktir**. Okul, oyunu turnuvaya girebilmek için alır. Yani **satın alma gerekçesini oyunun kendisi değil, ağın takvimi üretir.**

**Fiyat listesi (2024-2026 dönemi, [Essential Materials](https://www.mathpentath.org/essential-materials/)):**

| Paket | Kapasite | Fiyat | Öğrenci başı |
|---|---|---|---|
| Family Game Set | 4 öğrenci | $95 | ~$24 |
| Small Club Game Set | 12 öğrenci | $250 | ~$21 |
| Classroom Game Set | 24 öğrenci | $450 | ~$19 |
| Premiere Family (öğretim kaynaklı) | 4 öğrenci | $210 | ~$52 |
| Professional Small Club | 12 öğrenci | $365 | ~$30 |
| Professional Classroom | 24 öğrenci | $565 | ~$24 |

**Fiyatlandırma stratejisi:** Aynı içerik 3 kapasitede paketlenmiş; "Professional" versiyonlar öğretim rehberi, etkinlik kitabı ve araştırma klasörü ekleyerek fiyatı ~%25 yukarı taşıyor. **Öğrenci başı maliyeti göstererek** ("$19/öğrenci") okul müdürünün bütçe diline çevirmişler — bu ikna tekniği doğrudan kopyalanabilir.

**Eğitim modeli:** Akşam oryantasyonları (18:30-21:00), Cumartesi tam gün atölyeleri (08:00-15:00), **1 yıllığına kiralanan eğitim videoları**, Eylül-Kasım arası yüz yüze atölyeler ve "Game Monitor" (oyun hakemi) eğitimi. Kuruma özel eğitim talep üzerine düzenleniyor. ([mathpentath.org/indianapolis](https://www.mathpentath.org/indianapolis/), [overview-training](https://www.mathpentath.org/overview-training-2/))

**Ağ yapısı:** Bölgesel merkezler (Texas-Austin, Dallas/Fort Worth, Indiana-Ohio, Michigan-Ohio, Colorado). Ulusal ofis küçük; ağ **bölge merkezleri** üzerinden çalışıyor. Kar amacı gütmeyen kuruluş statüsünde.

**EPNEXUS'a çıkarım:** Turnuva takvimi + bölge merkezleri + kapasiteye göre paketlenmiş materyal. EPNEXUS'un 4 kutulu oyunu zaten bir "pentatlon" (5'li set) mantığına uygun; **"EPNEXUS Matematik Oyunları Ligi"** kurulabilir.

---

### 2) Math for Love (Seattle, ABD)

**Ne yapıyor:** Dan Finkel ve Katherine Cook (karı-koca) tarafından kurulmuş; matematik kutu oyunları (Prime Climb, Tiny Polka Dot, Multiplication by Heart), PDF müfredat paketleri ve ücretsiz ders kütüphanesi. ([mathforlove.com/about](https://mathforlove.com/about/))

**Büyüme hikâyesi:** 2014'te **Kickstarter** kampanyasıyla Prime Climb'i çıkardılar; ardından Tiny Polka Dot geldi. Dan Finkel'in TEDx konuşması ("Five Principles of Extraordinary Math Teaching") ve New York Times Numberplay blog yazarlığı, ürünü tanıtan asıl motor oldu. ([Seattle's Child röportajı](https://www.seattleschild.com/making-math-fun-for-kids-seattle-couple-creates-board-games-teaching-tools/))

**İlk müşteriye ulaşma yolu — EPNEXUS için kritik:**
Önce **kitle fonlaması** (ön sipariş = nakit + sosyal kanıt), sonra **kişisel otorite** (TEDx + köşe yazarlığı), sonra ürün satışı. Ağ kurmadılar; bunun yerine **kurucuyu düşünce lideri yaptılar.** Kübra'nın akademik geçmişi (2 kitap bölümü, 1 makale, TÜRKBİLMAT bildirisi) bu yolu EPNEXUS için erişilebilir kılıyor.

**Fiyat listesi ([mathforlove.com/shop](https://mathforlove.com/shop/)):**

| Ürün tipi | Örnek | Fiyat |
|---|---|---|
| Kutu oyunu | Prime Climb | $26,95 |
| Kutu oyunu | Tiny Polka Dot | $14,95 |
| Kutu oyunu | Multiplication by Heart | $25,95 |
| Oyun paketi | Zeno Bundle | $104,95 |
| **Print-and-Play PDF** | Prime Climb PDF | **$10,00** |
| **Print-and-Play PDF** | Tiny Polka Dot PDF | **$5,00** |
| Müfredat (sınıf çifti) | 1-2, 3-4, 5-6. sınıf | $109,95 |
| Müfredat (tek sınıf) | K-8 | $95 – $179 |
| Mini kurs | Mathematical Games Minicourse | $19,95 (ind.) |
| Poster | Prime Climb Hundreds Chart | $5,00 |

**Üç fiyat katmanı stratejisi (çok önemli):**
1. **$5-10 print-and-play PDF** → sıfır maliyetli deneme, sınırsız coğrafi erişim, kargo yok
2. **$15-27 fiziksel oyun** → gerçek gelir
3. **$95-179 müfredat** → en yüksek marj, kurumsal alıcı

EPNEXUS'un **kargo ve gümrük engeli olmadan uluslararası pazara girmesinin en hızlı yolu bu ilk katmandır.** Hazineleri Topla'nın print-and-play PDF sürümü, bugün Shopier'de duran fiziksel kutudan çok daha hızlı satılabilir.

**Profesyonel gelişim:** Ücretsiz online PD videoları sunuyorlar — ağ kurmuyorlar ama **öğretmeni ücretsiz içerikle içeri alıp müfredat/oyun satıyorlar** (freemium huni).

---

### 3) Pentalitha — Matematik Oyunları (Türkiye)

**En yakın yerli rakip.** ([pentalitha.com](https://pentalitha.com/))

**Model:** Ürün satmıyorlar, **program satıyorlar.** Üç programları var:
- **Okulda Pentalitha** — matematik dersine entegrasyon
- **Hazırlayıcı Pentalitha** — anaokulu
- **Tamamlayıcı Pentalitha** — okul dışı

**Pakete dahil edilen hizmetler:** Öğretmen eğitimi, oyun entegrasyonu ve farklılaştırma desteği, **haftalık bilgilendirme/danışmanlık**, malzeme temini, okulda etkinlik organizasyonu, **veli atölyeleri**.

**Müşteri portföyü:** Açı, Başkent, Evrim, Hisar, Koç, Terakki, PEV Okulları — yani Türkiye'nin en üst segment özel okulları. Ayrıca **Nesin Matematik Köyü** ile kamp ve atölye iş birliği.

**Stratejik okuma — EPNEXUS için en önemli rakip analizi:**
Pentalitha, **fiyat listesini yayımlamıyor.** Bu bilinçli: her okulla özel sözleşme yapıyorlar, dolayısıyla fiyat karşılaştırmasına girmiyorlar. Ağları yok — merkezden, az sayıda eğitimli öğretmenle, **az sayıda yüksek bütçeli okula** hizmet veriyorlar. Bu model yüksek marjlı ama **ölçeklenmesi kurucu ekibin takvimiyle sınırlı.**

**EPNEXUS'un boşluğu tam burada:** Pentalitha üst segment 20-30 okulu tutuyor. Türkiye'de ~70.000 ilkokul/ortaokul var. **Fasilitatör ağı, Pentalitha'nın ölçekleyemediği orta segmenti ve Anadolu'yu açar.** EPNEXUS Pentalitha ile aynı sahada rekabet etmemeli; "Pentalitha'nın kurumsal hizmet modeli" yerine "TAZOF'un ağ modeli"ni matematiğe uygulamalı.

**Ayrıca dikkat:** Nesin Matematik Köyü iş birliği, Türkiye'de matematik topluluğunda meşruiyet kazanmanın en güçlü kartlarından biri — EPNEXUS için de değerlendirilebilir bir kanal.

---

### 4) TAZOF — Tüm Akıl ve Zeka Oyunları Federasyonu (Türkiye)

**EPNEXUS'un kopyalaması gereken yapı budur.** Kübra'nın halihazırda TAZOF içinden Hasan Gök (Eğitim Koordinatörü) ve Zekai Kalafat ile bağlantısı olması, bu modeli hem incelemek hem de ortaklık kurmak için olağanüstü bir avantaj.

**Ağ mimarisi ([tazof.org.tr](https://www.tazof.org.tr/)):**
- Merkez yönetim + yönetim kurulu + komisyon bazlı yönetişim
- **81 il temsilciliği** ve bölge koordinatörleri
- Bölge koordinatörlerine bağlı **kulüp sistemi**
- **Master eğitmen (usta öğretici) ağı**
- Lisans ve idari sistemler (dijital altyapı)
- **TAZOF Akademi** — kendi uygulaması üzerinden kurslar
- Türkiye Akıl ve Zeka Oyunları Turnuvası (8. yılında)

**Eğitmenlik kademe sistemi ([SSS sayfası](https://www.tazof.org.tr/sikca-sorulan-sorular)):**

| Derece | İçerik | Halk Eğitim'de açabildiği kurs |
|---|---|---|
| **1. Derece** | 38 oyun öğretimi (6'sı turnuva oyunu) → "1. Derece Zekâ Oyunları Öğreticiliği" | 150 saat (başlangıç), 100 saat (okul öncesi) |
| **2. Derece** | 1. derece ön koşul | 150 saat (orta düzey) |
| **3. Derece** | İleri seviye | 150 saat (ileri düzey) |

**Modelin dehası — üç katmanlı kilitleme:**

1. **Giriş kolay:** "Merak duyan, oyun oynamayı seven herkes" eğitime katılabilir → huninin ağzı geniş.
2. **Ekonomik karşılık somut:** Halk Eğitim Merkezlerinde kurs açma hakkı → sertifika bir **gelir aracına** dönüşüyor. (Koşul: eğitim fakültesi mezunu veya pedagojik formasyon + Halk Eğitim usta öğreticilik belgesi.)
3. **Kademe zorunluluğu:** 2. dereceye geçmek için 1. derece şart → **tekrar eden gelir**, tek seferlik satış değil.

**Turnuva ile ağı besleme:** Sertifika olmadan da turnuvaya öğrenci getirilebiliyor → turnuva, sertifikasız öğretmeni de sisteme sokan **ücretsiz kanca**. Sertifikalı kursiyerler teknik toplantı sonrası **gönüllü hakemlik** yapabiliyor → emek maliyeti sıfıra iniyor, hakemlik bir **statü ödülü** olarak kurgulanmış.

**EPNEXUS'a doğrudan çıkarım:** Bu yapı matematik odaklı olarak birebir kurulabilir ve EPNEXUS'un müfredat eşleme farklılaşması (Müfredat → Kazanımlar → Beceriler → Oyun Mekanikleri) TAZOF'un sunamadığı şeydir: TAZOF genel zekâ oyunları verir, **EPNEXUS "kazanıma bağlı matematik oyunu" verir** — okul müdürü için savunması çok daha kolay bir tekliftir.

---

### 5) Türkiye'deki Sertifika Pazarı — Fiyat Çıpaları

EPNEXUS'un sertifika fiyatını belirlemek için mevcut pazar referansları:

| Kurum | Program | Fiyat |
|---|---|---|
| **BO Enstitü** | Akıl ve Zeka Oyunları Eğitmenliği Sertifika Programı (17 ünite video, ömür boyu erişim) | **2.199 TL** (liste 2.499 TL) + dijital sertifika **750 TL** / fiziksel+dijital **999 TL**, 12 taksit ([kaynak](https://boenstitu.com/online-egitimler/akil-ve-zeka-oyunlari-egitmenligi-sertifika-programi)) |
| KTO Karatay Ü. KARSEM | Akıl ve Zeka Oyunları Eğitmen Eğitimi Sertifika Programı | Üniversite onaylı, e-Devlet sorgulanabilir |
| İstanbul Ü. SFK | Akıl ve Zeka Oyunları Eğitmen Eğitimi | Üniversite onaylı |
| Kent Ü. | Akıl ve Zeka Oyunları Eğitmeni (Uygulayıcı Belge) | Üniversite onaylı |

**Pazarın yapısı:** Ders içeriği ~2.200 TL, **sertifika belgesi ayrı ücretlendiriliyor** (750-999 TL). Yani toplam ~3.000 TL bandı. Üniversite Sürekli Eğitim Merkezi (SEM) onayı ve **e-Devlet'te sorgulanabilirlik**, Türkiye'de algılanan geçerliliğin ana belirleyicisi.

> ⚠️ **Hukuki uyarı:** Türkiye'de özel bir şirketin tek başına verdiği "sertifika" MEB nezdinde otomatik geçerli değildir. Kamuda ve Halk Eğitim'de kullanılabilirlik için ya **üniversite SEM iş birliği**, ya **MEB onaylı kurs/özel öğretim kurumu** statüsü, ya da **MYK yeterlilik** yolu gerekir. EPNEXUS bu nedenle **Sakarya Üniversitesi veya Yıldız Teknik Üniversitesi SEM ile protokol** yapmadan "MEB'de geçerli" ifadesini kullanmamalıdır. YTÜ Teknopark ve MEB YEĞİTEK/ETKİM ilişkisi bu protokolü almanın en kısa yoludur.

---

### 6) Bilim Kahramanları Derneği / FIRST LEGO League Türkiye

**Model:** Takım kaydı **ücretsiz**; takım tema seti, robot donanımı ve masa maliyetini kendisi karşılıyor. Her takım: 4-10 öğrenci (9-16 yaş) + en az 1 antrenör (18+) + isteğe bağlı 2 danışman (17+). Her kurum **maksimum 1 asil takım**, ikincisi yedek. Sezon **500 takımla sınırlı**, 81 il için kontenjan ayrılmış. ([Kayıt bilgilendirme 2025-2026](https://www.bilimkahramanlari.org/dokuman/2025/BKB_Kayit_Bilgilendirme_2025_2026.pdf))

**Buradan öğrenilecek üç taktik:**
1. **Kontenjan kıtlığı yaratmak** ("500 takım", "kurum başına 1 takım") → aciliyet + prestij.
2. **İl bazlı kontenjan** → Anadolu'da yapay talep ve bölgesel temsilci ihtiyacı yaratır.
3. **Kaydı ücretsiz yapıp donanımdan kazanmak** → giriş bariyerini sıfırlayıp gelirini materyalden almak. EPNEXUS için: **turnuva kaydı ücretsiz, oyun seti zorunlu.**

**Global FIRST fiyatları (2026-2027) karşılaştırma için ([firstinspires.org](https://www.firstinspires.org/programs/cost-and-registration)):** FLL Explore takım $150, FLL Challenge takım $285, Challenge sınıf paketi (24 öğrenci) $850, FTC $350, FRC $6.500. Türkiye'de ücretsiz tutulması, **fiyatın pazara göre yerelleştirilmesi** gerektiğinin kanıtı — EPNEXUS'un uluslararası açılımında da aynı ilke geçerli.

---

### 7) Cuemath (Hindistan) — Ödeyen Fasilitatör Modelinin Saf Hâli

**Model ([cuemath.com/teach](https://www.cuemath.com/teach/how-much-does-a-cuemath-teacher-earn/)):**
- Öğretmen **tek seferlik 9.990 Rupi kayıt ücreti** ödüyor; şirket bunu "earnest money / ciddiyet teminatı" olarak tanımlıyor ve **tüm eğitim maliyetini kendisi karşılıyor.**
- Eğitim ücretsiz ve online; metodoloji öğretiliyor ("Understand the WHY behind the WHAT").
- Gelir paylaşımı: öğrenci ücreti, materyal maliyeti düşüldükten sonra öğretmenle paylaşılıyor.
- **Öğrenciyi Cuemath buluyor:** Google/Facebook reklamları ile lead üretip, öğretim kalitesine göre öğretmene atıyor.
- **Buddy teacher** (mentor) + partner success manager desteği.
- Tipik büyüme: 1-2. ay 2-3 öğrenci → 6. ay 6-10 öğrenci. Günde 3 saat, haftada 6 gün çalışan öğretmen aylık ~45.000 Rupi'ye kadar kazanabiliyor.

**EPNEXUS için iki hayati ders:**
1. **Kayıt ücreti "ciddiyet filtresi" olarak konumlandırılmalı** — "eğitim bedeli" değil. Bu hem etik hem de dönüşüm oranı açısından daha güçlü bir çerçeve.
2. **Ağın asıl vaadi "sertifika" değil, "müşteri"dir.** Cuemath öğretmene öğrenci getirdiği için öğretmen ağda kalıyor. EPNEXUS, fasilitatörüne **okul/veli talebi yönlendirmediği sürece** ağ ilk yıldan sonra erir. Bu, raporun en önemli tek uyarısıdır.

---

### 8) Elçi (Ambassador) Programları — Nearpod, Google for Education

**Nearpod PioNear modeli ([Reach Capital analizi](https://www.reachcapital.com/resources/thought-leadership/edtech-ambassador-programs-everything-you-need-to-know/)):**
- En aktif kullanıcılar **seçilerek davet ediliyor** (başvuru değil, davet → prestij).
- Elçilere verilenler: erken özellik erişimi, ürün kararlarında söz hakkı, webinar/kaynaklarla mesleki gelişim, **yıllık küresel zirve**, konferans kaydı ve seyahat desteği, eğitim verme fırsatı.
- Sonuç: elçiler **500+ ek eğitim** düzenleyip **10.000+ yeni öğretmene** ulaştı.
- Seçim kriterleri: yoğun ürün kullanımı, **resmi davetten önce zaten savunuculuk yapıyor olmak**, güçlü iletişim/kolaylaştırıcılık, pedagoji odaklılık (özellik hayranlığı değil).
- Bir elçinin ifadesi: *"Kendime elçi diyebilmek büyük mesele haline geldi... taşınacak bir şeref nişanı."*
- **Uyarı:** "Gerçek zaman, kaynak ve özen ayırmıyorsanız" öğretmenler samimiyetsizliği fark eder ve program geri teper.

**Google Certified Trainer ([edu.google.com](https://edu.google.com/for-educators/certification-programs/professional-expertise/certified-trainer/)):**
- 7 adım: Trainer Course (~8 saat) → Trainer Skills Assessment (~1 saat) → Educator Level 1 (2-3 saat) → Level 2 (~3 saat) → **2-3 dakikalık tanıtım videosu** → verdiği 3-5 eğitimin listesi → başvuru.
- Ücretler: **Level 1 $10, Level 2 $25, Trainer Assessment $15** — yani toplam $50.
- **Yenileme zorunluluğu:** Yılda en az **10 eğitim oturumunu Activity App üzerinden raporlamak**, yıllık ürün güncelleme sınavını geçmek, Level 1-2'yi 3 yılda bir yenilemek.
- Ayrıcalık: özel Trainer Google Group + **küresel EDU dizininde listelenme**.
- Başvurular aylık değerlendiriliyor, karar 4-6 haftada.

**En kopyalanabilir mekanizma — "aktiflik zorunluluğu":** Google'ın sertifikası ücretsize yakın ama **her yıl 10 eğitim vermek zorundasınız.** Bu, ağın ölü üye taşımasını engelliyor ve sertifikayı pasif bir kâğıt olmaktan çıkarıp **sürekli faaliyet motoruna** dönüştürüyor. EPNEXUS'un unvan yenileme koşulu tam bu olmalı.

---

## A.3 Sekiz Girişimden Çıkan 7 Evrensel Desen

1. **Ağ, üründen önce gelir.** Sertifika bir gelir kalemi değil, **dağıtım altyapısıdır.** (Cuemath, TAZOF)
2. **Takvim satar, ürün satmaz.** Turnuva/lig/sezon, okulun bütçe kararını tetikleyen şeydir. (Math Pentathlon, FLL)
3. **Kademe = tekrar eden gelir.** Tek kademeli sertifika bir kez satılır; 3 kademeli sertifika 3 kez satılır ve elçi üretir. (TAZOF, Google)
4. **Giriş bariyeri sıfır, gelir ikinci adımda.** Ücretsiz kayıt / ücretsiz PD / $5 PDF ile huniyi doldur, materyal ve programdan kazan. (FLL TR, Math for Love)
5. **Fasilitatörün asıl beklentisi gelirdir, rozet değil.** Ağın ona müşteri/kurs hakkı/gelir payı getirmesi şart. (Cuemath, TAZOF-Halk Eğitim)
6. **Aktiflik zorunluluğu ağı diri tutar.** Yenileme koşulu olmayan sertifika 12 ayda ölür. (Google)
7. **Kıtlık ve seçilmişlik prestij üretir.** Kontenjan, davetle giriş, "şeref nişanı" dili. (FLL TR, Nearpod)

**Akademik dayanak:** Matematik öğretiminde eğitsel oyunların akademik başarıya etkisi üzerine yapılan meta-analiz (Mert & Koparan, 2024, *Karaelmas Eğitim Bilimleri Dergisi*, 12(1), 45-60), taranan 87 çalışmadan ölçütleri karşılayan **32 çalışma** üzerinden **0,544 etki büyüklüğü** (Thalheimer & Cook sınıflamasına göre orta düzey) bulmuş ve huni grafiği/Orwin analizinde anlamlı yayın yanlılığı saptamamıştır. Bu, EPNEXUS'un fasilitatör eğitiminde ve okul sunumlarında kullanabileceği **birinci elden ulusal akademik kanıttır.**

---

# BÖLÜM B — EPNEXUS FASİLİTATÖR AĞI KURULUŞ MODELİ

## B.0 Tasarım İlkeleri

Ağ tasarlanırken dört ilkeye bağlı kalınmalı:

1. **Fasilitatör bir müşteri değil, bir kanaldır.** Ondan alınan ücret ağın gelirinin küçük kısmı olmalı; asıl gelir onun açtığı okuldur. Bu bakış açısı yanlış kurulursa ağ bir "sertifika satıcısı"na dönüşür ve itibar kaybedilir.
2. **Her kademe somut bir ekonomik hak açmalı.** Unvan tek başına satılamaz; unvan bir **yetki** olmalı (atölye açma, materyal indirimi, turnuva düzenleme, gelir payı).
3. **Meşruiyet kurumdan ödünç alınır.** Üniversite SEM + MEB YEĞİTEK/ETKİM + YTÜ Teknopark üçlüsü, EPNEXUS'un tek başına üretemeyeceği güveni ilk günden sağlar.
4. **Ağ diri tutulmazsa erir.** Yenileme koşulu, sezon takvimi ve sürekli talep akışı olmadan 12. ayda ağ kâğıt üzerinde kalır.

---

## B.1 Kademe Mimarisi

```
 KADEME 3 — EPNEXUS MASTER FASİLİTATÖRÜ (Eğitmen Eğitmeni)
    ↑ Davetle · 20-30 kişi · Kademe 1 eğitimi verir · Eğitim gelirinden %40 pay
 KADEME 2 — KIDEMLİ FASİLİTATÖR
    ↑ Kademe 1 + 10 uygulama + 1 turnuva · Atölye/kurs açma hakkı · 500'lü fiyat kademesi
 KADEME 1 — SERTİFİKALI EPNEXUS OYUN FASİLİTATÖRÜ
    ↑ Eğitim + sınav + 3 uygulama raporu · Okulda uygulama hakkı · %15 indirim
 KADEME 0 — EPNEXUS KAŞİFİ (ücretsiz)
    ↑ Web sitesine üyelik · Ücretsiz kaynak + topluluk + puan sistemi
```

### Kademe 0 — Kâşif (ücretsiz, sınırsız)
**Amaç:** Huninin ağzı. Hedef 12 ayda **5.000 kayıtlı kullanıcı.**
**Aldıkları:** Ücretsiz print-and-play mini oyun (1 adet), kazanım eşleme tablosu örneği, topluluk forumu, web sitesinde puan biriktirme, aylık ücretsiz webinar.
**Verdikleri:** E-posta, branş, şehir, okul bilgisi → **EPNEXUS'un en değerli varlığı olan öğretmen veri tabanı.**

### Kademe 1 — Sertifikalı EPNEXUS Oyun Fasilitatörü
**Kim:** Sınıf/matematik öğretmenleri, okul öncesi öğretmenleri, zekâ oyunları eğitmenleri, eğitim fakültesi son sınıf öğrencileri, özel ders veren öğretmenler.
**Eğitim içeriği (toplam ~24 saat: 16 saat online + 8 saat canlı/yüz yüze):**

| Modül | Süre | İçerik |
|---|---|---|
| M1 | 3 sa | Matematikte oyun temelli öğrenmenin kuramsal temeli + ulusal/uluslararası literatür (Mert & Koparan 2024 meta-analizi dahil) |
| M2 | 4 sa | **EPNEXUS Müfredat Çerçevesi**: Müfredat → Kazanım → Beceri → Mekanik zinciri (EPNEXUS'un tescilli farklılaşması) |
| M3 | 6 sa | 4 kutulu oyunun (Hazineleri Topla, Salur Kazanım Maceraları, Afrodisias, Harmonia) uygulamalı öğretimi |
| M4 | 3 sa | Sınıf yönetimi: 30 kişilik sınıfta oyun kurgusu, farklılaştırma, kaynaştırma |
| M5 | 3 sa | **Oyunla ölçme-değerlendirme:** oyun verisinden kazanım analizi, veli/idare raporlaması |
| M6 | 3 sa | Turnuva/etkinlik organizasyonu ve hakemlik |
| M7 | 2 sa | Fasilitatörün ticari tarafı: okula sunum, veli atölyesi, fiyatlandırma, etik kurallar |

**Sertifika koşulu:** Online sınav (min. %70) + **3 adet uygulama raporu** (platforma video/foto + kazanım eşlemesi + öğrenci geri bildirimi ile yüklenir).
**Geçerlilik:** 2 yıl. Yenileme koşulu: **yılda en az 6 uygulama raporu** veya 2 atölye (Google modeli).

### Kademe 2 — Kıdemli Fasilitatör
**Ön koşul:** Kademe 1 + en az 10 onaylı uygulama + 1 turnuva/etkinlik katılımı + Kademe 2 eğitimi (16 saat).
**Açılan haklar:**
- Kendi adına **EPNEXUS onaylı atölye/kurs açma** (Halk Eğitim, kırtasiye, oyun evi, özel ders)
- Materyalde **500'lü fiyat kademesi** (min. 5 adet)
- **İl/ilçe turnuvası düzenleme yetkisi** → katılım ücretlerinden pay
- EPNEXUS'a gelen veli/okul taleplerinde **bölge önceliği** (Cuemath mantığı)

### Kademe 3 — Master Fasilitatör (Eğitmen Eğitmeni)
**Seçim:** Başvuru ile değil, **davetle** (Nearpod modeli). İlk yıl 20-30 kişi.
**Yükümlülük:** Yılda en az 4 Kademe 1 eğitimi vermek, 1 bölge etkinliği yürütmek.
**Ayrıcalık:**
- Verdiği Kademe 1 eğitimlerinin gelirinden **%40 pay**
- Yıllık **EPNEXUS Fasilitatör Zirvesi**nde konuşmacılık, ulaşım/konaklama karşılanır
- Yeni oyun geliştirme sürecinde **beta test ve ürün kurulu üyeliği**
- Web sitesinde ve basılı materyalde isim/fotoğrafla yer alma
- Uluslararası başvurularda (Erasmus, COST, DIDAC) **proje ortağı** olarak listelenme

---

## B.2 Gelir Modeli ve Fiyat Listesi (Öneri)

> Rakamlar Türkiye pazarındaki mevcut çıpalar (BO Enstitü 2.199 TL + 750 TL sertifika; üniversite SEM programları) ve EPNEXUS'un farklılaşma primi dikkate alınarak önerilmiştir. **Yayına almadan önce mevcut dinamik fiyatlandırma tablonuzla (Google Sheets) karşılaştırılmalıdır.**

### Gelir Kalemi 1 — Sertifikasyon

| Ürün | Fiyat (TL) | Not |
|---|---|---|
| Kademe 0 üyelik | **0** | Huni |
| Kademe 1 — Online | **3.900** | 24 saat + sınav + dijital sertifika |
| Kademe 1 — Hibrit (yüz yüze atölyeli) | **5.400** | Şehir bazlı, min. 15 kişi |
| Kademe 1 — Kurum içi (okula gidilen) | **48.000** / 20 kişiye kadar | Okul öder, öğretmen ödemez |
| Kademe 1 — Öğrenci/yeni mezun indirimi | **2.600** (%33) | Huni genişletme |
| Kademe 2 | **6.500** | 16 saat + değerlendirme |
| Kademe 3 | Davetle, ücretsiz | Yükümlülük karşılığı |
| Basılı sertifika + kimlik kartı | **450** | Opsiyonel, yüksek marj |
| 2 yıllık yenileme | **1.200** | Tekrar eden gelir |

### Gelir Kalemi 2 — Materyal (fasilitatör üzerinden)

> ⚠️ **Düzeltme (Ürün Kataloğu, Ağustos 2026 ile güncellendi).** Bu raporun ilk sürümündeki materyal fiyatları tahminiydi. Gerçek liste fiyatları aşağıdadır ve tüm hesaplamalar bunlara göre kurulmalıdır.

**Liste fiyatları (adet kademesine göre)**

| Oyun | Sınıf | Kazanım | 100'lü | 500'lü | 1000'li |
|---|---|---|---|---|---|
| Hazineleri Topla | 5 | MAT.5.2.1 | 1.400 TL | 900 TL | 800 TL |
| Harmonia | 6 | MAT.5.2.3 – MAT.6.2.2 | 1.500 TL | 800 TL | 600 TL |
| Salur Kazan'ın Maceraları | 7 | MAT.7.2.4 | 1.500 TL | 850 TL | 650 TL |
| Afrodisias | 8 | MAT.7.1.5 – 7.1.6 – 7.1.7 | 1.800 TL | 950 TL | 750 TL |

**Alıcıya göre uygulanan kademe**

| Alıcı | Uygulanan fiyat | Minimum sipariş | Örnek: Afrodisias |
|---|---|---|---|
| Veli / bireysel | Liste (perakende) | — | 1.800 TL |
| Kademe 1 fasilitatör | Liste − %15 | — | 1.530 TL |
| Kademe 2/3 fasilitatör | 500'lü kademe | 5 adet | 950 TL |
| Okul / kurum | 500'lü kademe | 20 adet (karma) | 950 TL |
| Bayi / kitabevi | 1000'li kademe | 100 adet | 750 TL |

**Ek ürünler:** Print-and-play PDF (tek oyun) 150 TL · Ölçme-değerlendirme kiti 900 TL

> **Paketleme uyarısı.** Math Pentathlon'un ABD'deki "24 öğrenciye 6 set" sınıf paketi Türkiye'ye birebir taşınamaz: gerçek fiyatlarla bu paket ~37.000 TL eder. Doğru kurgu, sınıf başına **4-6 kopya tek oyun** ve **gözlemci-oyuncu** rotasyonudur (Kademe 1 müfredatı, M4). Öğrenci başı maliyet iletişimi ise aynen korunur: *"Sınıfa 6 Afrodisias = 5.700 TL, 24 öğrenci için öğrenci başına 238 TL; 3 yıl kullanımda yılda 79 TL."*

### Gelir Kalemi 3 — Program / Lisans (B2B)

| Ürün | Fiyat (TL/yıl) | Kapsam |
|---|---|---|
| Okul Lisansı — Temel | **35.000** | 1 kademe, 2 öğretmen sertifikası, dijital kaynak erişimi |
| Okul Lisansı — Tam | **95.000** | Tüm kademeler, 5 öğretmen sertifikası, yıllık 2 veli atölyesi, turnuva kontenjanı, ölçme raporları |
| Zincir/kolej grubu | Görüşmeye bağlı | Pentalitha'nın fiyat yayımlamama stratejisi |

### Gelir Kalemi 4 — Turnuva / Lig ("EPNEXUS Matematik Oyunları Ligi")

| Kalem | Fiyat |
|---|---|
| Takım kaydı | **Ücretsiz** (FLL TR modeli) — ama oyun seti zorunlu |
| Bireysel katılım | 350 TL |
| Okul ev sahipliği paketi | 12.000 TL (madalya, sertifika, hakem, görsel kit) |
| Sponsorluk (yerel işletme/banka/kırtasiye) | 25.000 – 150.000 TL |

---

## B.3 12 Aylık Finansal Projeksiyon (3 Senaryo)

| | Kötümser | **Gerçekçi** | İyimser |
|---|---|---|---|
| Kademe 0 üye | 1.500 | **5.000** | 12.000 |
| Kademe 1 sertifika | 90 | **250** | 600 |
| Kademe 2 | 8 | **30** | 80 |
| Sertifikasyon geliri | 380.000 TL | **1.180.000 TL** | 2.900.000 TL |
| Materyal geliri (ağ üzerinden) | 420.000 TL | **1.450.000 TL** | 3.800.000 TL |
| Okul lisansı | 2 okul / 70.000 TL | **8 okul / 380.000 TL** | 22 okul / 1.100.000 TL |
| Turnuva/sponsorluk | 0 | **150.000 TL** | 550.000 TL |
| **TOPLAM CİRO** | **~870.000 TL** | **~3.160.000 TL** | **~8.350.000 TL** |

**Dönüşüm varsayımları (gerçekçi senaryo):** Kademe 0 → Kademe 1 dönüşümü %5 (edtech topluluk hunilerinde tipik %3-8 bandı). Her Kademe 1 fasilitatörünün ilk yıl ortalama **4 kutu** (≈5.800 TL ciro) satmasına aracılık etmesi — gerçek liste fiyatlarıyla hesaplanmıştır. Kademe 1 → Kademe 2 geçişi %12.

**Nakit akışı avantajı:** Sertifikasyon geliri **peşin tahsil edilir ve üretim maliyeti yoktur** — EPNEXUS'un "şirketleşmeden acil nakit akışı" ihtiyacına en uygun kalem budur. Kutulu oyun ise önce üretim maliyeti gerektirir.

---

## B.4 İlk 100 Fasilitatöre Nasıl Ulaşılır — Mevcut Varlıkların Aktivasyonu

EPNEXUS sıfırdan başlamıyor. Elde hazır beş kanal var:

| # | Kanal | Mevcut durum | Aksiyon | Hedef |
|---|---|---|---|---|
| 1 | **Sakarya saha ağı** | 30+ devlet okulu, 15+ kolej, 3.000+ kullanıcı | Uygulamaya katılan öğretmenlere **kurucu üye daveti** — ilk 50 kişiye %50 indirim + "Kurucu Fasilitatör" rozeti (kalıcı, bir daha verilmez) | 40-60 |
| 2 | **TAZOF** | Hasan Gök + Zekai Kalafat bağlantısı | **Karşılıklı tanıma protokolü**: TAZOF 1. derece sahipleri EPNEXUS Kademe 1'e indirimli geçiş; EPNEXUS matematik modülü TAZOF akademisine eklenir | 30-50 |
| 3 | **ETKİM Yıldızları / MEB YEĞİTEK** | Programda 15 girişimden biri, Demo Day var | MEB pilotlama kapsamında **il MEM iş birliğiyle ücretsiz tanıtım semineri** (2-3 il) | 20-40 |
| 4 | **Üniversite SEM protokolü** | Sakarya Ü. (Kübra ve Güneş orada), YTÜ | SEM ile ortak program → **e-Devlet'te sorgulanabilir sertifika** + üniversitenin öğretmen listesine erişim | Meşruiyet + 30 |
| 5 | **Satış gönüllüleri + kitabevi** | Dahi Kitabevi (Mesut Hoca), İlkay, Ülkü, Esra Şakar | Kitabevini **fiziksel kayıt noktası** yap: oyun seti alan öğretmene Kademe 0 üyelik kartı | 15-25 |

**Ek dijital kanal:** Kübra'nın akademik profili üzerinden **içerik otoritesi** (Math for Love modeli) — haftada 1 LinkedIn/Instagram yazısı: "Bu haftanın kazanımı ve oyunu". TÜRKBİLMAT bildirisi ve saha verisinin makaleye dönüşümü, ağın bilimsel meşruiyetini kurar.

**Sıralama önemli:** Önce (1) + (4) → meşruiyet ve çekirdek. Sonra (2) + (3) → hacim. En son (5) → ticarileşme.

---

## B.5 Kalite Kontrol ve Marka Koruması

Fasilitatör ağının en büyük riski, **kötü bir fasilitatörün markayı yakmasıdır.**

| Mekanizma | Uygulama |
|---|---|
| **Uygulama raporu zorunluluğu** | Her sertifika için 3, her yenileme için 6 onaylı rapor (platformdan yüklenir, Master Fasilitatör onaylar) |
| **Gizli gözlem** | Yılda rastgele %5 fasilitatörün atölyesine katılım/video incelemesi |
| **Öğrenci/veli geri bildirimi** | Her uygulama sonrası QR ile anonim 5 soruluk anket; ortalama 3,5/5 altına düşen fasilitatör uyarı → askı |
| **Marka kullanım sözleşmesi** | "EPNEXUS Onaylı Fasilitatör" ibaresinin kullanım kuralları, logo kiti, yasaklar (EPNEXUS adına sözleşme yapamaz, fiyat belirleyemez, kopya materyal üretemez) |
| **Materyal kilidi** | Onaylı materyal yalnızca EPNEXUS'tan alınır; sahte/kopya kullanımı sertifika iptali sebebi |
| **Etik kurallar** | Çocuk güvenliği, veri koruma (KVKK), reklam dili sınırları |

---

## B.6 Uluslararası Katman

EPNEXUS'un uluslararası hedefi (YTÜ yurt dışı ofisleri: Dubai, Hollanda, Kuzey Makedonya, Londra, Özbekistan) fasilitatör ağıyla **çok daha ucuza** gerçekleşir — çünkü kutu göndermek yerine **sertifika ve PDF gönderilir.**

**Faz 1 (Ay 6-12):** Hamza Soyer (IB/Hollanda/Portekiz/Almanya) ve Cennet Ebru Candan (Cambridge) üzerinden **İngilizce Kademe 1 pilotu**. Hedef: 20 uluslararası fasilitatör. Ürün: **print-and-play PDF + online sertifika** (fiziksel lojistik yok).

**Faz 2 (Ay 12-24):** Ülke bazlı **"Country Lead"** modeli (TAZOF'un il temsilciliği mantığının uluslararası hâli). Country Lead o ülkede Kademe 1 eğitimi verir, gelirden %40-50 pay alır, EPNEXUS müfredat eşlemesini sağlar.

**Fiyatlandırma uyarısı:** FIRST'ün ABD'de $285 olan kaydı Türkiye'de ücretsizdir. Aynı şekilde EPNEXUS'un TL fiyatları doğrudan dövize çevrilmemeli; **satın alma gücüne göre bölgesel fiyatlandırma** (Türkiye / Orta Asya-Balkanlar / Körfez-Batı Avrupa üç bandı) kurulmalıdır.

---

## B.7 Riskler ve Karşı Önlemler

| Risk | Olasılık | Etki | Önlem |
|---|---|---|---|
| **Sertifikanın MEB'de geçersiz olması** | Yüksek | Kritik | Üniversite SEM protokolü şart; "MEB'de geçerli" ifadesi protokolsüz kullanılmamalı |
| **Fasilitatör ilk yıldan sonra pasifleşir** | Çok yüksek | Kritik | Talep yönlendirme (Cuemath) + yenileme koşulu (Google) + sezon takvimi (FLL) |
| **"Sertifika satıcısı" algısı** | Orta | Yüksek | Kademe 0'ın gerçekten değerli olması; ücreti "ciddiyet teminatı" olarak konumlandırma; kazancın materyal ve programdan gelmesi |
| **TAZOF ile rekabet algısı** | Orta | Orta | Rekabet değil **tamamlayıcılık**: TAZOF genel zekâ oyunları, EPNEXUS kazanım bazlı matematik. Protokol yapılmalı |
| **Çekirdek ekibin kapasitesi (4 kişi)** | Yüksek | Yüksek | Kademe 3 Master ağı ilk 6 ayda kurulmalı; eğitim yükü devredilmeli. Ayrıca eğitimin %65'i asenkron video olmalı |
| **Pentalitha'nın orta segmente inmesi** | Düşük-Orta | Orta | Hız avantajı; Anadolu ve devlet okulu tarafında önce konumlanma |
| **Şirketin henüz kurulmamış olması** | — | Kritik | **Sertifika ücreti tahsil etmeden önce tüzel kişilik zorunlu** (fatura, sözleşme, KVKK VERBİS) |

---

## B.8 90 Günlük Uygulama Yol Haritası

**Ay 1 — Temel**
- [ ] Tüzel kişilik kurulumu (ön koşul) + marka tescili ("EPNEXUS Onaylı Fasilitatör")
- [ ] Sakarya Ü. / YTÜ SEM protokol görüşmesi
- [ ] TAZOF toplantısının gerçekleştirilmesi (karşılıklı tanıma teklifiyle)
- [ ] Kademe 1 müfredatının (7 modül) yazılması — Güneş + Kübra
- [ ] Fiyat listesinin mevcut dinamik tabloyla mutabakatı

**Ay 2 — İnşa**
- [ ] 24 saatlik eğitim içeriğinin çekimi (16 sa asenkron video)
- [ ] Sınav bankası (120 soru) + uygulama raporu şablonu
- [ ] Web platformu MVP (bkz. Bölüm C, Faz 1)
- [ ] Sakarya saha ağındaki öğretmenlere "Kurucu Fasilitatör" daveti (hedef 50)
- [ ] Marka kullanım sözleşmesi + etik kurallar metni (hukuki destek)

**Ay 3 — Lansman**
- [ ] **Kurucu Kohort** eğitimi (30-50 kişi, %50 indirim) — canlı, geri bildirimle iyileştirme
- [ ] İlk 10 Master Fasilitatör adayının belirlenmesi
- [ ] "EPNEXUS Matematik Oyunları Ligi" 2027 sezon takviminin ilanı
- [ ] Sonuç ölçümü: dönüşüm oranı, memnuniyet, ilk materyal siparişleri

---

# BÖLÜM C — OYUNLAŞTIRILMIŞ WEB PLATFORMU PLANI

## C.0 Önce Doğru Soru: Puan Neyi Optimize Etmeli?

En sık yapılan hata, "puan verelim, insanlar sitede daha çok kalsın" demektir. **Sitede geçirilen süre bir başarı ölçütü değildir.** Akademik literatür bu konuda net:

> DeWitt, Alias ve Al Amri'nin (2026, *Frontiers in Education*) öğretmen mesleki gelişiminde oyunlaştırma üzerine sistematik derlemesi, 27 çalışmayı incelemiş; **puan sistemleri çalışmaların %88,9'unda**, rozet ve seviyeler **%48,1'inde**, liderlik tabloları **%40,7'sinde** kullanılmıştır. Tüm çalışmalar olumlu motivasyon etkisi bildirmiştir (Chan & Lo, 2022: Kahoot ile %87 etkililik; Liu vd., 2023: 5 üzerinden 4,0+ memnuniyet, **geri bildirimin kritik değişken olduğu** b=0,874, p<0,001). Ancak yazarlar üç ciddi uyarı yapmaktadır: **(1) yayın yanlılığı olasılığı yüksek, (2) çalışmaların çoğu öz bildirime dayalı, (3) uzun vadeli etkiyi ölçen boylamsal çalışma yok.** Ayrıca örneklem Avrupa'da yoğunlaşmıştır (%74,1'i Avrupa, %51,9'u İspanya).

**Bundan çıkan tasarım kuralı:** Puan sistemi **davranışı değil sonucu** ödüllendirmeli ve **geri bildirim döngüsüyle** birleşmelidir. "Doküman tıklaması" puan vermek kolaydır ama boştur; **"uygulama raporu yükledin ve Master onayladı"** puanı gerçek değer üretir.

### EPNEXUS için puanın optimize etmesi gereken 5 davranış

1. Eğitim modülünü **tamamlamak** (izlemek değil — modül sonu sorusunu geçmek)
2. Sınıfta **oyunu uygulayıp rapor yüklemek** ← en yüksek puan
3. Toplulukta **başka bir fasilitatöre yardım etmek** (soru cevaplamak, kaynak paylaşmak)
4. **Etkinlik/turnuva düzenlemek veya katılmak**
5. **Yeni fasilitatör getirmek** (referans)

---

## C.1 Oyunlaştırma Ekonomisi Tasarımı

### Puan (NX — "Nexus Puanı") Tablosu

| Eylem | NX | Sınır |
|---|---|---|
| Profil tamamlama | 50 | Tek sefer |
| Ücretsiz kaynak indirme | 5 | Günde 3 |
| Eğitim modülü tamamlama (sınav geçme) | 100 | Modül başına |
| Webinar canlı katılım | 75 | Etkinlik başına |
| **Uygulama raporu yükleme (onaylı)** | **300** | Sınırsız |
| Uygulama raporuna Master geri bildirimi alma | +50 | — |
| Forumda soru cevaplama (çözüm işaretlendi) | 40 | — |
| Kendi oyun varyantını paylaşma (onaylı) | 250 | — |
| Turnuva hakemliği | 400 | — |
| Turnuvaya takım getirme | 500 | — |
| Yeni fasilitatör referansı (sertifika aldıysa) | 600 | — |
| **Seri (streak)** — ardışık haftalık aktiflik | 25 × hafta | Maks. 8 hafta |

### Kademe (Rütbe) Sistemi — Trailhead mantığı

| Rütbe | NX eşiği | Somut hak |
|---|---|---|
| 🔍 Kâşif | 0 | Ücretsiz kaynaklar |
| 🎲 Oyuncu | 500 | Ek PDF kütüphanesi, Kademe 1'de **%10 indirim** |
| 🧭 Rehber | 2.000 | Aylık kapalı webinar, materyalde **ek %5 indirim** |
| ⭐ Usta | 6.000 | **Turnuva kontenjanı önceliği**, yeni oyun beta erişimi |
| 👑 Efsane | 15.000 | **Master Fasilitatör daveti değerlendirmesi**, zirvede konuşmacılık |

> **Kritik tasarım kararı:** Rütbe sadece görsel bir rozet değil, **satın alma gücü** taşımalı. Salesforce Trailhead'in başarısı tam olarak buradan gelir: puan kariyer ve iş fırsatına dönüşür. EPNEXUS'ta NX → indirim, kontenjan ve davet hakkına dönüşmelidir.

### Rozetler (koleksiyon katmanı)

- **Oyun rozetleri:** Hazineleri Topla Ustası, Afrodisias Ustası, Harmonia Ustası, Salur Ustası (her biri: o oyunla 5 onaylı uygulama)
- **Kazanım rozetleri:** Örüntüler, Tam Sayılar, Kesirler, Geometri... (müfredat alanı bazlı)
- **Müfredat rozetleri:** MEB/Maarif, IB, Cambridge, Singapur (ilgili modül + uygulama)
- **Nadir rozetler (kıtlık):** "Kurucu Fasilitatör" (ilk 50 kişi, bir daha verilmez), "İlk Turnuva" (2027 sezonu), "Sınır Ötesi" (yurt dışı uygulama)

### Lig ve Liderlik Tablosu — dikkatli kullanım

Liderlik tablosu literatürde etkili görünse de (%40,7 kullanım) **mutlak sıralama demotive edicidir** — 400. sıradaki öğretmen vazgeçer. Çözüm:

- **Mutlak değil, lig bazlı:** 30 kişilik ligler, her ay ilk 5 yükselir, son 5 düşer (Duolingo modeli)
- **İl bazlı tablo:** "Sakarya'da 3. sıradasın" → yerel rekabet, ulaşılabilir hedef
- **Okul bazlı takım tablosu:** bireysel değil kurumsal rekabet → okul müdürünü de sisteme sokar

### Ekonomik döngü — NX'in harcanabilir olması

Sadece biriken puan zamanla anlamsızlaşır. **Harcanabilir NX** eklenmeli:

| Harcama | NX |
|---|---|
| Materyal siparişinde 500 TL indirim | 3.000 NX |
| Turnuva ev sahipliği başvuru önceliği | 5.000 NX |
| Kademe 2 eğitiminde %20 indirim | 8.000 NX |
| Zirve katılım kontenjanı | 12.000 NX |

---

## C.2 Site Haritası ve Ekranlar

```
ANASAYFA (kamuya açık)
├── Neden EPNEXUS? (müfredat→kazanım→mekanik zinciri anlatımı)
├── Oyunlar (4 kutu + 2 dijital, her biri kazanım eşlemesiyle)
├── Fasilitatör Ol ★ (dönüşüm sayfası — kademeler, fiyat, takvim, SSS)
├── Fasilitatör Bul (harita: il/ilçe bazlı dizin — Google EDU Directory modeli)
├── Lig & Turnuvalar (sezon takvimi, sonuçlar, kayıt)
├── Mağaza (Shopier entegrasyonu — kutu, PDF, setler)
└── Araştırma & Kaynaklar (akademik yayınlar, saha verisi, ücretsiz kaynaklar)

PANEL (giriş sonrası)
├── 🏠 Kontrol Paneli — NX, rütbe ilerleme çubuğu, seri, sıradaki görev, lig durumu
├── 🎓 Akademi — modüller, video, sınavlar, sertifika ilerlemesi
├── 📚 Kaynak Kütüphanesi — kademeye göre kilitli/açık dokümanlar, indirme = NX
├── 📝 Uygulamalarım — rapor yükleme formu, Master geri bildirimi, onay durumu ★
├── 🏅 Rozetlerim & Sertifikalarım — doğrulanabilir QR'lı dijital sertifika
├── 👥 Topluluk — forum, soru-cevap, oyun varyantı paylaşımı
├── 🏆 Lig — kişisel/il/okul tabloları
├── 🛒 Fasilitatör Mağazası — kademeye göre otomatik indirimli fiyat
├── 📅 Etkinlikler — webinar, atölye, turnuva takvimi ve kayıt
└── ⚙️ Profil — kamuya açık fasilitatör kartı (dizinde görünen)

YÖNETİM PANELİ (EPNEXUS ekibi)
├── Rapor onay kuyruğu (Master'lara dağıtılmış)
├── Fasilitatör CRM (kademe, aktiflik, satış, bölge)
├── Talep yönlendirme (gelen okul/veli talebi → bölgedeki fasilitatöre atama) ★
├── Sertifika üretimi ve doğrulama
└── Analitik (huni, dönüşüm, aktiflik, NRR)
```

★ işaretli üç ekran platformun **kalbidir** — bunlar olmadan platform bir blogdan ibarettir.

---

## C.3 Veri Modeli (özet)

```
User ──< Enrollment >── Course ──< Module ──< Quiz
 │
 ├──< Application (uygulama raporu: okul, sınıf, oyun, kazanım, foto/video,
 │                 öğrenci sayısı, anket sonucu, onay durumu, onaylayan)
 ├──< PointTransaction (eylem, NX, tarih, referans) → bakiye + toplam
 ├──< BadgeAward
 ├──< Certification (kademe, veriliş, geçerlilik bitişi, doğrulama kodu)
 ├──< Order (materyal — kademe indirimi otomatik)
 ├──< Lead (kendisine yönlendirilen okul/veli talebi) ★
 └──< EventRegistration

School ──< Application  (okul bazlı etki raporu üretir — satış argümanı!)
Region ──< Facilitator  (il/ilçe dizini + talep yönlendirme)
```

**Gizli hazine:** `Application` tablosu birikince EPNEXUS'un elinde **"X okulda, Y öğrenciyle, Z kazanımda, memnuniyet W"** diye ölçülmüş bir etki veri tabanı olur. Bu; TÜBİTAK BiGG dosyası, akademik makaleler, Erasmus/COST başvuruları, USC Rossier başvurusu ve okul satış sunumları için **aynı anda kullanılabilecek tek bir kanıt havuzudur.** Web sitesinin ürün dışı en büyük stratejik getirisi budur.

---

## C.4 Teknoloji Seçenekleri

| Seçenek | Yapı | Süre | Tahmini maliyet | Uygunluk |
|---|---|---|---|---|
| **A. Hızlı MVP** | WordPress + LearnDash + GamiPress + WooCommerce + BuddyBoss | 4-6 hafta | 60.000 – 120.000 TL (+ yıllık ~25.000 TL lisans) | **Faz 1 için önerilen.** Hazır oyunlaştırma eklentileri, Türkçe destek, düşük risk |
| **B. Yarı-özel** | Next.js + Supabase (auth/DB) + Stripe/iyzico + özel oyunlaştırma motoru | 10-14 hafta | 250.000 – 450.000 TL | Faz 2. Tam kontrol, dijital oyunlarla entegrasyon |
| **C. Tam özel** | Next.js + NestJS + PostgreSQL + Redis + mobil app | 5-7 ay | 800.000 TL+ | Faz 3 / yatırım sonrası |
| D. Moodle | Moodle + Level Up XP + Open Badges | 6-8 hafta | 50.000 – 90.000 TL | Akademik görünüm güçlü, ticari/topluluk tarafı zayıf |

**Öneri: A → B geçişli strateji.** MVP'yi 6 haftada WordPress ile çıkarıp **Kurucu Kohort'u gerçek kullanıcıyla test etmek**, 400.000 TL'lik özel geliştirmeye körlemesine girmekten çok daha güvenlidir. Mücahit Tiryaki'nin (bilgisayar mühendisi, oyun geliştirme deneyimli) teknik gözetimi bu geçişte kritik.

**Standartlar:**
- **Open Badges 3.0** uyumlu rozet/sertifika → uluslararası tanınırlık, LinkedIn'e eklenebilir (fasilitatör için ciddi motivasyon)
- Sertifikada **QR doğrulama** → sahteciliğe karşı + her QR taraması siteye trafik
- **KVKK/VERBİS** kaydı, açık rıza metinleri; uygulama raporlarında **öğrenci yüzü görünmeyecek** şekilde foto politikası (mevcut anonim veri yaklaşımınızla tutarlı)
- Çok dilli altyapı (TR/EN, sonradan AR/RU/MK) — i18n baştan kurulmalı

---

## C.5 Geliştirme Fazları

**Faz 1 — MVP (6 hafta)** — Kurucu Kohort lansmanına yetişmeli
Üyelik + Akademi (modül/video/sınav) + NX puan + rütbe + rozet + uygulama raporu yükleme ve onayı + dijital sertifika (QR) + Shopier bağlantılı mağaza + basit forum.

**Faz 2 — Ağ (3 ay)**
Fasilitatör dizini (harita) + **talep yönlendirme sistemi** + lig/liderlik tabloları + etkinlik/turnuva modülü + kademeye göre otomatik indirimli mağaza + okul paneli.

**Faz 3 — Ölçek (6 ay)**
Çok dilli sürüm + Country Lead paneli + dijital oyunların (Hazineleri Topla, Kartland) platformla veri entegrasyonu + **yapay zekâ destekli oyun önerisi** (öğrencinin hata desenine göre sonraki oyunu öneren sistem — ürün yol haritanızdaki modül) + ölçme-değerlendirme araçları + mobil uygulama.

---

## C.6 Ölçülecek Metrikler

| Metrik | Hedef (12. ay) |
|---|---|
| Kademe 0 → Kademe 1 dönüşümü | %5 |
| Sertifika tamamlama oranı (başlayan → bitiren) | %70 |
| **90 gün sonra hâlâ aktif fasilitatör oranı** | **%55** ← en kritik metrik |
| Fasilitatör başına ortalama uygulama raporu / yıl | 6 |
| Fasilitatör başına ortalama materyal cirosu / yıl | 5.800 TL |
| Kademe 1 → Kademe 2 geçişi | %12 |
| Aylık aktif kullanıcı / toplam üye | %35 |

---

# SONUÇ VE ÖNCELİK SIRASI

**Yapılması gereken ilk üç iş, sırasıyla:**

1. **Tüzel kişilik + üniversite SEM protokolü.** Bu ikisi olmadan sertifika satışı hem hukuken hem itibaren risklidir. (Ay 1)
2. **Sakarya'daki 3.000 kişilik saha ağından "Kurucu Fasilitatör" kohortunu çıkarmak.** Elinizde Türkiye'deki çoğu edtech girişiminin sahip olmadığı bir şey var: **oyunlarınızı gerçekten kullanmış öğretmenler.** Bu, ağın çekirdeğidir ve reklamla satın alınamaz. (Ay 1-3)
3. **6 haftalık MVP ile platformu açmak** — mükemmel değil, çalışan. Kurucu Kohort'un geri bildirimiyle şekillendirmek. (Ay 2-3)

**Ve unutulmaması gereken tek cümle:** Fasilitatör ağı sertifika satarak değil, **fasilitatörüne müşteri getirerek** ayakta kalır. Cuemath'in öğretmene öğrenci ataması, TAZOF'un Halk Eğitim'de kurs açma hakkı, Math Pentathlon'un turnuva takvimi — hepsi aynı şeyin farklı biçimleridir. EPNEXUS'un bu üçünden birini (tercihen **turnuva ligi**) ilk yıl içinde kurması zorunludur.

---

# KAYNAKÇA

**Uluslararası girişimler**
- Math Pentathlon — Tournament Programs: https://www.mathpentath.org/programs/
- Math Pentathlon — Essential Materials (fiyat listesi): https://www.mathpentath.org/essential-materials/
- Math Pentathlon — Eğitim/atölye modeli: https://www.mathpentath.org/indianapolis/ ve https://www.mathpentath.org/overview-training-2/
- Math for Love — Mağaza ve fiyatlar: https://mathforlove.com/shop/
- Math for Love — Hakkında: https://mathforlove.com/about/
- Math for Love — Okul yöneticilerine sunulanlar: https://mathforlove.com/who-we-help-school-leaders/
- Seattle's Child — Math for Love kuruluş hikâyesi: https://www.seattleschild.com/making-math-fun-for-kids-seattle-couple-creates-board-games-teaching-tools/
- Cuemath — Öğretmen partner kazancı ve model: https://www.cuemath.com/teach/how-much-does-a-cuemath-teacher-earn/
- FIRST — Program kayıt ücretleri 2026-2027: https://www.firstinspires.org/programs/cost-and-registration
- Google for Education — Certified Trainer: https://edu.google.com/for-educators/certification-programs/professional-expertise/certified-trainer/
- Reach Capital — EdTech Ambassador Programs (Nearpod PioNear analizi): https://www.reachcapital.com/resources/thought-leadership/edtech-ambassador-programs-everything-you-need-to-know/

**Ulusal girişimler ve pazar**
- TAZOF — Tüm Akıl ve Zeka Oyunları Federasyonu: https://www.tazof.org.tr/
- TAZOF — Sıkça Sorulan Sorular (eğitmenlik dereceleri, Halk Eğitim koşulları): https://www.tazof.org.tr/sikca-sorulan-sorular
- Pentalitha — Matematik Oyunları: https://pentalitha.com/
- PEV Okulları — Pentalitha programı uygulaması: https://www.pevkolej.com/pentalitha-matematik-oyunlari-okulumuzda/
- Bilim Kahramanları Derneği — FLL Türkiye kayıt bilgilendirme 2025-2026: https://www.bilimkahramanlari.org/dokuman/2025/BKB_Kayit_Bilgilendirme_2025_2026.pdf
- BO Enstitü — Akıl ve Zeka Oyunları Eğitmenliği Sertifika Programı (fiyat çıpası): https://boenstitu.com/online-egitimler/akil-ve-zeka-oyunlari-egitmenligi-sertifika-programi
- KTO Karatay Üniversitesi KARSEM: https://karsem.karatay.edu.tr/akil-ve-zeka-oyunlari-egitmen-egitimi-sertifika-programi
- İstanbul Üniversitesi SFK: https://sfk.istanbul.edu.tr/akil-ve-zeka-oyunlari-egitmen-egitimi-sertifika-programi

**Akademik kaynaklar**
- Mert, B. & Koparan, T. (2024). Matematik Öğretiminde Eğitsel Oyunların Akademik Başarıya Etkisi: Bir Meta-Analiz Çalışması. *Karaelmas Eğitim Bilimleri Dergisi*, 12(1), 45-60. https://dergipark.org.tr/tr/pub/kebd/article/1426458
- DeWitt, D., Alias, N. & Al Amri, M. (2026). Systematic literature review: gamification in teacher professional training (2019-2025). *Frontiers in Education*. https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2026.1819092/full
- Oyun-Tabanlı Öğrenme Ortamlarının Akademik Başarıya Etkisi: Bir Meta-Analiz Çalışması. *Kastamonu Eğitim Dergisi*. https://dergipark.org.tr/tr/pub/kefdergi/article/479146
- Tam Sayılar Öğretiminde Eğitsel Oyun Kullanımının 7. Sınıf Öğrencilerinin Akademik Başarısına ve Matematiğe Yönelik Tutumlarına Etkisi. *Eğitim Bilim ve Araştırma Dergisi*. https://dergipark.org.tr/tr/pub/ebad/article/982300
- Research on online teachers' training based on the gamification design (PMC10112028). https://pmc.ncbi.nlm.nih.gov/articles/PMC10112028/

**Teknoloji / platform**
- LMS Gamification örnekleri: https://raccoongang.com/blog/lms-gamification/
- LearnDash oyunlaştırma eklentileri 2026: https://www.saffiretech.com/blog/best-learndash-gamification-plugins/
- Moodle oyunlaştırma (rozet, liderlik tablosu) 2026: https://blog.moodiycloud.com/gamify-your-moodle-course-2026
- Salesforce Trailhead rütbe/rozet modeli: https://trailhead.salesforce.com/content/learn/modules/trailhead-road-to-ranger/learn-about-trailblazer-ranks

---

*Bu rapor kamuya açık kaynaklardan derlenmiştir. Fiyat önerileri pazar çıpalarına dayalı tahminlerdir ve EPNEXUS'un mevcut dinamik fiyatlandırma tablosuyla karşılaştırılarak kesinleştirilmelidir. Sertifikaların hukuki geçerliliği konusunda uygulamaya geçmeden önce hukuki görüş alınması önerilir.*
