/**
 * EPNEXUS Fasilitatör Ağı — panel arayüzü.
 * API sözleşmesi: apps/api/src/routes/*. Kural metinleri Yönetmelik v1.1'e atıflıdır.
 */

/* ------------------------------------------------------------------ yardımcı */
const $ = (s, k = document) => k.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const tl = (n) => Number(n ?? 0).toLocaleString('tr-TR');
const tarih = (t) => (t ? new Date(t).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const KADEME_ADI = { 0: 'Kâşif', 1: 'Fasilitatör', 2: 'Kıdemli Fasilitatör', 3: 'Master Fasilitatör' };
/** Md. 3.2 geçiş koşulu alan kodlarının görünen adları. */
const KOSUL_ADI = {
  egitim: 'Eğitim saati',
  sinav: 'Sınav barajı',
  oyun_tasarimi: 'Oyun Atölyesi çıktısı',
  uygulama: 'Onaylı uygulama raporu',
  turnuva: 'Turnuva',
  mentorluk: 'Mentorluk oturumu',
  rubrik: 'Rubrik ortalaması',
  kalibrasyon: 'Kalibrasyon uyumu',
  bitirme_a: 'Bitirme A — işletme dosyası',
  bitirme_b: 'Bitirme B — özgün prototip',
  davet: 'EPNEXUS daveti',
  aktiflik: 'Aktif üyelik',
  kademe: 'Kademe',
};

const DURUM_ETIKETI = {
  taslak: ['sade', 'Taslak'],
  gonderildi: ['warn', 'Kademe 2 ön onayında'],
  on_onayli: ['warn', 'Kademe 3 onayında'],
  onayli: ['ok', 'Onaylı'],
  duzeltme_istendi: ['crit', 'Düzeltme istendi'],
  reddedildi: ['crit', 'Reddedildi'],
};

const durum = {
  jeton: localStorage.getItem('epnexus_jeton'),
  ben: null,
  sekme: location.hash.slice(1) || 'panel',
};

function bildir(mesaj, hataMi = false) {
  const b = $('#bildirim');
  b.textContent = mesaj;
  b.classList.toggle('hata', hataMi);
  b.classList.add('acik');
  clearTimeout(bildir.zamanlayici);
  bildir.zamanlayici = setTimeout(() => b.classList.remove('acik'), 3600);
}

async function api(yol, opts = {}) {
  const basliklar = { 'content-type': 'application/json' };
  if (durum.jeton) basliklar.authorization = `Bearer ${durum.jeton}`;
  const y = await fetch('/api' + yol, {
    method: opts.method ?? 'GET',
    headers: basliklar,
    body: opts.govde === undefined ? undefined : JSON.stringify(opts.govde),
  });
  const metin = await y.text();
  const govde = metin ? JSON.parse(metin) : null;
  if (!y.ok) {
    const hata = new Error(govde?.hata ?? `Sunucu hatası (${y.status})`);
    hata.detay = govde?.detay;
    hata.durum = y.status;
    throw hata;
  }
  return govde;
}

/** Form gönderimlerini tek yerden sarmalar: hata mesajı + yenileme. */
function baglaForm(secici, isleyici) {
  const f = $(secici);
  if (!f) return;
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dugme = f.querySelector('button[type=submit]');
    if (dugme) dugme.disabled = true;
    try {
      await isleyici(Object.fromEntries(new FormData(f)), f);
    } catch (h) {
      const ek = Array.isArray(h.detay) ? ' — ' + h.detay.join(' · ') : '';
      bildir(h.message + ek, true);
    } finally {
      if (dugme) dugme.disabled = false;
    }
  });
}

/* --------------------------------------------------------------------- giriş */
function girisEkrani() {
  $('#sekmeler').innerHTML = '';
  $('#kimlikOzeti').textContent = '';
  $('#cikisDugmesi').hidden = true;
  $('#icerik').innerHTML = `
    <div class="giris-kutu">
      <div class="kart">
        <h1>Fasilitatör paneli</h1>
        <p class="kucuk-not">EPNEXUS Fasilitatör Ağı'na giriş yapın veya Kâşif (Kademe 0) olarak ücretsiz kaydolun.</p>
        <form id="girisForm">
          <label for="g-eposta">E-posta</label>
          <input id="g-eposta" name="eposta" type="email" autocomplete="username" required>
          <label for="g-parola">Parola</label>
          <input id="g-parola" name="parola" type="password" autocomplete="current-password" required>
          <div style="margin-top:14px"><button class="dugme" type="submit">Giriş yap</button></div>
        </form>
        <div class="demo-hesaplar">
          Demo hesaplar (parola <code>epnexus2026</code>):<br>
          <code>kubra@epnexusgames.com</code> — Master Fasilitatör<br>
          <code>zeynep@ornek.com</code> — Kıdemli Fasilitatör<br>
          <code>ekip@epnexusgames.com</code> — EPNEXUS ekibi
        </div>
      </div>

      <div class="kart">
        <h2>Kâşif olarak kaydol</h2>
        <p class="kucuk-not">Kademe 0 ücretsizdir ve sertifikasızdır (Yönetmelik Md. 4.1).</p>
        <form id="kayitForm">
          <label for="k-ad">Ad soyad</label><input id="k-ad" name="adSoyad" required minlength="3">
          <label for="k-eposta">E-posta</label><input id="k-eposta" name="eposta" type="email" required>
          <label for="k-parola">Parola (en az 8 karakter)</label>
          <input id="k-parola" name="parola" type="password" minlength="8" required autocomplete="new-password">
          <div class="satir">
            <div><label for="k-il">İl</label><input id="k-il" name="il"></div>
            <div><label for="k-ilce">İlçe</label><input id="k-ilce" name="ilce"></div>
          </div>
          <label for="k-okul">Okul / kurum</label><input id="k-okul" name="okul">
          <div style="margin-top:14px"><button class="dugme ikincil" type="submit">Kaydol</button></div>
        </form>
      </div>

      <p class="kucuk-not" style="text-align:center;margin-top:16px">
        <a href="/dogrula.html">Sertifika doğrula</a> · <a href="/belgeler/00_ICINDEKILER.md">Belge seti</a>
      </p>
    </div>`;

  baglaForm('#girisForm', async (v) => {
    const y = await api('/kimlik/giris', { method: 'POST', govde: v });
    oturumAc(y.jeton);
  });
  baglaForm('#kayitForm', async (v) => {
    const y = await api('/kimlik/kayit', { method: 'POST', govde: v });
    bildir('Kaydınız oluşturuldu. Hoş geldiniz!');
    oturumAc(y.jeton);
  });
}

async function oturumAc(jeton) {
  durum.jeton = jeton;
  localStorage.setItem('epnexus_jeton', jeton);
  await baslat();
}

