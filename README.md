# EPNEXUS Fasilitatör Ağı

EPNEXUS Fasilitatör Ağı'nın çalışan platformu: kademe merdiveni, sertifikasyon,
uygulama raporu onay akışı, NX puan sistemi, Oyun Atölyesi ve Oyun Havuzu, turnuva
protokolü, talep yönlendirme ve lig.

Kodun tamamı **Fasilitatör Ağı Yönetmeliği v1.1** ile **Oyun Atölyesi Programı v1.2**
hükümlerini uygular. Kaynak belgeler `docs/` altındadır; bir kural değişirse önce
belge, sonra `apps/api/src/domain/` altındaki ilgili motor güncellenir.

> ⚠️ **Yürürlük uyarısı.** Yönetmelik, EK-A ve EK-C hukuk danışmanı incelemesinden
> geçmeden yürürlüğe konmamalıdır. Sistem Kılavuzu § 4'e göre **tüzel kişilik
> kurulumu**, **üniversite SEM protokolü** ve **hukuki kontrol** tamamlanmadan
> Kurucu Kohort daveti gönderilmemelidir. SEM protokolü tanımlanmadığı sürece
> platform "MEB'de geçerli" ifadesini hiçbir yerde üretmez (bkz. `config.universiteSem`).

---

## Hızlı başlangıç

Gereksinim: **Node.js ≥ 22.5** (yerleşik `node:sqlite` için). Çalışma zamanı
bağımlılığı yoktur; yalnız TypeScript derleme ve tip denetimi için geliştirme
bağımlılıkları kurulur.

```bash
npm install          # yalnız typescript + @types/node
npm run seed         # demo verisi (Kurucu Kohort senaryosu)
npm start            # derler ve başlatır → http://localhost:4000
```

`npm start` derlemeyi kendisi yapar (`prestart`); ayrıca `npm run build` çalıştırmanız
gerekmez. Geliştirme için `npm run dev` — TypeScript'i doğrudan çalıştırır ve dosya izler.

Windows'ta hiç terminal kullanmadıysanız: `KURULUM.md` sıfırdan anlatır.

Demo hesaplar (parola `epnexus2026`):

| E-posta | Rol |
|---|---|
| `kubra@epnexusgames.com` | Master Fasilitatör (Kademe 3) |
| `zeynep@ornek.com` | Kıdemli Fasilitatör (Kademe 2) |
| `elif@ornek.com` | Fasilitatör (Kademe 1) |
| `ekip@epnexusgames.com` | EPNEXUS ekibi (yönetim yetkileri) |

### Testler

```bash
npm test          # 106 test — alan motorları + uçtan uca API
npm run typecheck
```

---

## Depo yapısı

```
apps/
  api/                      Sunucu — TypeScript, bağımlılıksız
    src/
      domain/               Saf kural motorları (I/O yok, testlerin çekirdeği)
        nx.ts               Md. 11  — NX kazanım/harcama, rütbeler, sınırlar
        kademe.ts           Md. 3   — geçiş koşulları, geri düşme, geçerlilik
        yenileme.ts         Md. 6   — yenileme koşulu, hatırlatma, ek süre
        yaptirim.ts         Md. 8   — yaptırım basamakları, doğrudan iptal
        rubrik.ts           Md. 7   — kazanım rubriği ve kalite eşikleri
        yonlendirme.ts      Md. 9   — talep atama sırası, yük dengeleme
        turnuva.ts          Md. 10  — İsviçre eşleştirme, Buchholz, hakem kuralları
        ucret.ts            Md. 5.1/5.3 — ücretler, materyal fiyat kademeleri
        gelir.ts            Md. 5.2 — gelir paylaşımı ve telif
        oyunhavuzu.ts       EK-3 jüri rubriği + Md. 13 katmanlı hak modeli
        sertifika.ts        Md. 6.1 — numara, QR imzası, Open Badges 3.0
        lig.ts              Md. 11.5 — lig grupları, tablolar
      routes/               HTTP uçları (her biri ilgili maddeye atıflı)
      services/             Alan motorlarını veritabanına bağlayan katman
      db/                   Şema, erişim, demo verisi
      lib/                  Yönlendirici, kimlik, doğrulama, statik sunum
    test/                   node:test ile 106 test
  web/                      Panel ve kamuya açık sayfalar (derlemesiz)
docs/                       Belge seti (8 belge · sertifika · hukuk dosyası · prototipler)
```

Belgeler sunucudan `/belgeler/…` altında da servis edilir
(örn. `/belgeler/02_Belgeler_Kaynak_MD/02_Fasilitator_Agi_Yonetmeligi.md`).

