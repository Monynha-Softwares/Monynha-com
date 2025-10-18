/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { pool, resolveLocalizedText } from '../utils/supabase';

const icons = ['Brain', 'Zap', 'Shield', 'Users', 'Globe', 'Laptop'] as const;

type Icon = (typeof icons)[number];

const upsertFeature = async ({ doc, req }: { doc: any; req: any }) => {
  const supabaseId = doc.supabaseId ?? null;
  const title = resolveLocalizedText(doc.title);
  const description = resolveLocalizedText(doc.description);
  const icon: Icon = doc.icon ?? 'Brain';
  const url: string = doc.url?.trim() ?? '#';
  const orderIndex = Number.isFinite(doc.orderIndex) ? doc.orderIndex : Number(doc.orderIndex ?? 0);
  const active = Boolean(doc.active ?? true);

  const params = [title, description, icon, url, orderIndex, active];

  const queryWithId = `
    insert into public.homepage_features (id, title, description, icon, url, order_index, active, updated_at)
    values ($1::uuid,$2,$3,$4,$5,$6,$7, now())
    on conflict (id) do update set
      title=excluded.title,
      description=excluded.description,
      icon=excluded.icon,
      url=excluded.url,
      order_index=excluded.order_index,
      active=excluded.active,
      updated_at=now()
    returning id
  `;

  const queryWithoutId = `
    insert into public.homepage_features (title, description, icon, url, order_index, active, updated_at)
    values ($1,$2,$3,$4,$5,$6, now())
    on conflict (order_index) do update set
      title=excluded.title,
      description=excluded.description,
      icon=excluded.icon,
      url=excluded.url,
      active=excluded.active,
      updated_at=now()
    returning id
  `;

  const result = supabaseId
    ? await pool.query(queryWithId, [supabaseId, ...params])
    : await pool.query(queryWithoutId, params);

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

const urlValidator = (value: unknown) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return 'URL is required.';
  }
  try {
    new URL(value);
    return true;
  } catch {
    return 'Provide a valid URL including protocol (https://).';
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
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'icon',
      type: 'select',
      required: true,
      defaultValue: icons[0],
      options: icons.map((value) => ({ label: value, value })),
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      defaultValue: '#',
      validate: urlValidator,
    },
    {
      name: 'orderIndex',
      type: 'number',
      required: true,
      admin: { description: 'Controls homepage ordering (ascending).' },
    },
    { name: 'active', type: 'checkbox', defaultValue: true },
  ],
  hooks: { afterChange: [upsertFeature] },
};

export default HomepageFeatures;