function oturumKapat() {
  api('/kimlik/cikis', { method: 'POST' }).catch(() => {});
  durum.jeton = null;
  durum.ben = null;
  localStorage.removeItem('epnexus_jeton');
  girisEkrani();
}

/* -------------------------------------------------------------------- sekme */
function sekmeler() {
  const k = durum.ben.kademe;
  const ekip = durum.ben.rol === 'epnexus';
  const liste = [
    ['panel', 'Panel'],
    ['akademi', 'Akademi'],
    ['raporlar', 'Uygulamalarım'],
    ['tasarimlar', 'Oyun Atölyesi'],
    ['havuz', 'Oyun Havuzu'],
    ['talepler', 'Talepler'],
    ['lig', 'Lig & Rozetler'],
    ['magaza', 'Mağaza'],
    ['dizin', 'Dizin'],
  ];
  if (k >= 2 || ekip) liste.push(['onay', 'Onay kuyruğu']);
  if (k >= 3 || ekip) liste.push(['yonetim', 'Yönetim']);
  return liste;
}

function sekmeleriCiz() {
  $('#sekmeler').innerHTML = sekmeler()
    .map(([id, ad]) => `<button data-sekme="${id}" aria-selected="${durum.sekme === id}">${ad}</button>`)
    .join('');
  $('#sekmeler').querySelectorAll('button').forEach((b) => {
    b.addEventListener('click', () => {
      durum.sekme = b.dataset.sekme;
      location.hash = durum.sekme;
      sekmeleriCiz();
      cizdir();
    });
  });
}

/* ------------------------------------------------------------------ ekranlar */
const ekranlar = {};

ekranlar.panel = async () => {
  const [ilerleme, kalite] = await Promise.all([
    api('/akademi/ilerleme'),
    api(`/yonetim/kalite/${durum.ben.id}`).catch(() => null),
  ]);
  const b = durum.ben;
  const nx = b.nx;
  const y = ilerleme.yenileme;

  const merdiven = [0, 1, 2, 3].map((k) => `
    <div class="basamak ${k === b.kademe ? 'simdi' : ''}">
      <span class="kd">K${k}</span>
      <div style="flex:1">
        <strong>${KADEME_ADI[k]}</strong>
        ${k === b.kademe ? ' <span class="rozet">şu an buradasınız</span>' : ''}
      </div>
    </div>`).join('');

  const eksikler = ilerleme.degerlendirme.eksikler;

  return `
    <h1>Merhaba, ${esc(b.adSoyad)}</h1>
    <p class="kucuk-not">
      ${esc(b.markaUnvani ?? KADEME_ADI[b.kademe])} · ${esc(b.il)}${b.ilce ? ' / ' + esc(b.ilce) : ''}
      ${b.kurucuKohort ? ' · <span class="rozet gold">🥇 Kurucu Fasilitatör</span>' : ''}
    </p>

    <div class="izgara dort" style="margin:18px 0">
      <div class="olcum">
        <div class="deger">${tl(nx.bakiye)} <span style="font-size:14px;color:var(--muted)">NX</span></div>
        <div class="etiket">Harcanabilir bakiye</div>
        <div class="hedef">Toplam kazanım: ${tl(nx.toplamKazanim)} NX</div>
      </div>
      <div class="olcum">
        <div class="deger">${esc(nx.rutbe.ad)}</div>
        <div class="etiket">Rütbe</div>
        <div class="cubuk"><i style="width:${nx.ilerlemeYuzdesi}%"></i></div>
        <div class="hedef">${nx.sonrakiRutbe ? `${esc(nx.sonrakiRutbe.ad)} için ${tl(nx.sonrakiyeKalan)} NX` : 'En üst rütbe'}</div>
      </div>
      <div class="olcum">
        <div class="deger">${ilerleme.aday.onayliUygulama}</div>
        <div class="etiket">Onaylı uygulama raporu</div>
        <div class="hedef">Rubrik ort.: ${ilerleme.aday.rubrikOrtalamasi?.toFixed(2) ?? '—'} / 4</div>
      </div>
      <div class="olcum">
        <div class="deger">${ilerleme.degerlendirme.tamamlanmaYuzdesi}%</div>
        <div class="etiket">Kademe ${ilerleme.degerlendirme.hedef} hazırlığı</div>
        <div class="cubuk"><i style="width:${ilerleme.degerlendirme.tamamlanmaYuzdesi}%"></i></div>
      </div>
    </div>

    ${y.asama && y.asama.asama !== 'gecerli' ? `
      <div class="uyari ${y.asama.asama === 'dusus' ? 'crit' : 'warn'}">
        <strong>Yenileme:</strong>
        ${y.asama.asama === 'hatirlatma' ? `Sertifikanızın bitmesine ${y.asama.kalanGun} gün kaldı.` : ''}
        ${y.asama.asama === 'ek_sure' ? `Yenileme koşulu karşılanmadı; ${y.asama.kalanGun} günlük ek süreniz var (Md. 6.4).` : ''}
        ${y.asama.asama === 'dusus' ? 'Ek süre doldu; kademe düşüşü işleme alınacak (Md. 6.4).' : ''}
        ${y.eksikler.length ? '<br>Eksik: ' + y.eksikler.map(esc).join(' · ') : ''}
      </div>` : ''}

    ${(kalite?.kalite.uyarilar ?? []).map((u) => `<div class="uyari">${esc(u)}</div>`).join('')}

    <div class="izgara iki">
      <div class="kart">
        <h2>Kademe merdiveni</h2>
        <div class="merdiven">${merdiven}</div>
        <p class="dayanak">Yönetmelik Md. 3.1 — kademe haritası.</p>
      </div>

      <div class="kart">
        <h2>Kademe ${ilerleme.degerlendirme.hedef} için eksikleriniz</h2>
        ${eksikler.length === 0
          ? `<div class="uyari ok">Tüm geçiş koşulları karşılandı. Sertifika kararı için bir Master Fasilitatöre başvurabilirsiniz.</div>`
          : `<table><tr><th>Koşul</th><th>Gereken</th><th>Mevcut</th></tr>
             ${eksikler.map((e) => `<tr><td>${esc(KOSUL_ADI[e.alan] ?? e.alan)}</td><td>${esc(e.gereken)}</td><td class="kucuk-not">${esc(e.mevcut)}</td></tr>`).join('')}
             </table>`}
        <p class="dayanak">Yönetmelik Md. 3.2 — geçiş koşulları tablosu.</p>
      </div>
    </div>

    <div class="kart">
      <h2>Yenileme yükümlülüğünüz</h2>
      <p>${esc(y.aciklama)}</p>
      <p class="kucuk-not">Geçerlilik: <strong>${tarih(y.gecerlilik)}</strong> ·
        Durum: ${y.kosulKarsilandi ? '<span class="rozet ok">koşul karşılandı</span>' : '<span class="rozet warn">eksik var</span>'}</p>
      <p class="dayanak">Yönetmelik Md. 6.2 — yenileme koşulu ve süreleri.</p>
    </div>`;
};

