/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const upsertIntoPublic = async ({ doc }: { doc: any }) => {
  const id = String(doc.id);
  const slug = doc.slug;
  const published = !!doc.published;
  const title =
    typeof doc.title === 'object'
      ? (doc.title['pt-BR'] ?? doc.title['en'] ?? '')
      : doc.title;
  const excerpt =
    typeof doc.excerpt === 'object'
      ? (doc.excerpt['pt-BR'] ?? doc.excerpt['en'] ?? null)
      : (doc.excerpt ?? null);
  const image_url = doc?.coverImage?.url ?? null;
  const content =
    typeof doc.content === 'string'
      ? doc.content
      : JSON.stringify(doc.content ?? {});

  await pool.query(
    `insert into public.blog_posts (id, slug, title, excerpt, image_url, content, published, updated_at)
     values ($1,$2,$3,$4,$5,$6,$7, now())
     on conflict (id) do update set
       slug=excluded.slug,
       title=excluded.title,
       excerpt=excluded.excerpt,
       image_url=excluded.image_url,
       content=excluded.content,
       published=excluded.published,
       updated_at=now()`,
    [id, slug, title, excerpt, image_url, content, published]
  );
};

const Posts: CollectionConfig = {
  slug: 'posts',
  admin: { useAsTitle: 'slug' },
  access: {
    read: () => true,
    create: ({ req }: { req: any }) => Boolean(req.user),
    update: ({ req }: { req: any }) => Boolean(req.user),
    delete: ({ req }: { req: any }) => Boolean(req.user),
  },
  fields: [
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'excerpt', type: 'textarea', localized: true },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      editor: lexicalEditor(),
    },
    { name: 'published', type: 'checkbox', defaultValue: false },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
  ],
  hooks: { afterChange: [upsertIntoPublic] },
};

export default Posts;
