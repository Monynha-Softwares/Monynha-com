/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { pool } from '../utilities/supabasePool';
import { getLocalizedRequiredString } from '../utilities/localization';
import { extractFeatureList } from '../utilities/features';

const GRADIENT_OPTIONS = [
  'from-brand-purple to-brand-blue',
  'from-brand-pink to-brand-orange',
  'from-brand-blue to-brand-purple',
  'from-brand-orange to-brand-pink',
];

const upsertSolution = async ({ doc, req }: { doc: any; req: any }) => {
  const supabaseId = doc.supabaseId ?? null;
  const slug = doc.slug;
  const title = getLocalizedRequiredString(doc.title);
  const description = getLocalizedRequiredString(doc.description);
  const features = extractFeatureList(doc.features);
  const image_url = doc?.image?.url ?? null;
  const active = !!doc.active;

  const queryWithId = `
    insert into public.solutions (id, title, description, slug, image_url, features, active, updated_at)
    values ($1::uuid,$2,$3,$4,$5,$6::jsonb,$7, now())
    on conflict (id) do update set
      title=excluded.title,
      description=excluded.description,
      slug=excluded.slug,
      image_url=excluded.image_url,
      features=excluded.features,
      active=excluded.active,
      updated_at=now()
    returning id`;

  const queryWithoutId = `
    insert into public.solutions (title, description, slug, image_url, features, active, updated_at)
    values ($1,$2,$3,$4,$5::jsonb,$6, now())
    on conflict (slug) do update set
      title=excluded.title,
      description=excluded.description,
      image_url=excluded.image_url,
      features=excluded.features,
      active=excluded.active,
      updated_at=now()
    returning id`;

  const result = supabaseId
    ? await pool.query(queryWithId, [supabaseId, title, description, slug, image_url, JSON.stringify(features), active])
    : await pool.query(queryWithoutId, [title, description, slug, image_url, JSON.stringify(features), active]);

  const generatedId = result?.rows?.[0]?.id;

  if (!supabaseId && generatedId && req?.payload) {
    await req.payload.update({
      collection: 'solutions',
      id: doc.id,
      data: { supabaseId: generatedId },
      depth: 0,
    });
  }
};

const Solutions: CollectionConfig = {
  slug: 'solutions',
  admin: { useAsTitle: 'slug', defaultColumns: ['slug', 'active'] },
  access: {
    read: () => true,
    create: ({ req }: { req: any }) => Boolean(req.user),
    update: ({ req }: { req: any }) => Boolean(req.user),
    delete: ({ req }: { req: any }) => Boolean(req.user),
  },
  fields: [
    { name: 'supabaseId', type: 'text', admin: { hidden: true } },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      validate: (value: string | undefined | null) => {
        if (!value) return 'Slug é obrigatório';
        return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
          ? true
          : 'Use apenas letras minúsculas, números e hífens';
      },
    },
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'description', type: 'textarea', required: true, localized: true },
    {
      name: 'gradient',
      type: 'select',
      required: true,
      options: GRADIENT_OPTIONS.map((value) => ({ label: value, value })),
      defaultValue: GRADIENT_OPTIONS[0],
    },
    {
      name: 'features',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
          localized: true,
          label: 'Feature',
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    { name: 'active', type: 'checkbox', defaultValue: true },
  ],
  hooks: { afterChange: [upsertSolution] },
};

export default Solutions;