ekranlar.akademi = async () => {
  const d = await api('/akademi/moduller');
  return `
    <h1>Akademi — Kademe ${d.hedefKademe}</h1>
    <p class="kucuk-not">
      ${d.tamamlananSaat} / ${d.gerekenSaat} saat tamamlandı · sınav barajı %${d.sinavBaraji}
    </p>
    <div class="cubuk" style="max-width:420px"><i style="width:${Math.min(100, (d.tamamlananSaat / d.gerekenSaat) * 100)}%"></i></div>

    <div class="kart" style="margin-top:16px">
      <table>
        <tr><th>Modül</th><th>Süre</th><th>Format</th><th class="sagda">Durum</th></tr>
        ${d.moduller.map((m) => `
          <tr>
            <td><span class="mono">${esc(m.kod)}</span> ${esc(m.ad)}</td>
            <td>${m.saat} sa</td>
            <td class="kucuk-not">${esc(m.format)}</td>
            <td class="sagda">${m.tamamlandi
              ? '<span class="rozet ok">tamamlandı</span>'
              : `<button class="dugme kucuk" data-modul="${esc(m.kod)}">Tamamla (+100 NX)</button>`}</td>
          </tr>`).join('')}
      </table>
    </div>

    <div class="kart">
      <h2>Sınav sonucu gir</h2>
      <p class="kucuk-not">Sınav barajları: Kademe 1 %70 · Kademe 2 %75 · Kademe 3 %85 (Md. 3.2).</p>
      <form id="sinavForm" class="satir">
        <div><label for="s-kademe">Kademe</label>
          <select id="s-kademe" name="kademe"><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></div>
        <div><label for="s-puan">Puan (0-100)</label><input id="s-puan" name="puan" type="number" min="0" max="100" required></div>
        <div style="flex:0"><button class="dugme" type="submit">Kaydet</button></div>
      </form>
    </div>`;
};

ekranlar.akademi.baglan = () => {
  document.querySelectorAll('[data-modul]').forEach((b) => {
    b.addEventListener('click', async () => {
      try {
        const y = await api(`/akademi/moduller/${b.dataset.modul}/tamamla`, { method: 'POST' });
        bildir(`${y.modul.kod} tamamlandı · +${y.nx.nx} NX`);
        await yenile();
      } catch (h) { bildir(h.message, true); }
    });
  });
  baglaForm('#sinavForm', async (v) => {
    const y = await api('/akademi/sinav', { method: 'POST', govde: { kademe: +v.kademe, puan: +v.puan } });
    bildir(y.gecti ? `Sınavı geçtiniz (%${y.puan} ≥ %${y.baraj})` : `Baraj karşılanmadı (%${y.puan} < %${y.baraj})`, !y.gecti);
    await yenile();
  });
};

ekranlar.raporlar = async () => {
  const d = await api('/raporlar');
  const oyunlar = (await api('/katalog/oyunlar')).oyunlar;

  return `
    <h1>Uygulamalarım</h1>
    <p class="kucuk-not">
      Akış: yükleme → <strong>Kademe 2 ön onayı</strong> (48 sa) → <strong>Kademe 3 onayı</strong> (5 iş günü) → 300 NX (Md. 7.2).
    </p>
    ${d.kalite.uyarilar.map((u) => `<div class="uyari">${esc(u)}</div>`).join('')}

    <div class="kart">
      <h2>Yeni uygulama raporu</h2>
      <form id="raporForm">
        <div class="satir">
          <div><label for="r-oyun">Oyun</label>
            <select id="r-oyun" name="oyunId">${oyunlar.map((o) => `<option value="${esc(o.id)}">${esc(o.ad)} (${o.sinif}. sınıf)</option>`).join('')}</select></div>
          <div><label for="r-kazanim">Kazanım kodu</label><input id="r-kazanim" name="kazanimKodu" value="MAT.5.2.1" required></div>
        </div>
        <div class="satir">
          <div><label for="r-okul">Okul</label><input id="r-okul" name="okulAdi" required></div>
          <div><label for="r-sinif">Sınıf düzeyi</label><input id="r-sinif" name="sinifDuzeyi" type="number" min="1" max="12" value="5" required></div>
          <div><label for="r-ogrenci">Öğrenci sayısı</label><input id="r-ogrenci" name="ogrenciSayisi" type="number" min="1" value="24" required></div>
        </div>
        <div class="satir">
          <div><label for="r-tarih">Tarih</label><input id="r-tarih" name="tarih" type="date" required></div>
          <div><label for="r-sure">Süre (dk)</label><input id="r-sure" name="sureDk" type="number" min="5" value="40" required></div>
        </div>

        <label>Kazanım Gözlem Rubriği — 4 boyut × 4 düzey (sınıf ortalaması)</label>
        <div class="satir">
          ${[['kazanim', 'Kazanımın gözlenmesi'], ['soylem', 'Matematiksel söylem'],
             ['katilim', 'Katılım ve iş birliği'], ['fasilitasyon', 'Fasilitasyon kalitesi']]
            .map(([k, ad]) => `<div>
              <label for="rb-${k}" style="font-weight:400;font-size:12px">${ad}</label>
              <select id="rb-${k}" name="rb_${k}">${[1, 2, 3, 4].map((n) => `<option ${n === 3 ? 'selected' : ''}>${n}</option>`).join('')}</select>
            </div>`).join('')}
        </div>

        <label for="r-not">Gözlem notu</label>
        <textarea id="r-not" name="gozlemNotu" placeholder="Öğrencinin kavramı fark ettiği anı yazın."></textarea>

        <label class="onay"><input type="checkbox" name="ogrenciVerisiAnonim" required>
          Öğrenci verisi anonimdir; rapora öğrenci adı yazılmamıştır (Md. 13.1).</label>
        <label class="onay"><input type="checkbox" name="fotografPolitikasiOnay" required>
          Fotoğraf politikasına uydum: <strong>öğrenci yüzü görünmüyor</strong> (Md. 13.2).</label>

        <div style="margin-top:14px"><button class="dugme" type="submit">Raporu oluştur</button></div>
        <p class="dayanak">EK-A A.2/4 — yapılmamış bir uygulama raporlanamaz; ihlali doğrudan sertifika iptali sebebidir.</p>
      </form>
    </div>

    <div class="kart">
      <h2>Raporlarım (${d.raporlar.length})</h2>
      ${d.raporlar.length === 0 ? '<div class="bos">Henüz rapor yok.</div>' : `
      <table>
        <tr><th>Tarih</th><th>Oyun</th><th>Okul</th><th>Rubrik</th><th class="sagda">Durum</th></tr>
        ${d.raporlar.map((r) => {
          const [sinif, ad] = DURUM_ETIKETI[r.durum] ?? ['sade', r.durum];
          return `<tr>
            <td>${tarih(r.tarih)}</td>
            <td>${esc(r.oyun.ad)}</td>
            <td class="kucuk-not">${esc(r.okulAdi)}</td>
            <td>${r.rubrikOrtalamasi.toFixed(2)}</td>
            <td class="sagda">
              <span class="rozet ${sinif}">${esc(ad)}</span>
              ${['taslak', 'duzeltme_istendi'].includes(r.durum)
                ? `<button class="dugme kucuk" data-gonder="${esc(r.id)}" style="margin-left:6px">Gönder</button>` : ''}
              ${r.redGerekcesi ? `<div class="kucuk-not">${esc(r.redGerekcesi)}</div>` : ''}
            </td></tr>`;
        }).join('')}
      </table>`}
    </div>`;
};

