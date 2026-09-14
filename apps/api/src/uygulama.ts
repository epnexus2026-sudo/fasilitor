/** Yönlendirici ağacının kurulumu — hem sunucu hem testler bunu kullanır. */
import { Yonlendirici, istekIsleyici } from './lib/http.ts';
import { statikSunucu } from './lib/statik.ts';
import { config } from './config.ts';
import { kimlikRotalari } from './routes/kimlik.ts';
import { katalogRotalari } from './routes/katalog.ts';
import { akademiRotalari } from './routes/akademi.ts';
import { raporRotalari } from './routes/raporlar.ts';
import { sertifikaRotalari } from './routes/sertifikalar.ts';
import { tasarimRotalari } from './routes/tasarimlar.ts';
import { talepRotalari } from './routes/talepler.ts';
import { turnuvaRotalari } from './routes/turnuvalar.ts';
import { ligRotalari } from './routes/lig.ts';
import { magazaRotalari } from './routes/magaza.ts';
import { yonetimRotalari } from './routes/yonetim.ts';
import { dizinRotalari } from './routes/dizin.ts';

export function yonlendiriciKur(): Yonlendirici {
  const api = new Yonlendirici();

  api.get('/saglik', () => ({
    durum: 'çalışıyor',
    surum: '1.0.0',
    yonetmelik: 'v1.1',
    zaman: new Date().toISOString(),
  }));

  api
    .bagla('/kimlik', kimlikRotalari)
    .bagla('/katalog', katalogRotalari)
    .bagla('/akademi', akademiRotalari)
    .bagla('/raporlar', raporRotalari)
    .bagla('/sertifikalar', sertifikaRotalari)
    .bagla('/tasarimlar', tasarimRotalari)
    .bagla('/talepler', talepRotalari)
    .bagla('/turnuvalar', turnuvaRotalari)
    .bagla('/lig', ligRotalari)
    .bagla('/magaza', magazaRotalari)
    .bagla('/yonetim', yonetimRotalari)
    .bagla('/dizin', dizinRotalari);

  const kok = new Yonlendirici();
  kok.bagla('/api', api);
  return kok;
}

export function uygulamaOlustur() {
  const web = statikSunucu(config.webKoku, '/');
  const belgeler = statikSunucu(config.belgeKoku, '/belgeler/');

  return istekIsleyici({
    yonlendirici: yonlendiriciKur(),
    yedek: (istek, yanit) => belgeler(istek, yanit) || web(istek, yanit),
  });
}
