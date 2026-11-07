import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const base = `/${(process.env.BASE_PATH || '').replace(/^\/+|\/+$/g, '')}`.replace(/\/$/, '');
const failures = [];
const pages = new Map();
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.name.endsWith('.html')) pages.set(full, await readFile(full, 'utf8'));
  }
}
try { await walk(root); } catch { console.error('Build output is missing. Run npm run build first.'); process.exit(1); }

const decode = text => text.replaceAll('&amp;', '&').replaceAll('&#39;', "'").replaceAll('&quot;', '"');
let checkedLinks = 0;
for (const [file, html] of pages) {
  const label = path.relative(root, file);
  if (!/<html[^>]*lang="zh-CN"/.test(html)) failures.push(`${label}: missing document language`);
  if (!/<title>[^<]+<\/title>/.test(html)) failures.push(`${label}: missing page title`);
  if ([...html.matchAll(/<h1(?:\s|>)/g)].length !== 1) failures.push(`${label}: expected one main heading`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => decode(match[1]));
  if (new Set(ids).size !== ids.length) failures.push(`${label}: duplicate IDs`);
  const pagePath = `${base}/${label.split(path.sep).join('/').replace(/index\.html$/, '')}`;
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const href = decode(match[1]);
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) continue;
    const target = new URL(href, `https://verify.invalid${pagePath}`);
    if (base && target.pathname !== base && !target.pathname.startsWith(`${base}/`)) {
      failures.push(`${label}: link escapes configured base: ${href}`); continue;
    }
    const relative = decodeURIComponent(target.pathname.slice(base.length)).replace(/^\/+/, '');
    let destination = path.join(root, relative);
    try {
      if ((await stat(destination)).isDirectory()) destination = path.join(destination, 'index.html');
      await stat(destination);
      if (target.hash && destination.endsWith('.html')) {
        const content = pages.get(destination) || await readFile(destination, 'utf8');
        const anchor = decodeURIComponent(target.hash.slice(1));
        const targetIds = [...content.matchAll(/\bid="([^"]+)"/g)].map(item => decode(item[1]));
        if (!targetIds.includes(anchor)) failures.push(`${label}: missing anchor ${href}`);
      }
      checkedLinks++;
    } catch { failures.push(`${label}: missing local target ${href}`); }
  }
}
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`Verified ${pages.size} static pages and ${checkedLinks} local links/assets, including heading anchors${base ? ` under ${base}/` : ''}.`);