ekranlar.raporlar.baglan = () => {
  const t = $('#r-tarih');
  if (t) t.value = new Date().toISOString().slice(0, 10);

  baglaForm('#raporForm', async (v, f) => {
    const govde = {
      oyunId: v.oyunId, okulAdi: v.okulAdi,
      sinifDuzeyi: +v.sinifDuzeyi, ogrenciSayisi: +v.ogrenciSayisi,
      kazanimKodu: v.kazanimKodu, tarih: new Date(v.tarih).toISOString(), sureDk: +v.sureDk,
      rubrik: { kazanim: +v.rb_kazanim, soylem: +v.rb_soylem, katilim: +v.rb_katilim, fasilitasyon: +v.rb_fasilitasyon },
      gozlemNotu: v.gozlemNotu,
      ogrenciVerisiAnonim: f.ogrenciVerisiAnonim.checked,
      fotografPolitikasiOnay: f.fotografPolitikasiOnay.checked,
    };
    await api('/raporlar', { method: 'POST', govde });
    bildir('Rapor taslak olarak kaydedildi.');
    await yenile();
  });

  document.querySelectorAll('[data-gonder]').forEach((b) => {
    b.addEventListener('click', async () => {
      try {
        await api(`/raporlar/${b.dataset.gonder}/gonder`, { method: 'POST' });
        bildir('Rapor Kademe 2 ön onayına gönderildi.');
        await yenile();
      } catch (h) { bildir(h.message, true); }
    });
  });
};

ekranlar.onay = async () => {
  const d = await api('/raporlar/kuyruk');
  return `
    <h1>Onay kuyruğu</h1>
    <p class="kucuk-not">${esc(d.asama)} · hedef süre: ${esc(d.hedefSure)} (Md. 7.2)</p>
    <div class="kart">
      ${d.raporlar.length === 0 ? '<div class="bos">Kuyrukta bekleyen rapor yok.</div>' : `
      <table>
        <tr><th>Tarih</th><th>Oyun / Okul</th><th>Rubrik</th><th>Gözlem</th><th class="sagda">İşlem</th></tr>
        ${d.raporlar.map((r) => `
          <tr>
            <td>${tarih(r.tarih)}</td>
            <td>${esc(r.oyun.ad)}<div class="kucuk-not">${esc(r.okulAdi)} · ${r.ogrenciSayisi} öğrenci</div></td>
            <td>${r.rubrikOrtalamasi.toFixed(2)}</td>
            <td class="kucuk-not" style="max-width:260px">${esc(r.gozlemNotu || '—')}</td>
            <td class="sagda">
              <button class="dugme kucuk" data-onay="${esc(r.id)}" data-asama="${d.asama.includes('ön') ? 'on-onay' : 'onay'}">Onayla</button>
              <button class="dugme kucuk ikincil" data-duzeltme="${esc(r.id)}">Geri gönder</button>
            </td>
          </tr>`).join('')}
      </table>`}
      <p class="dayanak">Md. 7.2 — onaylanmayan rapor gerekçeli geri gönderilir; bir kez düzeltme hakkı vardır.</p>
    </div>`;
};

ekranlar.onay.baglan = () => {
  document.querySelectorAll('[data-onay]').forEach((b) => {
    b.addEventListener('click', async () => {
      try {
        const y = await api(`/raporlar/${b.dataset.onay}/${b.dataset.asama}`, { method: 'POST' });
        bildir(y.nx ? `Onaylandı · fasilitatöre ${y.nx.nx} NX yazıldı.` : 'Ön onay verildi.');
        await yenile();
      } catch (h) { bildir(h.message, true); }
    });
  });
  document.querySelectorAll('[data-duzeltme]').forEach((b) => {
    b.addEventListener('click', async () => {
      const gerekce = prompt('Geri gönderme gerekçesi (en az 10 karakter):');
      if (!gerekce) return;
      try {
        const y = await api(`/raporlar/${b.dataset.duzeltme}/duzeltme`, { method: 'POST', govde: { gerekce } });
        bildir(y.not);
        await yenile();
      } catch (h) { bildir(h.message, true); }
    });
  });
};