---

## Sistemin özeti

```
KADEME 0 — Kâşif                 ücretsiz · sertifikasız
      ↓ 27 sa eğitim + %70 sınav + 3 onaylı uygulama + 1 oyun varyantı (≥60/100)
KADEME 1 — Fasilitatör           1.950 ₺ (Kurucu) / 3.900 ₺ · 2 yıl
      ↓ 10 uygulama + 1 turnuva + rubrik ≥3,0 + 18 sa kamp + bitirme A/B (≥70)
KADEME 2 — Kıdemli Fasilitatör   6.500 ₺ · 3 yıl
      ↓ 20 mentorluk + 2 turnuva + kalibrasyon ≥%85 + davet + yayın dosyası (≥80)
KADEME 3 — Master Fasilitatör    ücretsiz · 2 yıl
```

Ağı diri tutan üç mekanizma da kodda karşılığını bulur:

| Mekanizma | Yönetmelik | Uygulama |
|---|---|---|
| Talep yönlendirme | Md. 9 | `domain/yonlendirme.ts` · `POST /api/talepler` |
| Yenileme koşulu | Md. 6 | `domain/yenileme.ts` · `POST /api/yonetim/yenileme-tara` |
| Sezon takvimi (lig) | Md. 10, 11.5 | `domain/turnuva.ts`, `domain/lig.ts` |

---

## API

Tüm uçlar `/api` önekiyle servis edilir. Kimlik doğrulaması
`Authorization: Bearer <jeton>` başlığıyla yapılır.

### Kimlik ve katalog

| Uç | Açıklama |
|---|---|
| `POST /kimlik/kayit` · `POST /kimlik/giris` | Kademe 0 kaydı ve oturum |
| `GET /kimlik/ben` | Profil, kademe, NX bakiyesi ve rütbe |
| `POST /kimlik/ek-a-imzala` | EK-A Marka ve Etik Sözleşmesi (sertifikadan önce zorunlu) |
| `GET /katalog/oyunlar` · `/kademeler` · `/ucretler` · `/gelir-paylasimi` · `/nx` · `/oyun-atolyesi` · `/kurallar` | Kamuya açık başvuru verisi |

### Uygulama raporları — Md. 7.2 akışı

```
POST /raporlar                 fasilitatör raporu oluşturur (KVKK onayları zorunlu)
POST /raporlar/:id/gonder      → durum: gonderildi
POST /raporlar/:id/on-onay     Kademe 2 ön onayı (48 sa hedef)
POST /raporlar/:id/onay        Kademe 3 onayı (5 iş günü) → 300 NX yazılır
POST /raporlar/:id/duzeltme    gerekçeli geri gönderme (bir kez düzeltme hakkı)
POST /raporlar/:id/uydurma-veri  Md. 6.4 — NX geri alınır, rapor geçersiz kılınır
POST /raporlar/:id/geri-bildirim anonim 5 soruluk QR anketi
GET  /raporlar/kuyruk          kademeye göre ön onay / onay kuyruğu
```

### Sertifika — Md. 6.1

```
POST /sertifikalar/duzenle        Master kararı (Md. 14.4 tarafsızlık denetimli)
GET  /sertifikalar/dogrula/:no    kamuya açık QR doğrulaması (imza etiketi opsiyonel)
GET  /sertifikalar/:no/openbadge  Open Badges 3.0 AchievementCredential
GET  /sertifikalar/:no/html       docs/03_Sertifika şablonundan basıma hazır HTML
POST /sertifikalar/:no/durum      askı / iptal (Md. 6.4)
```

### Oyun Atölyesi ve Havuz

```
POST /tasarimlar                      teslim (kaynak beyanı zorunlu — Md. 13.10)
POST /tasarimlar/:id/juriye-gonder
POST /tasarimlar/:id/juri             EK-3 rubriği · tarafsızlık · barajlar
GET  /tasarimlar/havuz?alan=&sinif=&mekanik=&maksSure=&minRubrik=
POST /tasarimlar/:id/kullanim-izni    Md. 13.8 sınırları
POST /tasarimlar/:id/ilk-teklif-bildirimi   Md. 13.7/3 — 90 günlük süre başlar
POST /tasarimlar/:id/ekc-sozlesme     Md. 13.7/4 — yayın sözleşmesi
GET  /tasarimlar/:id/telif?netSatis=  telif hesabı (sözleşme yoksa reddeder)
```

### Talep yönlendirme, turnuva, lig, mağaza, yönetim

