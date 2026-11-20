// Pixel-diff two screenshot sets.
// Usage: node tests/diff.mjs baseline after   -> writes tests/screens/diff/*.png and prints a markdown table
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const [a = 'baseline', b = 'after'] = process.argv.slice(2);
const dir = l => new URL(`./screens/${l}/`, import.meta.url);
const out = new URL('./screens/diff/', import.meta.url);

const rows = [];
let changed = 0, total = 0;
for (const w of (await readdir(dir(a))).filter(x => /^\d+$/.test(x)).sort((x, y) => x - y)) {
  await mkdir(new URL(`${w}/`, out), { recursive: true });
  for (const f of (await readdir(new URL(`${w}/`, dir(a)))).sort()) {
    total++;
    const A = PNG.sync.read(await readFile(new URL(`${w}/${f}`, dir(a))));
    const bBuf = await readFile(new URL(`${w}/${f}`, dir(b))).catch(() => null);
    if (!bBuf) { rows.push([w, f, 'missing in ' + b]); changed++; continue; }
    const B = PNG.sync.read(bBuf);
    if (A.width !== B.width || A.height !== B.height) {
      rows.push([w, f, `size ${A.width}x${A.height} -> ${B.width}x${B.height}`]); changed++; continue;
    }
    const D = new PNG({ width: A.width, height: A.height });
    const n = pixelmatch(A.data, B.data, D.data, A.width, A.height, { threshold: 0.1 });
    if (n) {
      changed++;
      rows.push([w, f, `${n} px (${(n / (A.width * A.height) * 100).toFixed(3)}%)`]);
      await writeFile(new URL(`${w}/${f}`, out), PNG.sync.write(D));
    }
  }
}
const report = [`Compared ${total} screenshots: ${total - changed} identical, ${changed} different.`, ''];
if (rows.length) report.push('| Width | Shot | Difference |', '|---|---|---|', ...rows.map(r => `| ${r.join(' | ')} |`));
console.log(report.join('\n'));
