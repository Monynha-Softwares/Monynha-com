/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { pool } from '../utilities/supabasePool';
import { getLocalizedRequiredString } from '../utilities/localization';

const ICON_OPTIONS = ['Brain', 'Zap', 'Shield', 'Users', 'Globe', 'Laptop'];

const upsertHomepageFeature = async ({ doc, req }: { doc: any; req: any }) => {
  const supabaseId = doc.supabaseId ?? null;
  const title = getLocalizedRequiredString(doc.title);
  const description = getLocalizedRequiredString(doc.description);
  const icon = ICON_OPTIONS.includes(doc.icon) ? doc.icon : ICON_OPTIONS[0];
  const url = doc.url ?? null;
  const order_index = Number(doc.orderIndex) || 0;
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
    returning id`;

  const result = supabaseId
    ? await pool.query(queryWithId, [supabaseId, title, description, icon, url, order_index, active])
    : await pool.query(queryWithoutId, [title, description, icon, url, order_index, active]);

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
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'icon', 'orderIndex', 'active'] },
  access: {
    read: () => true,
    create: ({ req }: { req: any }) => Boolean(req.user),
    update: ({ req }: { req: any }) => Boolean(req.user),
    delete: ({ req }: { req: any }) => Boolean(req.user),
  },
  fields: [
    { name: 'supabaseId', type: 'text', admin: { hidden: true } },
    { name: 'title', type: 'text', localized: true, required: true },
    { name: 'description', type: 'textarea', localized: true, required: true },
    {
      name: 'icon',
      type: 'select',
      required: true,
      options: ICON_OPTIONS.map((value) => ({ label: value, value })),
      defaultValue: ICON_OPTIONS[0],
    },
    {
      name: 'url',
      type: 'text',
      admin: { description: 'Link opcional exibido no CTA' },
      validate: (value: string | undefined | null) => {
        if (!value) return true;
        try {
          const parsed = new URL(value);
          return parsed.protocol.startsWith('http') ? true : 'Informe uma URL válida';
        } catch {
          return 'Informe uma URL válida';
        }
      },
    },
    {
      name: 'orderIndex',
      label: 'Ordem',
      type: 'number',
      required: true,
      min: 0,
    },
    { name: 'active', type: 'checkbox', defaultValue: true },
  ],
  hooks: { afterChange: [upsertHomepageFeature] },
};

export default HomepageFeatures;
