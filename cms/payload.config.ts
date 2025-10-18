import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import {
  Authors,
  Categories,
  HomepageFeatures,
  Leads,
  Media,
  NewsletterSubscribers,
  Posts,
  Repositories,
  SiteSettings,
  Solutions,
  TeamMembers,
  Users,
} from './src/collections';
import { supabaseAdminSyncEndpoint } from './src/endpoints/supabaseAdminSync';

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
    Users,
    Media,
    Posts,
    Authors,
    Categories,
    Solutions,
    Repositories,
    TeamMembers,
    HomepageFeatures,
    SiteSettings,
    NewsletterSubscribers,
    Leads,
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL!,
    },
    schemaName: 'public',
  }),
  endpoints: [supabaseAdminSyncEndpoint],
  typescript: { outputFile: path.resolve(__dirname, 'payload-types.ts') },
});