ekranlar.tasarimlar = async () => {
  const [d, atolye] = await Promise.all([api('/tasarimlar'), api('/katalog/oyun-atolyesi')]);
  return `
    <h1>Oyun Atölyesi</h1>
    <p class="kucuk-not">
      Her kademe bir oyun üretir: Kademe 1 🌱 varyant (≥60) · Kademe 2 🌿 özgün prototip (≥70) · Kademe 3 🌳 yayın dosyası (≥80).
    </p>

    <div class="uyari bilgi">
      <strong>Eser sizindir.</strong> Bir tasarımın sertifika koşulu olması telif devri anlamına gelmez.
      EPNEXUS hiçbir tasarımı, tasarımcısıyla EK-C sözleşmesi imzalamadan ürünleştirmez (Md. 13.6 — değiştirilemez madde).
    </div>

    <div class="kart">
      <h2>Tasarımlarım</h2>
      ${d.tasarimlar.length === 0 ? '<div class="bos">Henüz tasarım teslim etmediniz.</div>' : `
      <table>
        <tr><th>Tasarım</th><th>Kademe</th><th>Puan</th><th>Olgunluk</th><th class="sagda">Durum</th></tr>
        ${d.tasarimlar.map((t) => `
          <tr>
            <td>${esc(t.ad)}<div class="kucuk-not">${esc(t.etiketler.mebKazanim)} · ${esc(t.etiketler.mekanikler.join(', '))}</div></td>
            <td>K${t.kademe}</td>
            <td>${t.etiketler.rubrikPuani ?? '—'}${t.etiketler.rubrikPuani ? '/100' : ''}</td>
            <td>${t.olgunlukTanimi ? `${t.olgunlukTanimi.emoji} ${esc(t.olgunlukTanimi.ad)}` : '—'}</td>
            <td class="sagda">
              <span class="rozet ${t.durum === 'kabul' ? 'ok' : t.durum === 'red' ? 'crit' : 'sade'}">${esc(t.durum)}</span>
              ${['taslak', 'revizyonla_kabul'].includes(t.durum)
                ? `<button class="dugme kucuk" data-juri="${esc(t.id)}" style="margin-left:6px">Jüriye gönder</button>` : ''}
            </td>
          </tr>`).join('')}
      </table>`}
    </div>

    <div class="kart">
      <h2>Yeni tasarım teslimi</h2>
      <form id="tasarimForm">
        <div class="satir">
          <div><label for="t-ad">Oyun adı</label><input id="t-ad" name="ad" required></div>
          <div><label for="t-kademe">Kademe çıktısı</label>
            <select id="t-kademe" name="kademe"><option value="1">🌱 Kademe 1 — varyant</option><option value="2">🌿 Kademe 2 — özgün prototip</option><option value="3">🌳 Kademe 3 — yayın dosyası</option></select></div>
        </div>
        <div class="satir">
          <div><label for="t-alan">Alan</label><input id="t-alan" name="alan" value="matematik" required></div>
          <div><label for="t-sinif">Sınıf düzeyi</label><input id="t-sinif" name="sinifDuzeyi" type="number" min="1" max="12" value="6" required></div>
          <div><label for="t-kazanim">MEB kazanım kodu</label><input id="t-kazanim" name="mebKazanim" value="MAT.6.1.4" required></div>
        </div>
        <div class="satir">
          <div><label for="t-mekanik">Mekanik (kütüphaneden, virgülle)</label>
            <input id="t-mekanik" name="mekanikler" value="set-toplama" required list="mekanikListesi">
            <datalist id="mekanikListesi">${atolye.mekanikler.map((m) => `<option value="${esc(m)}">`).join('')}</datalist></div>
          <div><label for="t-oyuncu">Oyuncu sayısı</label><input id="t-oyuncu" name="oyuncuSayisi" value="2-4" required></div>
          <div><label for="t-sure">Süre (dk)</label><input id="t-sure" name="sureDk" type="number" min="5" value="25" required></div>
        </div>
        <div class="satir">
          <div><label for="t-karmasiklik">Bileşen karmaşıklığı</label>
            <select id="t-karmasiklik" name="bilesenKarmasikligi"><option value="dusuk">Düşük</option><option value="orta" selected>Orta</option><option value="yuksek">Yüksek</option></select></div>
          <div><label for="t-test">Test edilen öğrenci sayısı</label><input id="t-test" name="testEdilenOgrenci" type="number" min="0" value="24" required></div>
        </div>
        <label for="t-ozet">Özet (en az 20 karakter)</label>
        <textarea id="t-ozet" name="ozet" required minlength="20"></textarea>
        <label for="t-kaynak">Kaynak beyanı <span class="rozet crit">zorunlu</span></label>
        <textarea id="t-kaynak" name="kaynakBeyani" required minlength="10"
          placeholder="Esinlendiğiniz oyunlar ve kullandığınız mekaniklerin kaynağı."></textarea>
        <p class="dayanak">Md. 13.10 — kaynak beyanı olmayan dosya jüri tarafından puanlanmadan geri gönderilir.</p>
        <div style="margin-top:12px"><button class="dugme" type="submit">Tasarımı kaydet</button></div>
      </form>
    </div>

    <div class="kart">
      <h2>Jüri rubriği — EK-3 (100 puan)</h2>
      <table>
        <tr><th>Boyut</th><th>Puan</th><th>Güçlü sayılması için</th></tr>
        ${atolye.juriRubrigi.map((b) => `<tr><td>${esc(b.ad)}</td><td>${b.maksPuan}</td><td class="kucuk-not">${esc(b.guclu)}</td></tr>`).join('')}
      </table>
    </div>`;
};

ekranlar.tasarimlar.baglan = () => {
  baglaForm('#tasarimForm', async (v) => {
    await api('/tasarimlar', {
      method: 'POST',
      govde: {
        ...v,
        kademe: +v.kademe, sinifDuzeyi: +v.sinifDuzeyi, sureDk: +v.sureDk,
        testEdilenOgrenci: +v.testEdilenOgrenci,
        mekanikler: v.mekanikler.split(',').map((s) => s.trim()).filter(Boolean),
      },
    });
    bildir('Tasarım kaydedildi.');
    await yenile();
  });
  document.querySelectorAll('[data-juri]').forEach((b) => {
    b.addEventListener('click', async () => {
      try {
        const y = await api(`/tasarimlar/${b.dataset.juri}/juriye-gonder`, { method: 'POST' });
        bildir(`Jüriye gönderildi — ${y.juri.bilesim}, karar süresi ${y.juri.kararIsGunu} iş günü.`);
        await yenile();
      } catch (h) { bildir(h.message, true); }
    });
  });
};

ekranlar.havuz = async () => {
  const s = new URLSearchParams(havuzFiltresi);
  const d = await api('/tasarimlar/havuz?' + s);
  return `
    <h1>EPNEXUS Oyun Havuzu</h1>
    <p class="kucuk-not">${esc(d.hatirlatma)}</p>

    <div class="kart">
      <form id="havuzForm" class="satir">
        <div><label for="h-alan">Alan</label><input id="h-alan" name="alan" value="${esc(havuzFiltresi.alan ?? '')}" placeholder="matematik"></div>
        <div><label for="h-sinif">Sınıf</label><input id="h-sinif" name="sinif" type="number" min="1" max="12" value="${esc(havuzFiltresi.sinif ?? '')}"></div>
        <div><label for="h-mekanik">Mekanik</label><input id="h-mekanik" name="mekanik" value="${esc(havuzFiltresi.mekanik ?? '')}" placeholder="eslestirme"></div>
        <div><label for="h-sure">Maks. süre (dk)</label><input id="h-sure" name="maksSure" type="number" value="${esc(havuzFiltresi.maksSure ?? '')}"></div>
        <div style="flex:0"><button class="dugme" type="submit">Ara</button></div>
      </form>
      <p class="dayanak">Oyun Atölyesi § 6.3 — "Havuzun değeri arşivde değil, aranabilirliğindedir."</p>
    </div>

    <div class="kart">
      <h2>${d.toplam} tasarım</h2>
      ${d.toplam === 0 ? '<div class="bos">Bu ölçütlere uyan tasarım bulunamadı.</div>' : `
      <table>
        <tr><th>Tasarım</th><th>Tasarımcı</th><th>Sınıf / Kazanım</th><th>Mekanik</th><th>Süre</th><th class="sagda">Rubrik</th></tr>
        ${d.kayitlar.map((k) => `
          <tr>
            <td>${esc(k.ad)}</td>
            <td class="kucuk-not">${esc(k.tasarimci ?? '—')}</td>
            <td>${k.sinifDuzeyi}. sınıf<div class="kucuk-not">${esc(k.mebKazanim)}</div></td>
            <td class="kucuk-not">${esc(k.mekanikler.join(', '))}</td>
            <td>${k.sureDk} dk</td>
            <td class="sagda">${k.rubrikPuani}/100</td>
          </tr>`).join('')}
      </table>`}
    </div>`;
};

