import { readdirSync, writeFileSync } from 'fs';
import * as path from 'path';

const pagesDir = path.join(process.cwd(), 'src', 'pages');
const publicDir = path.join(process.cwd(), 'public');
const baseUrl = process.env.SITE_URL || 'https://monynha.com';

const IGNORE_DIRECTORIES = new Set(['__tests__']);
const IGNORE_FILES = new Set(['NotFound', 'Dashboard']);

function collectRoutes(dir: string, segments: string[] = []): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const routes = new Set<string>();

  for (const entry of entries) {
    if (IGNORE_DIRECTORIES.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name.startsWith('[')) continue;

      const nextSegments = [...segments, entry.name.toLowerCase()];
      collectRoutes(fullPath, nextSegments)
        .filter(Boolean)
        .forEach((route) => routes.add(route));
      continue;
    }

    if (!entry.name.endsWith('.tsx') && !entry.name.endsWith('.ts')) {
      continue;
    }

    const name = path.basename(entry.name, path.extname(entry.name));
    if (IGNORE_FILES.has(name) || name.startsWith('[') || name.startsWith('_')) {
      continue;
    }

    const routeSegments =
      name.toLowerCase() === 'index'
        ? segments
        : [...segments, name.toLowerCase()];

    const normalized = path.posix.join('/', ...routeSegments);
    const routePath = normalized === '' ? '/' : normalized;

    routes.add(routePath);
  }

  return Array.from(routes);
}

const routes = collectRoutes(pagesDir)
  .map((route) => (route.endsWith('/') && route !== '/' ? route.slice(0, -1) : route))
  .sort((a, b) => (a === '/' ? -1 : a.localeCompare(b)));

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  routes
    .map((route) => `  <url><loc>${baseUrl}${route}</loc></url>`)
    .join('\n') +
  '\n</urlset>\n';

writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
console.log('Sitemap written to public/sitemap.xml');
