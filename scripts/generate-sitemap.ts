import { readdirSync, writeFileSync } from 'fs';
import * as path from 'path';

const pagesDir = path.join(process.cwd(), 'src', 'pages');
const publicDir = path.join(process.cwd(), 'public');
const baseUrl = process.env.SITE_URL || 'https://monynha.com';
const ignoredRoutes = new Set(['dashboard']);

function formatSegment(segment: string): string {
  if (/^index$/i.test(segment)) {
    return '';
  }

  return segment
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
    .toLowerCase();
}

function getRoutes(dir: string, segments: string[] = []): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const routes: string[] = [];

  for (const entry of entries) {
    if (entry.name === '__tests__') {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      routes.push(...getRoutes(fullPath, [...segments, entry.name]));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = path.extname(entry.name);
    if (extension !== '.tsx' && extension !== '.ts') {
      continue;
    }

    const fileName = path.basename(entry.name, extension);

    if (fileName === 'NotFound' || fileName.startsWith('[')) {
      continue;
    }

    const cleanedSegments = [...segments, fileName]
      .map(formatSegment)
      .filter(Boolean);

    const routeKey = cleanedSegments.join('/');
    if (routeKey && ignoredRoutes.has(routeKey)) {
      continue;
    }

    const routePath = `/${routeKey}`;
    const normalizedRoute = routePath
      .replace(/\\/g, '/')
      .replace(new RegExp('/{2,}', 'g'), '/');
    routes.push(normalizedRoute === '/' ? '/' : normalizedRoute);
  }

  return [...new Set(routes)];
}

const routes = getRoutes(pagesDir).sort((a, b) => a.localeCompare(b));
const lastMod = new Date().toISOString();

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  routes
    .map(
      (route) =>
        `  <url><loc>${baseUrl}${route}</loc><lastmod>${lastMod}</lastmod></url>`
    )
    .join('\n') +
  '\n</urlset>\n';

writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
console.log('Sitemap written to public/sitemap.xml');