let havuzFiltresi = {};
ekranlar.havuz.baglan = () => {
  baglaForm('#havuzForm', async (v) => {
    havuzFiltresi = Object.fromEntries(Object.entries(v).filter(([, x]) => x));
    await cizdir();
  });
};

ekranlar.talepler = async () => {
  const [d, acik] = await Promise.all([api('/talepler/bana-atanan'), api('/talepler/kademe2-acigi')]);
  return `
    <h1>Talepler</h1>
    <p class="kucuk-not">
      EPNEXUS'a gelen okul, kurum ve veli talepleri bölgedeki aktif fasilitatörlere yönlendirilir (Md. 9.1).
      Atanan fasilitatör <strong>48 saat</strong> içinde kabul/ret bildirir (Md. 9.4).
    </p>

    <div class="kart">
      <h2>Bana atanan talepler</h2>
      ${d.talepler.length === 0 ? '<div class="bos">Şu an size atanmış talep yok.</div>' : `
      <table>
        <tr><th>Bölge</th><th>Okul / Kaynak</th><th>Son yanıt</th><th class="sagda">İşlem</th></tr>
        ${d.talepler.map((t) => `
          <tr>
            <td>${esc(t.il)} / ${esc(t.ilce)}</td>
            <td>${esc(t.okul_adi ?? t.kaynak)}<div class="kucuk-not">${esc(t.aciklama || '')}</div></td>
            <td class="kucuk-not">${t.yanit_son_tarihi ? new Date(t.yanit_son_tarihi).toLocaleString('tr-TR') : '—'}</td>
            <td class="sagda">
              ${t.durum === 'atandi' ? `
                <button class="dugme kucuk" data-kabul="${esc(t.id)}">Kabul</button>
                <button class="dugme kucuk ikincil" data-red="${esc(t.id)}">Ret</button>`
                : `<span class="rozet ${t.durum === 'kabul' ? 'ok' : 'sade'}">${esc(t.durum)}</span>`}
            </td>
          </tr>`).join('')}
      </table>`}
    </div>

    <div class="kart">
      <h2>Çalıştığım okulu kaydet</h2>
      <p class="kucuk-not">Md. 9.5 — bir okulla çalışan fasilitatör varsa o okul başka fasilitatöre yönlendirilmez.</p>
      <form id="okulForm" class="satir">
        <div><label for="o-okul">Okul adı</label><input id="o-okul" name="okulAdi" required></div>
        <div style="flex:0"><button class="dugme" type="submit">Kaydet</button></div>
      </form>
    </div>

    <div class="kart">
      <h2>Kademe 2 açığı olan bölgeler</h2>
      <p class="kucuk-not">${esc(acik.not)}</p>
      ${acik.bolgeler.length === 0 ? '<div class="bos">Açık işaretlenmiş bölge yok.</div>' : `
      <table><tr><th>İl</th><th>İlçe</th><th class="sagda">Karşılanamayan talep</th></tr>
        ${acik.bolgeler.map((b) => `<tr><td>${esc(b.il)}</td><td>${esc(b.ilce)}</td><td class="sagda">${b.talep_sayisi}</td></tr>`).join('')}
      </table>`}
    </div>`;
};

ekranlar.talepler.baglan = () => {
  const yanitla = async (id, karar) => {
    try {
      const y = await api(`/talepler/${id}/yanit`, { method: 'POST', govde: { karar } });
      bildir(y.mesaj ?? `Talep ${y.durum}.`);
      await yenile();
    } catch (h) { bildir(h.message, true); }
  };
  document.querySelectorAll('[data-kabul]').forEach((b) => b.addEventListener('click', () => yanitla(b.dataset.kabul, 'kabul')));
  document.querySelectorAll('[data-red]').forEach((b) => b.addEventListener('click', () => yanitla(b.dataset.red, 'red')));
  baglaForm('#okulForm', async (v) => {
    await api('/talepler/okullarim', { method: 'POST', govde: v });
    bildir('Okul kaydedildi.');
    await yenile();
  });
};

ekranlar.lig = async () => {
  const [d, r] = await Promise.all([api('/lig'), api('/lig/rozetler')]);
  const tablo = (baslik, satirlar) => `
    <div class="kart">
      <h2>${baslik}</h2>
      ${satirlar.length === 0 ? '<div class="bos">Veri yok.</div>' : `
      <table><tr><th>#</th><th>Ad</th><th></th><th class="sagda">NX</th></tr>
        ${satirlar.map((s) => `<tr class="${s.benMiyim ? 'ben' : ''}">
          <td>${s.sira}</td><td>${esc(s.ad)}</td>
          <td class="kucuk-not">${esc(s.altBilgi)}</td>
          <td class="sagda">${tl(s.nx)}</td></tr>`).join('')}
      </table>`}
    </div>`;

  return `
    <h1>Lig & Rozetler</h1>
    <p class="kucuk-not">${esc(d.kural)} · Mutlak ulusal sıralama üyeye gösterilmez (Md. 11.5).</p>
    ${d.benimLigim ? tablo(`${esc(d.benimLigim.ad)} Ligi (${d.benimLigim.satirlar.length} kişi)`, d.benimLigim.satirlar) : ''}
    <div class="izgara iki">
      ${tablo('İl tablosu', d.ilTablosu)}
      ${tablo('Okul takımları', d.okulTablosu)}
    </div>
    <div class="kart">
      <h2>Rozetler</h2>
      <div class="izgara dort">
        ${r.rozetler.map((b) => `
          <div class="olcum" style="${b.sahip ? '' : 'opacity:.45'}">
            <div style="font-size:24px">${b.emoji}</div>
            <div style="font-weight:600;font-size:14px">${esc(b.ad)}</div>
            <div class="hedef">${esc(b.kosul)}</div>
            ${b.nadir ? '<span class="rozet gold" style="margin-top:6px">nadir</span>' : ''}
          </div>`).join('')}
      </div>
    </div>`;
};

