import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import Posts from './src/collections/Posts';
import Users from './src/collections/Users';
import Media from './src/collections/Media';
import Solutions from './src/collections/Solutions';
import Repositories from './src/collections/Repositories';
import TeamMembers from './src/collections/TeamMembers';
import HomepageFeatures from './src/collections/HomepageFeatures';
import SiteSettings from './src/collections/SiteSettings';
import NewsletterSubscribers from './src/collections/NewsletterSubscribers';
import Leads from './src/collections/Leads';
import Authors from './src/collections/Authors';
import Categories from './src/collections/Categories';

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET!,
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  admin: { user: 'users', meta: { titleSuffix: ' · Monynha CMS' } },
  localization: {
    locales: ['pt-BR', 'en'],
    defaultLocale: 'pt-BR',
    fallback: true,
  },
  collections: [
    Posts,
    Users,
    Media,
    Solutions,
    Repositories,
    TeamMembers,
    HomepageFeatures,
    SiteSettings,
    NewsletterSubscribers,
    Leads,
    Authors,
    Categories,
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL!,
    },
    schemaName: 'public',
  }),
  typescript: { outputFile: path.resolve(__dirname, 'payload-types.ts') },
});
