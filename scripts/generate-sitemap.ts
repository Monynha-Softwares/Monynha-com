import { readdirSync, statSync, writeFileSync } from 'fs';
import * as path from 'path';
import { fallbackSolutions } from '../src/data/solutions';

const pagesDir = path.join(process.cwd(), 'src', 'pages');
const publicDir = path.join(process.cwd(), 'public');
const baseUrl = process.env.SITE_URL || 'https://monynha.com';

const normalizeRoute = (value: string): string => {
  const replaced = value.replace(/\/+/g, '/');
  if (replaced === '') {
    return '/';
  }

  return replaced.startsWith('/') ? replaced : `/${replaced}`;
};

const isPageFile = (file: string): boolean =>
  file.endsWith('.tsx') || file.endsWith('.ts');

const collectRoutes = (directory: string, routePrefix = ''): string[] => {
  const entries = readdirSync(directory);
  const routes: string[] = [];

  for (const entry of entries) {
    if (entry.startsWith('_') || entry === '__tests__') {
      continue;
    }

    const fullPath = path.join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      const nextPrefix = routePrefix ? `${routePrefix}/${entry}` : `/${entry}`;
      routes.push(...collectRoutes(fullPath, nextPrefix));
      continue;
    }

    if (!isPageFile(entry)) {
      continue;
    }

    const baseName = path.basename(entry, path.extname(entry));
    if (baseName === 'NotFound') {
      continue;
    }

    if (baseName.startsWith('[')) {
      // Dynamic routes are handled separately via data-driven lists
      continue;
    }

    const lowerName = baseName.toLowerCase();
    if (lowerName === 'index') {
      const route = routePrefix || '/';
      routes.push(normalizeRoute(route));
    } else {
      const prefix = routePrefix || '';
      routes.push(normalizeRoute(`${prefix}/${lowerName}`));
    }
  }

  return routes;
};

const staticRoutes = collectRoutes(pagesDir);

const solutionRoutes = fallbackSolutions
  .map((solution) => solution.slug)
  .filter((slug): slug is string => Boolean(slug))
  .map((slug) => normalizeRoute(`/solutions/${slug}`));

const routes = Array.from(new Set([...staticRoutes, ...solutionRoutes])).sort();

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  routes
    .map((route) => `  <url><loc>${baseUrl}${route}</loc></url>`)
    .join('\n') +
  '\n</urlset>\n';

writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
console.log(`Sitemap written to public/sitemap.xml with ${routes.length} routes.`);