ekranlar.magaza = async () => {
  const [ucret, oyunlar] = await Promise.all([api('/katalog/ucretler'), api('/katalog/oyunlar')]);
  const nxKatalog = await api('/katalog/nx');
  return `
    <h1>Fasilitatör Mağazası</h1>
    <p class="kucuk-not">
      Kademe 1 listeden %15 · Kademe 2/3 500'lü kademe (min. 5 adet) · Rehber rütbesi ek %5 (Md. 5.3, Md. 11.2).
    </p>

    <div class="kart">
      <h2>Sipariş fiyatı hesapla</h2>
      <form id="siparisForm">
        ${oyunlar.oyunlar.map((o) => `
          <div class="satir" style="align-items:center;margin-bottom:6px">
            <div style="flex:2"><strong>${esc(o.ad)}</strong>
              <div class="kucuk-not">${o.sinif}. sınıf · liste ${tl(o.fiyat.f100)} ₺ · 500'lü ${tl(o.fiyat.f500)} ₺</div></div>
            <div style="flex:0;min-width:110px">
              <label for="a-${esc(o.id)}" style="font-weight:400;font-size:12px">Adet</label>
              <input id="a-${esc(o.id)}" name="${esc(o.id)}" type="number" min="0" value="0">
            </div>
          </div>`).join('')}
        <div style="margin-top:12px"><button class="dugme" type="submit">Hesapla</button></div>
      </form>
      <div id="siparisSonuc"></div>
    </div>

    <div class="kart">
      <h2>NX karşılıkları</h2>
      <p class="kucuk-not">Bakiyeniz: <strong>${tl(durum.ben.nx.bakiye)} NX</strong>. NX satın alınamaz ve devredilemez (Md. 11.4).</p>
      <table>
        <tr><th>Karşılık</th><th>NX</th><th class="sagda"></th></tr>
        ${nxKatalog.harcama.map((h) => `
          <tr><td>${esc(h.ad)}</td><td>${tl(h.nx)}</td>
            <td class="sagda"><button class="dugme kucuk ${durum.ben.nx.bakiye < h.nx ? 'ikincil' : ''}"
              data-harca="${esc(h.kod)}" ${durum.ben.nx.bakiye < h.nx ? 'disabled' : ''}>Kullan</button></td></tr>`).join('')}
      </table>
    </div>

    <div class="kart">
      <h2>Kurucu Kohort</h2>
      <p>${ucret.kurucuKohort.dolu} / ${ucret.kurucuKohort.kontenjan} kontenjan dolu ·
        <strong>${tl(ucret.sertifikasyon.k1_kurucu_kohort.tutar)} ₺</strong>
        (liste ${tl(ucret.sertifikasyon.k1_online.tutar)} ₺)</p>
      <div class="cubuk"><i style="width:${(ucret.kurucuKohort.dolu / ucret.kurucuKohort.kontenjan) * 100}%"></i></div>
      <p class="dayanak">Md. 5.1 — Kurucu Kohort yalnız ilk 50 kişiyle sınırlıdır.</p>
    </div>`;
};

ekranlar.magaza.baglan = () => {
  baglaForm('#siparisForm', async (v) => {
    const satirlar = Object.entries(v).map(([oyunId, adet]) => ({ oyunId, adet: +adet })).filter((s) => s.adet > 0);
    if (satirlar.length === 0) { bildir('En az bir oyun için adet girin.', true); return; }
    const d = await api('/magaza/fiyat-hesapla', { method: 'POST', govde: { satirlar } });
    $('#siparisSonuc').innerHTML = `
      ${d.uyarilar.map((u) => `<div class="uyari">${esc(u)}</div>`).join('')}
      <table style="margin-top:12px">
        <tr><th>Oyun</th><th>Adet</th><th>Liste</th><th class="sagda">Birim</th><th class="sagda">Toplam</th></tr>
        ${d.satirlar.map((s) => `<tr><td>${esc(s.oyunAdi)}</td><td>${s.adet}</td>
          <td class="kucuk-not">${tl(s.birimListe)} ₺</td>
          <td class="sagda">${tl(s.birimFiyat)} ₺</td><td class="sagda">${tl(s.toplam)} ₺</td></tr>`).join('')}
        <tr><td colspan="4"><strong>Ara toplam</strong> <span class="kucuk-not">(${esc(d.aliciKurali.ad)} · ${esc(d.fiyatKademesi)})</span></td>
          <td class="sagda"><strong>${tl(d.araToplam)} ₺</strong></td></tr>
      </table>`;
  });

  document.querySelectorAll('[data-harca]').forEach((b) => {
    b.addEventListener('click', async () => {
      try {
        const y = await api('/magaza/nx-harca', { method: 'POST', govde: { kod: b.dataset.harca } });
        bildir(`${y.kalem.ad} kullanıldı · kalan ${tl(y.bakiye.bakiye)} NX`);
        await yenile();
      } catch (h) { bildir(h.message, true); }
    });
  });
};

ekranlar.dizin = async () => {
  const [d, iller] = await Promise.all([api('/dizin'), api('/dizin/iller')]);
  return `
    <h1>Fasilitatör Dizini</h1>
    <p class="kucuk-not">Aktif ve sertifikalı fasilitatörler. Kademe 2 ve üzeri öne çıkarılır (Md. 4.3).</p>
    <div class="kart">
      <table>
        <tr><th>Fasilitatör</th><th>Bölge</th><th>Unvan</th><th class="sagda">Onaylı uygulama</th></tr>
        ${d.fasilitatorler.map((f) => `
          <tr>
            <td>${esc(f.adSoyad)} ${f.oneCikan ? '<span class="rozet">öne çıkan</span>' : ''}</td>
            <td>${esc(f.bolge)}</td>
            <td class="kucuk-not">${esc(f.unvan ?? '')}</td>
            <td class="sagda">${f.onayliUygulama} <span class="kucuk-not">(${f.oyunCesidi} oyun)</span></td>
          </tr>`).join('')}
      </table>
    </div>
    <div class="kart">
      <h2>İllere göre</h2>
      <table><tr><th>İl</th><th class="sagda">Fasilitatör</th></tr>
        ${iller.iller.map((i) => `<tr><td>${esc(i.il)}</td><td class="sagda">${i.fasilitator}</td></tr>`).join('')}
      </table>
    </div>`;
};

