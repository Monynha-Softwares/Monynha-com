import { readdirSync, writeFileSync } from 'fs';
import * as path from 'path';

import { fallbackSolutions } from '../src/data/solutions';

const pagesDir = path.join(process.cwd(), 'src', 'pages');
const publicDir = path.join(process.cwd(), 'public');
const baseUrl = process.env.SITE_URL || 'https://monynha.com';

const isPageFile = (file: string) =>
  (file.endsWith('.tsx') || file.endsWith('.ts')) && !file.endsWith('.d.ts');

const normalizeSegment = (segment: string) =>
  segment
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w-]+/g, '-')
    .replace(/--+/g, '-')
    .toLowerCase();

function collectRoutes(dir: string, relativePath = ''): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const routes: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('__tests__')) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    const nextRelative = relativePath
      ? path.join(relativePath, entry.name)
      : entry.name;

    if (entry.isDirectory()) {
      routes.push(...collectRoutes(fullPath, nextRelative));
      continue;
    }

    if (!isPageFile(entry.name)) {
      continue;
    }

    const segmentName = path.basename(entry.name, path.extname(entry.name));

    if (segmentName === 'NotFound' || segmentName.startsWith('[')) {
      continue;
    }

    const segments: string[] = [];

    if (relativePath) {
      const relativeSegments = relativePath
        .split(path.sep)
        .filter(Boolean)
        .map((segment) => normalizeSegment(segment.replace(/\.[^/.]+$/, '')))
        .filter((segment) => segment !== 'index');

      segments.push(...relativeSegments);
    }

    if (segmentName.toLowerCase() !== 'index') {
      segments.push(normalizeSegment(segmentName));
    }

    const route = `/${segments.filter(Boolean).join('/')}`.replace(/\/+/g, '/');
    routes.push(route === '/' ? '/' : route.replace(/\/$/, ''));
  }

  return routes;
}

const staticRoutes = collectRoutes(pagesDir);

const dynamicRoutes = fallbackSolutions.map(
  (solution) => `/solutions/${normalizeSegment(solution.slug)}`
);

const routes = Array.from(new Set([...staticRoutes, ...dynamicRoutes])).sort();

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  routes
    .map((route) => `  <url><loc>${baseUrl}${route}</loc></url>`)
    .join('\n') +
  '\n</urlset>\n';

writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
console.log('Sitemap written to public/sitemap.xml');
