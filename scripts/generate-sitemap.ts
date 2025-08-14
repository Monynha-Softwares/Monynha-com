import { readdirSync, writeFileSync } from 'fs';
import * as path from 'path';

const pagesDir = path.join(process.cwd(), 'src', 'pages');
const publicDir = path.join(process.cwd(), 'public');
const baseUrl = process.env.SITE_URL || 'https://monynha.com';

function getRoutes(dir: string): string[] {
  return readdirSync(dir)
    .filter((file) => {
      if (file === '__tests__') return false;
      if (!file.endsWith('.tsx') && !file.endsWith('.ts')) return false;
      return true;
    })
    .map((file) => path.basename(file, path.extname(file)))
    .filter((name) => name !== 'NotFound')
    .map((name) =>
      name.toLowerCase() === 'index' ? '/' : `/${name.toLowerCase()}`
    );
}

const routes = getRoutes(pagesDir);

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  routes
    .map((route) => `  <url><loc>${baseUrl}${route}</loc></url>`)
    .join('\n') +
  '\n</urlset>\n';

writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
console.log('Sitemap written to public/sitemap.xml');
