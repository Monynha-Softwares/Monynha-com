/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { pool } from '../utilities/pool';
import { resolveLocalizedText, resolveOptionalLocalizedText } from '../utilities/localization';

const gradientOptions = [
  'from-brand-purple to-brand-blue',
  'from-brand-pink to-brand-orange',
  'from-brand-blue to-brand-purple',
  'from-brand-orange to-brand-pink',
];

const extractFeatureList = (features: any): string[] => {
  if (!Array.isArray(features)) {
    return [];
  }

  const values = features
    .map((feature) => {
      if (feature && typeof feature === 'object') {
        if ('content' in feature) {
          return resolveOptionalLocalizedText(feature.content);
        }

        if ('value' in feature) {
          return resolveOptionalLocalizedText(feature.value);
        }

        if ('label' in feature) {
          return resolveOptionalLocalizedText(feature.label);
        }
      }

      return resolveOptionalLocalizedText(feature);
    })
    .filter((item): item is string => Boolean(item && item.trim().length > 0));

  return values;
};

const upsertIntoSupabase = async ({ doc, req }: { doc: any; req: any }) => {
  const supabaseId = doc.supabaseId ?? null;
  const slug = doc.slug;
  const title = resolveLocalizedText(doc.title);
  const description = resolveLocalizedText(doc.description);
  const image_url = doc?.image?.url ?? null;
  const features = extractFeatureList(doc.features);
  const active = !!doc.active;

  const queryWithId = `
    insert into public.solutions (id, slug, title, description, image_url, features, active, updated_at)
    values ($1::uuid,$2,$3,$4,$5,$6::jsonb,$7, now())
    on conflict (id) do update set
      slug=excluded.slug,
      title=excluded.title,
      description=excluded.description,
      image_url=excluded.image_url,
      features=excluded.features,
      active=excluded.active,
      updated_at=now()
    returning id`;

  const queryWithoutId = `
    insert into public.solutions (slug, title, description, image_url, features, active, updated_at)
    values ($1,$2,$3,$4,$5::jsonb,$6, now())
    on conflict (slug) do update set
      title=excluded.title,
      description=excluded.description,
      image_url=excluded.image_url,
      features=excluded.features,
      active=excluded.active,
      updated_at=now()
    returning id`;

  const paramsWithId = [
    supabaseId,
    slug,
    title,
    description,
    image_url,
    JSON.stringify(features ?? []),
    active,
  ];

  const paramsWithoutId = [
    slug,
    title,
    description,
    image_url,
    JSON.stringify(features ?? []),
    active,
  ];

  const result = supabaseId
    ? await pool.query(queryWithId, paramsWithId)
    : await pool.query(queryWithoutId, paramsWithoutId);

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
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      validate: (value: unknown) => {
        if (typeof value !== 'string' || value.trim().length === 0) {
          return 'Slug is required.';
        }

        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
          return 'Use lowercase letters, numbers, and hyphens only.';
        }

        return true;
      },
    },
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'description', type: 'textarea', required: true, localized: true },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'features',
      type: 'array',
      labels: {
        singular: 'Feature',
        plural: 'Features',
      },
      fields: [
        {
          name: 'content',
          type: 'text',
          required: true,
          localized: true,
        },
      ],
    },
    {
      name: 'gradient',
      type: 'select',
      required: true,
      defaultValue: gradientOptions[0],
      options: gradientOptions.map((value) => ({ label: value, value })),
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  hooks: { afterChange: [upsertIntoSupabase] },
};

export default Solutions;
