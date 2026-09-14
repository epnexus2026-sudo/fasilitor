# Windows'ta sıfırdan kurulum

Daha önce hiç terminal kullanmadıysanız bu dosya size göre. Beş adım, yaklaşık
10 dakika. Her adımın sonunda **"ne görmelisiniz"** var — oradaki görüntüyü
görmüyorsanız devam etmeyin, o adımı tekrarlayın.

---

## Adım 1 — Node.js kurun

Site Node.js üzerinde çalışıyor. Bilgisayarınızda muhtemelen yok.

1. https://nodejs.org adresine gidin.
2. Yeşil **"LTS"** yazan butona tıklayın; `.msi` dosyası iner.
3. İnen dosyaya çift tıklayın. Açılan kurulumda sadece **Next → Next → Install**
   deyin, hiçbir seçeneği değiştirmeyin.
4. Kurulum bitince **Finish**'e basın.

> ⚠️ Kurulumdan sonra açık olan tüm komut istemi pencerelerini kapatın.
> Node.js'i yeni pencereler tanır, eskiler tanımaz. Bu, en sık yapılan hatadır.

---

## Adım 2 — Komut istemini açın ve kurulumu doğrulayın

1. Klavyeden **Windows tuşu + R**'ye basın.
2. Açılan küçük kutuya `cmd` yazıp **Enter**'a basın.
3. Siyah bir pencere açılır. İçine şunu yazıp **Enter**'a basın:

```
node -v
```

**Ne görmelisiniz:** `v22.11.0` gibi bir şey. Baştaki sayı **22 veya daha büyük**
olmalı.

| Gördüğünüz | Ne yapmalı |
|---|---|
| `v22.` veya üstü | Devam edin |
| `v20.` gibi daha küçük bir sayı | Adım 1'i tekrarlayın, LTS sürümünü indirin |
| `'node' is not recognized...` | Node.js kurulmamış ya da pencereyi kapatıp açmamışsınız. Pencereyi kapatın, yeni bir tane açın, tekrar deneyin |

---

## Adım 3 — Kodu indirin

Burada `git` kurmanıza gerek yok, tarayıcıdan ZIP olarak indireceğiz.

1. Tarayıcıda şu adresi açın:
   https://github.com/epnexus2026-sudo/fasilitor
2. Giriş yapmanız istenirse GitHub hesabınızla girin (depo sizin).
3. Sol üstte bir dal (branch) seçici var, üzerinde `main` ya da benzeri yazar.
   Tıklayın ve **`claude/epnexus-facilitator-network-bvo23d`** dalını seçin.
4. Sağdaki yeşil **`< > Code`** butonuna tıklayın → **Download ZIP**.

   Kısayol: bu bağlantı doğrudan indirir →
   `https://github.com/epnexus2026-sudo/fasilitor/archive/refs/heads/claude/epnexus-facilitator-network-bvo23d.zip`

5. İnen ZIP dosyasını bulun (genelde **İndirilenler** klasöründe).
6. Üzerine **sağ tıklayın → Tümünü ayıkla… → Ayıkla**.

**Ne görmelisiniz:** Ayıklanan klasörün içine girdiğinizde şu dosya ve klasörleri
görmelisiniz:

```
apps    docs    README.md    package.json
```

> 💡 Windows bazen klasörü iç içe koyar: `fasilitor-claude-...` içinde yine
> `fasilitor-claude-...` olabilir. **`package.json` dosyasını gördüğünüz klasöre**
> kadar girin. Doğru klasör o.

---

## Adım 4 — Komut istemini o klasörde açın

Bu adım kritik: komutlar doğru klasörde çalışmazsa hata verir.

1. `package.json` dosyasını gördüğünüz klasörü Dosya Gezgini'nde açık tutun.
2. Pencerenin **üstündeki adres çubuğuna** tıklayın (klasör yolunun yazdığı yer).
   Yol maviye dönüp seçilir.
3. Yolun üzerine `cmd` yazın ve **Enter**'a basın.

Siyah pencere açılır ve **doğrudan o klasörde** başlar. Kontrol edin — şunu yazın:

