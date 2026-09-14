import { createServer } from 'node:http';
import { uygulamaOlustur } from './uygulama.ts';
import { config, uretimMi } from './config.ts';
import { db } from './db/index.ts';
import { suresiDolmusOturumlariTemizle } from './lib/kimlik.ts';

if (uretimMi && config.gizliAnahtar === 'gelistirme-anahtari-degistirin') {
  console.error('[epnexus] EPNEXUS_SECRET ayarlanmadan üretim ortamında çalıştırılamaz.');
  process.exit(1);
}

db(); // Şemayı kur / bağlantıyı aç.
const temizlenen = suresiDolmusOturumlariTemizle();
if (temizlenen > 0) console.log(`[epnexus] ${temizlenen} süresi dolmuş oturum temizlendi.`);

const sunucu = createServer(uygulamaOlustur());

sunucu.listen(config.port, config.host, () => {
  console.log(`[epnexus] Fasilitatör Ağı platformu http://${config.host}:${config.port}`);
  console.log(`[epnexus] Veritabanı: ${config.dbYolu}`);
  if (!config.universiteSem) {
    console.log("[epnexus] Uyarı: SEM protokolü tanımlı değil — \"MEB'de geçerli\" ifadesi kullanılmaz (Sistem Kılavuzu § 4).");
  }
});

for (const sinyal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sinyal, () => {
    console.log(`\n[epnexus] ${sinyal} alındı, kapatılıyor.`);
    sunucu.close(() => process.exit(0));
  });
}
