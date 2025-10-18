/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { pool, resolveLocalizedString } from '../utils/supabase';

const iconOptions = ['Brain', 'Zap', 'Shield', 'Users', 'Globe', 'Laptop'];

const isValidUrl = (value: unknown): boolean => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return false;
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const upsertIntoSupabase = async ({ doc, req }: { doc: any; req: any }) => {
  const supabaseId = doc.supabaseId ?? null;
  const title = resolveLocalizedString(doc.title, '');
  const description = resolveLocalizedString(doc.description, '');
  const icon: string = iconOptions.includes(doc.icon) ? doc.icon : iconOptions[0];
  const orderIndex = typeof doc.orderIndex === 'number' ? doc.orderIndex : 0;
  const url = typeof doc.url === 'string' ? doc.url : null;
  const active = doc.active !== false;

  const queryWithId = `
    insert into public.homepage_features (id, title, description, icon, order_index, url, active, updated_at)
    values ($1::uuid,$2,$3,$4,$5,$6,$7, now())
    on conflict (id) do update set
      title=excluded.title,
      description=excluded.description,
      icon=excluded.icon,
      order_index=excluded.order_index,
      url=excluded.url,
      active=excluded.active,
      updated_at=now()
    returning id`;

  const queryWithoutId = `
    insert into public.homepage_features (title, description, icon, order_index, url, active, updated_at)
    values ($1,$2,$3,$4,$5,$6, now())
    returning id`;

  const result = supabaseId
    ? await pool.query(queryWithId, [supabaseId, title, description, icon, orderIndex, url, active])
    : await pool.query(queryWithoutId, [title, description, icon, orderIndex, url, active]);

  const generatedId = result?.rows?.[0]?.id;

  if (!supabaseId && generatedId && req?.payload) {
    await req.payload.update({
      collection: 'homepageFeatures',
      id: doc.id,
      data: { supabaseId: generatedId },
      depth: 0,
    });
  }
};

const HomepageFeatures: CollectionConfig = {
  slug: 'homepageFeatures',
  admin: { useAsTitle: 'title' },
  access: {
    read: () => true,
    create: ({ req }: { req: any }) => Boolean(req.user),
    update: ({ req }: { req: any }) => Boolean(req.user),
    delete: ({ req }: { req: any }) => Boolean(req.user),
  },
  fields: [
    { name: 'supabaseId', type: 'text', admin: { hidden: true } },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'icon',
      type: 'select',
      defaultValue: iconOptions[0],
      options: iconOptions.map((value) => ({ label: value, value })),
      required: true,
    },
    {
      name: 'orderIndex',
      label: 'Order Index',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'url',
      label: 'Target URL',
      type: 'text',
      required: false,
      validate: (value: unknown) => {
        if (!value) {
          return true;
        }
        return isValidUrl(value)
          ? true
          : 'Please provide a valid URL (including https://)';
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  hooks: { afterChange: [upsertIntoSupabase] },
};

export default HomepageFeatures;
