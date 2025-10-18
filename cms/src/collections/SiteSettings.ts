/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { pool, resolveLocalizedNullableString } from '../utils/supabase';

const keyPattern = /^[a-z0-9_-]+$/;

const upsertIntoSupabase = async ({ doc, req }: { doc: any; req: any }) => {
  const supabaseId = doc.supabaseId ?? null;
  const key: string = doc.key;
  const description = resolveLocalizedNullableString(doc.description);
  const value = doc.value ?? {};

  const serializedValue = JSON.stringify(value);

  const queryWithId = `
    insert into public.site_settings (id, key, value, description, updated_at)
    values ($1::uuid,$2,$3::jsonb,$4,$5)
    on conflict (id) do update set
      key=excluded.key,
      value=excluded.value,
      description=excluded.description,
      updated_at=excluded.updated_at
    returning id`;

  const queryWithoutId = `
    insert into public.site_settings (key, value, description, updated_at)
    values ($1,$2::jsonb,$3,$4)
    on conflict (key) do update set
      value=excluded.value,
      description=excluded.description,
      updated_at=excluded.updated_at
    returning id`;

  const now = new Date().toISOString();

  const result = supabaseId
    ? await pool.query(queryWithId, [supabaseId, key, serializedValue, description, now])
    : await pool.query(queryWithoutId, [key, serializedValue, description, now]);

  const generatedId = result?.rows?.[0]?.id;

  if (!supabaseId && generatedId && req?.payload) {
    await req.payload.update({
      collection: 'siteSettings',
      id: doc.id,
      data: { supabaseId: generatedId },
      depth: 0,
    });
  }
};

const SiteSettings: CollectionConfig = {
  slug: 'siteSettings',
  admin: { useAsTitle: 'key' },
  access: {
    read: () => true,
    create: ({ req }: { req: any }) => Boolean(req.user),
    update: ({ req }: { req: any }) => Boolean(req.user),
    delete: ({ req }: { req: any }) => Boolean(req.user),
  },
  fields: [
    { name: 'supabaseId', type: 'text', admin: { hidden: true } },
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      validate: (value: unknown) => {
        if (typeof value !== 'string' || value.trim().length === 0) {
          return 'Key is required';
        }
        if (!keyPattern.test(value)) {
          return 'Use lowercase letters, numbers, dashes, or underscores';
        }
        return true;
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'value',
      type: 'json',
      required: true,
    },
  ],
  hooks: { afterChange: [upsertIntoSupabase] },
};

export default SiteSettings;
