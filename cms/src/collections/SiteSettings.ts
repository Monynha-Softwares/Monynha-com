/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { pool, resolveNullableLocalizedText } from '../utils/supabase';

const normalizeJson = (value: unknown): string => {
  if (value === null || value === undefined) {
    return JSON.stringify({});
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed ?? {});
    } catch {
      return JSON.stringify(value);
    }
  }

  return JSON.stringify(value);
};

const upsertSiteSetting = async ({ doc, req }: { doc: any; req: any }) => {
  const supabaseId = doc.supabaseId ?? null;
  const key: string = doc.key;
  const value = normalizeJson(doc.value);
  const description = resolveNullableLocalizedText(doc.description);

  const params = [key, value, description];

  const queryWithId = `
    insert into public.site_settings (id, key, value, description, updated_at)
    values ($1::uuid,$2,$3::jsonb,$4, now())
    on conflict (id) do update set
      key=excluded.key,
      value=excluded.value,
      description=excluded.description,
      updated_at=now()
    returning id
  `;

  const queryWithoutId = `
    insert into public.site_settings (key, value, description, updated_at)
    values ($1,$2::jsonb,$3, now())
    on conflict (key) do update set
      value=excluded.value,
      description=excluded.description,
      updated_at=now()
    returning id
  `;

  const result = supabaseId
    ? await pool.query(queryWithId, [supabaseId, ...params])
    : await pool.query(queryWithoutId, params);

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
          return 'Key is required.';
        }
        return /^[a-z0-9_-]+$/.test(value)
          ? true
          : 'Use lowercase letters, numbers, underscores, or hyphens.';
      },
    },
    {
      name: 'value',
      type: 'json',
      required: true,
      admin: {
        description: 'Provide JSON that matches the structure expected by the frontend.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
  ],
  hooks: { afterChange: [upsertSiteSetting] },
};

export default SiteSettings;