ekranlar.yonetim = async () => {
  const d = await api('/yonetim/pano');
  const k = d.kritikMetrik;
  return `
    <h1>Ağ panosu</h1>
    <p class="kucuk-not">Hedefler Sistem Kılavuzu § 3.4'ten alınmıştır (12 aylık).</p>

    <div class="izgara dort" style="margin:18px 0">
      ${d.kademeSayilari.map((s) => {
        const hedef = { 0: d.hedefler.kademe0, 1: d.hedefler.kademe1, 2: d.hedefler.kademe2, 3: d.hedefler.kademe3 }[s.kademe];
        return `<div class="olcum">
          <div class="deger">${tl(s.aktif)}</div>
          <div class="etiket">Kademe ${s.kademe} — ${esc(KADEME_ADI[s.kademe])}</div>
          <div class="cubuk"><i style="width:${Math.min(100, (s.aktif / hedef) * 100)}%"></i></div>
          <div class="hedef">Hedef: ${tl(hedef)}</div>
        </div>`;
      }).join('')}
    </div>

    <div class="kart">
      <h2>En kritik metrik</h2>
      <p>${esc(k.ad)}: <strong style="font-size:22px">${k.oran === null ? '—' : '%' + Math.round(k.oran * 100)}</strong>
        <span class="kucuk-not">(hedef ≥%${Math.round(k.hedef * 100)} · ${k.halaAktif}/${k.taban} fasilitatör)</span></p>
      <div class="cubuk"><i style="width:${Math.min(100, (k.oran ?? 0) * 100)}%"></i></div>
      <p class="dayanak">Sistem Kılavuzu § 3.4 — "90 gün sonra hâlâ aktif fasilitatör oranı ≥%55".</p>
    </div>

    <div class="izgara uc">
      <div class="kart">
        <h3>Rapor akışı</h3>
        <table>
          <tr><td>Kademe 2 ön onayı bekleyen</td><td class="sagda">${d.raporlar.bekleyenOnOnay}</td></tr>
          <tr><td>Kademe 3 onayı bekleyen</td><td class="sagda">${d.raporlar.bekleyenOnay}</td></tr>
          <tr><td>Onaylı</td><td class="sagda">${d.raporlar.onayli}</td></tr>
        </table>
      </div>
      <div class="kart">
        <h3>Sertifikalar</h3>
        <table>
          <tr><td>Geçerli</td><td class="sagda">${d.sertifikalar.gecerli}</td></tr>
          <tr><td>Askıda</td><td class="sagda">${d.sertifikalar.askida}</td></tr>
          <tr><td>İptal</td><td class="sagda">${d.sertifikalar.iptal}</td></tr>
        </table>
      </div>
      <div class="kart">
        <h3>Talepler</h3>
        <table>
          <tr><td>Yanıt bekleyen</td><td class="sagda">${d.talepler.bekleyen}</td></tr>
          <tr><td>Kabul edilen</td><td class="sagda">${d.talepler.kabul}</td></tr>
          <tr><td>EPNEXUS'a düşen</td><td class="sagda">${d.talepler.epnexusaDusen}</td></tr>
        </table>
      </div>
    </div>

    <div class="kart">
      <h2>Kademe 2 açığı olan bölgeler</h2>
      ${d.kademe2Acigi.length === 0 ? '<div class="bos">Açık yok.</div>' : `
      <table><tr><th>İl</th><th>İlçe</th><th class="sagda">Talep</th></tr>
        ${d.kademe2Acigi.map((b) => `<tr><td>${esc(b.il)}</td><td>${esc(b.ilce)}</td><td class="sagda">${b.talep}</td></tr>`).join('')}
      </table>`}
    </div>

    <div class="kart">
      <h2>Yenileme taraması</h2>
      <p class="kucuk-not">
        Md. 6.3 — 90/30/7 gün hatırlatmalarını üretir, ek süresi dolan üyeleri bir alt kademeye düşürür.
        ${durum.ben.rol === 'epnexus' ? '' : '<br><strong>Bu işlem EPNEXUS ekibine ayrılmıştır.</strong>'}
      </p>
      <button class="dugme" id="yenilemeTara" ${durum.ben.rol === 'epnexus' ? '' : 'disabled'}>Taramayı çalıştır</button>
      <div id="taramaSonuc"></div>
    </div>`;
};

ekranlar.yonetim.baglan = () => {
  const b = $('#yenilemeTara');
  if (!b) return;
  b.addEventListener('click', async () => {
    b.disabled = true;
    try {
      const d = await api('/yonetim/yenileme-tara', { method: 'POST' });
      $('#taramaSonuc').innerHTML = `
        <div class="uyari ok" style="margin-top:12px">
          ${d.taranan} üye tarandı · ${d.hatirlatmalar.length} hatırlatma ·
          ${d.ekSureler.length} ek süre · ${d.dususler.length} kademe düşüşü
        </div>
        <p class="dayanak">${esc(d.not)}</p>`;
    } catch (h) {
      bildir(h.message, true);
    } finally {
      b.disabled = false;
    }
  });
};

/* --------------------------------------------------------------------- akış */
async function cizdir() {
  const ekran = ekranlar[durum.sekme] ?? ekranlar.panel;
  $('#icerik').innerHTML = '<div class="bos">Yükleniyor…</div>';
  try {
    $('#icerik').innerHTML = await ekran();
    ekran.baglan?.();
    window.scrollTo({ top: 0 });
  } catch (h) {
    if (h.durum === 401) { oturumKapat(); return; }
    $('#icerik').innerHTML = `<div class="uyari crit">${esc(h.message)}</div>`;
  }
}

async function yenile() {
  durum.ben = await api('/kimlik/ben');
  kimlikOzetiCiz();
  await cizdir();
}

function kimlikOzetiCiz() {
  const b = durum.ben;
  $('#kimlikOzeti').innerHTML =
    `<strong>${esc(b.adSoyad)}</strong> · ${esc(KADEME_ADI[b.kademe])} · ` +
    `<span class="rozet">${tl(b.nx.bakiye)} NX · ${esc(b.nx.rutbe.ad)}</span>`;
  $('#cikisDugmesi').hidden = false;
}

async function baslat() {
  if (!durum.jeton) { girisEkrani(); return; }
  try {
    durum.ben = await api('/kimlik/ben');
  } catch {
    oturumKapat();
    return;
  }
  const gecerli = sekmeler().some(([id]) => id === durum.sekme);
  if (!gecerli) durum.sekme = 'panel';
  kimlikOzetiCiz();
  sekmeleriCiz();
  await cizdir();
}

$('#cikisDugmesi').addEventListener('click', oturumKapat);
window.addEventListener('hashchange', () => {
  const yeni = location.hash.slice(1);
  if (yeni && yeni !== durum.sekme && durum.ben) {
    durum.sekme = yeni;
    sekmeleriCiz();
    cizdir();
  }
});

baslat();
