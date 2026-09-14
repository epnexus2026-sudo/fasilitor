/**
 * Derleme sonrası SQL şemasını dist/ altına kopyalar.
 * Ayrı dosya olmasının sebebi: tırnak kaçışları Windows cmd ile POSIX kabuklarında
 * farklı davrandığı için tek satırlık `node -e "..."` çağrısı taşınabilir değil.
 */
import { cpSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const kok = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const hedef = resolve(kok, 'dist/db/schema.sql');

mkdirSync(dirname(hedef), { recursive: true });
cpSync(resolve(kok, 'src/db/schema.sql'), hedef);
