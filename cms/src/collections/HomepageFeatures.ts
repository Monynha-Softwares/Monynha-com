/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { pool } from '../utilities/pool';
import { resolveLocalizedText } from '../utilities/localization';

const ICON_OPTIONS = ['Brain', 'Zap', 'Shield', 'Users', 'Globe', 'Laptop'];

const normalizeUrl = (value: unknown): string | null => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  try {
    const parsed = new URL(value.trim());
    return parsed.toString();
  } catch {
    return null;
  }
};

const upsertIntoSupabase = async ({ doc, req }: { doc: any; req: any }) => {
  const supabaseId = doc.supabaseId ?? null;
  const title = resolveLocalizedText(doc.title);
  const description = resolveLocalizedText(doc.description);
  const icon = ICON_OPTIONS.includes(doc.icon) ? doc.icon : ICON_OPTIONS[0];
  const url = normalizeUrl(doc.url);
  const orderIndex = Number.parseInt(String(doc.orderIndex ?? '0'), 10);
  const active = !!doc.active;

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
    returning id`;

  const queryWithoutId = `
    insert into public.homepage_features (title, description, icon, url, order_index, active, updated_at)
    values ($1,$2,$3,$4,$5,$6, now())
    on conflict (title) do update set
      description=excluded.description,
      icon=excluded.icon,
      url=excluded.url,
      order_index=excluded.order_index,
      active=excluded.active,
      updated_at=now()
    returning id`;

  const paramsWithId = [
    supabaseId,
    title,
    description,
    icon,
    url,
    orderIndex,
    active,
  ];

  const paramsWithoutId = [title, description, icon, url, orderIndex, active];

  const result = supabaseId
    ? await pool.query(queryWithId, paramsWithId)
    : await pool.query(queryWithoutId, paramsWithoutId);

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
    {
      name: 'supabaseId',
      type: 'text',
      admin: { hidden: true },
    },
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'description', type: 'textarea', required: true, localized: true },
    {
      name: 'icon',
      type: 'select',
      required: true,
      defaultValue: ICON_OPTIONS[0],
      options: ICON_OPTIONS.map((option) => ({ label: option, value: option })),
    },
    {
      name: 'url',
      type: 'text',
      validate: (value: unknown) => {
        if (value === null || value === undefined || value === '') {
          return true;
        }

        if (!normalizeUrl(value)) {
          return 'Enter a valid URL or leave blank.';
        }

        return true;
      },
    },
    {
      name: 'orderIndex',
      type: 'number',
      required: true,
      admin: {
        step: 1,
        description: 'Controls the display order on the homepage.',
      },
      validate: (value: unknown) => {
        if (value === null || value === undefined || value === '') {
          return 'Provide an order number.';
        }

        const parsed = Number(value);
        if (!Number.isInteger(parsed) || parsed < 0) {
          return 'Order index must be a non-negative integer.';
        }

        return true;
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