```
POST /talepler                       kamuya açık talep formu → otomatik atama
POST /talepler/:id/yanit             48 saat içinde kabul/ret (Md. 9.4)
POST /talepler/zaman-asimi-tara      süresi geçen atamaları devreder
POST /turnuvalar                     8 hafta kuralı + kademe yetkisi denetimi
GET  /turnuvalar/:id/eslestirme      İsviçre sistemi
GET  /turnuvalar/:id/siralama        Buchholz → doğrudan karşılaşma → görev kartı → kura
POST /turnuvalar/:id/rapor           %40/%30/%30 paylaşım (Md. 10.6)
GET  /lig · /lig/rozetler            Md. 11.5 — ulusal mutlak sıralama gösterilmez
POST /magaza/fiyat-hesapla           Md. 5.3 fiyat kademeleri ve indirimler
POST /yonetim/yaptirim               Md. 8 basamakları + Md. 6.4 doğrudan iptal
POST /yonetim/yenileme-tara          Md. 6.3 hatırlatmaları ve kademe düşüşleri
GET  /yonetim/pano                   ağ panosu (Sistem Kılavuzu § 3.4 hedefleriyle)
```

---

## Kodda uygulanan başlıca kurallar

Aşağıdaki kurallar yalnız belgede değil, kodda da zorunludur ve testlerle korunur:

- **Fasilitatörün kendi kursundan EPNEXUS pay almaz (%0).** `gelir.ts`
- **Kurucu Kohort yalnız ilk 50 kişi.** Kontenjan dolunca fiyat otomatik listeye döner.
- **Tasarımcı eserinin sahibidir.** EK-C imzalanmadan telif hesabı üretilmez; bu
  madde Md. 13.6 uyarınca tasarımcı aleyhine değiştirilemez.
- **Kaynak beyanı olmayan tasarım puanlanmadan geri döner.** Md. 13.10
- **Öğrenci verisi anonim, öğrenci yüzü görünmez.** Onay kutuları işaretlenmeden
  rapor kaydedilemez; gelecek tarihli uygulama raporlanamaz (EK-A A.2/4).
- **Bir Master, mentorluk yaptığı kişinin sertifika kararını veremez ve tasarımını
  değerlendiremez.** Md. 14.4 — istisnası yoktur.
- **Kendi raporunu onaylayamazsın**; Kademe 2 ön onayı olmadan Kademe 3 onayı verilemez.
- **Askıdaki üye işlem yapamaz**, dizinden çıkarılır, sertifikası askıya alınır.
- **NX satın alınamaz, devredilemez**; sahte rapor tespitinde geri alınır ve
  denetim izi olarak negatif kayıt yazılır.
- **Bir okulla çalışan fasilitatör varsa o okul başkasına yönlendirilmez.** Md. 9.5
- **İl/ilçe turnuvasını yalnız Kademe 2+ düzenler**, en az 8 hafta önce bildirir;
  turnuva direktörü baş hakem olamaz, hakem kendi öğrencisinin masasına bakamaz.

---

## Yapılandırma

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `PORT` / `HOST` | `4000` / `0.0.0.0` | Sunucu adresi |
| `EPNEXUS_DB` | `data/epnexus.db` | SQLite dosyası |
| `EPNEXUS_SECRET` | *(geliştirme anahtarı)* | Oturum ve QR imzası. **Üretimde zorunlu** — ayarlanmadan `NODE_ENV=production` ile başlatma reddedilir |
| `EPNEXUS_OTURUM_SAAT` | `12` | Oturum ömrü (saat) |
| `EPNEXUS_SEM_PROTOKOLU` | *(boş)* | Üniversite SEM protokolü. Boşken sertifikada ve sitede "MEB'de geçerli" ifadesi üretilmez |
| `EPNEXUS_DOGRULAMA_TABANI` | `https://epnexusgames.com/dogrula` | QR doğrulama adresi |

---

## Sırada ne var

Sistem Kılavuzu § 4'teki uygulama sırasına göre platform tarafında kalanlar:

1. **Ödeme ve faturalama entegrasyonu** — tüzel kişilik kurulumundan sonra.
2. **Asenkron video ve sınav bankası** — `akademi` modülü şu an ilerleme ve baraj
   takibi yapar; içerik barındırma eklenecek (Ay 2, iş 7-8).
3. **E-posta/SMS gönderimi** — yenileme hatırlatmaları ve talep bildirimleri şu an
   yalnız kayıt üretir; gönderim sağlayıcısı bağlanacak.
4. **KVKK aydınlatma metinleri ve VERBİS** — uzman görüşüyle netleştirilecek (Md. 13.4).