```
dir package.json
```

**Ne görmelisiniz:** listede `package.json` görünmeli. `File Not Found` diyorsa
yanlış klasördesiniz, Adım 3'ün sonundaki nota dönün.

---

## Adım 5 — Kurun ve başlatın

Şimdi üç komut. **Her birini yazıp Enter'a basın ve bitmesini bekleyin.**
Sıradakine geçmeden önce bir öncekinin bittiğinden emin olun.

### 5a. Gerekli araçları indirin

```
npm install
```

Birkaç saniye sürer, internetten 4 paket iner.

**Ne görmelisiniz:** `added 4 packages` gibi bir satır ve `found 0 vulnerabilities`.

### 5b. Demo verisini yükleyin

```
npm run seed
```

**Ne görmelisiniz:**

```
[epnexus] Demo verisi yüklendi:
  üye: 9 · sertifika: 13 · rapor: 63
  ...
  Demo giriş: kubra@epnexusgames.com / epnexus2026 (Master)
```

### 5c. Siteyi başlatın

```
npm start
```

İlk çalıştırmada kod derlendiği için 5-10 saniye sürebilir.

**Ne görmelisiniz:**

```
[epnexus] Fasilitatör Ağı platformu http://0.0.0.0:4000
[epnexus] Veritabanı: ...\data\epnexus.db
```

> Altında SEM protokolüyle ilgili bir uyarı satırı da çıkar. Bu **hata değildir**,
> beklenen bir durumdur (bkz. README).

---

## Adım 6 — Siteyi açın

Tarayıcıda şu adrese gidin:

### **http://localhost:4000**

Giriş ekranı gelir. Parola hepsinde `epnexus2026`:

| E-posta | Ne görürsünüz |
|---|---|
| `zeynep@ornek.com` | Kıdemli Fasilitatör — onay kuyruğu, turnuva, mentorluk |
| `kubra@epnexusgames.com` | Master — sertifika kararı, jüri, nihai rapor onayı |
| `ekip@epnexusgames.com` | EPNEXUS ekibi — ağ panosu, yaptırım, yenileme taraması |
| `elif@ornek.com` | Fasilitatör — sade üye görünümü |

Farklı hesaplarla girip bakın; sekmeler ve yetkiler kademeye göre değişir.

**Önemli:** Siyah komut penceresi **açık kalmalı**. Kapatırsanız site durur.
Durdurmak istediğinizde o pencerede **Ctrl + C**'ye basın.

Tekrar başlatmak için: Adım 4'teki gibi klasörde komut istemi açıp `npm start`
yazmanız yeterli. `npm install` ve `npm run seed`'i bir daha çalıştırmanıza gerek yok.

---

## Bir şeyler ters giderse

| Hata mesajı | Sebebi ve çözümü |
|---|---|
| `'node' is not recognized` <br> `'npm' is not recognized` | Node.js kurulu değil ya da kurulumdan sonra pencereyi yenilemediniz. Pencereyi kapatın, yenisini açın. Hâlâ olmuyorsa Adım 1'i tekrarlayın |
| `Could not read package.json` <br> `ENOENT ... package.json` | Yanlış klasördesiniz. Adım 4'ü tekrarlayın — `dir package.json` komutu dosyayı görmeli |
| `SyntaxError` · `Unexpected token` · `is not supported` | Node.js sürümünüz eski. `node -v` yazın; 22'den küçükse Adım 1'i tekrarlayın |
| `EADDRINUSE` · `address already in use` | 4000 portunu başka bir program kullanıyor. Şunu yazın: `set PORT=5000 && npm start` — sonra tarayıcıda `http://localhost:5000` açın |
| Tarayıcıda "siteye ulaşılamıyor" | Komut penceresini kontrol edin; `platform http://...` satırı görünüyor mu? Görünmüyorsa site çalışmıyordur |
| Demo verisi bozuldu / baştan başlamak istiyorum | Klasördeki `data` klasörünü silin, sonra `npm run seed` ve `npm start` |

Takıldığınız adımın **numarasını** ve ekrandaki **hata metnini** bana yazın, oradan
devam edelim.
