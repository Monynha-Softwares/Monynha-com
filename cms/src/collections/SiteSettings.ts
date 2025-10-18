/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { pool } from '../utilities/supabasePool';
import { getLocalizedOptionalString } from '../utilities/localization';

const upsertSiteSetting = async ({ doc, req }: { doc: any; req: any }) => {
  const supabaseId = doc.supabaseId ?? null;
  const key = doc.key;
  const value = doc.value ?? {};
  const description = getLocalizedOptionalString(doc.description) ?? null;

  const queryWithId = `
    insert into public.site_settings (id, key, value, description)
    values ($1::uuid,$2,$3::jsonb,$4)
    on conflict (id) do update set
      key=excluded.key,
      value=excluded.value,
      description=excluded.description,
      updated_at=now()
    returning id`;

  const queryWithoutId = `
    insert into public.site_settings (key, value, description)
    values ($1,$2::jsonb,$3)
    on conflict (key) do update set
      value=excluded.value,
      description=excluded.description,
      updated_at=now()
    returning id`;

  const result = supabaseId
    ? await pool.query(queryWithId, [supabaseId, key, JSON.stringify(value), description])
    : await pool.query(queryWithoutId, [key, JSON.stringify(value), description]);

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
  admin: { useAsTitle: 'key', defaultColumns: ['key'] },
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
      validate: (value: string | undefined | null) => {
        if (!value) return 'A chave é obrigatória';
        return /^[a-z0-9_.-]+$/.test(value)
          ? true
          : 'Use apenas letras minúsculas, números, ponto, hífen e sublinhado';
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
  hooks: { afterChange: [upsertSiteSetting] },
};

export default SiteSettings;
