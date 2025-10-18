/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { pool } from '../utilities/pool';
import { resolveLocalizedText, resolveOptionalLocalizedText } from '../utilities/localization';
import { buildSpaPreviewUrl } from '../utilities/preview';
import { logCmsSyncEvent } from '../utilities/monitoring';

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
  const gradient = doc.gradient ?? null;

  const queryWithId = `
    insert into public.solutions (id, slug, title, description, image_url, features, gradient, active, updated_at)
    values ($1::uuid,$2,$3,$4,$5,$6::jsonb,$7,$8, now())
    on conflict (id) do update set
      slug=excluded.slug,
      title=excluded.title,
      description=excluded.description,
      image_url=excluded.image_url,
      features=excluded.features,
      gradient=excluded.gradient,
      active=excluded.active,
      updated_at=now()
    returning id`;

  const queryWithoutId = `
    insert into public.solutions (slug, title, description, image_url, features, gradient, active, updated_at)
    values ($1,$2,$3,$4,$5::jsonb,$6,$7, now())
    on conflict (slug) do update set
      title=excluded.title,
      description=excluded.description,
      image_url=excluded.image_url,
      features=excluded.features,
      gradient=excluded.gradient,
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
    gradient,
    active,
  ];

  const paramsWithoutId = [
    slug,
    title,
    description,
    image_url,
    JSON.stringify(features ?? []),
    gradient,
    active,
  ];

  try {
    const result = supabaseId
      ? await pool.query(queryWithId, paramsWithId)
      : await pool.query(queryWithoutId, paramsWithoutId);

    const generatedId = result?.rows?.[0]?.id ?? null;

    if (!supabaseId && generatedId && req?.payload) {
      await req.payload.update({
        collection: 'solutions',
        id: doc.id,
        data: { supabaseId: generatedId },
        depth: 0,
      });
    }

    await logCmsSyncEvent({
      collection: 'solutions',
      action: 'upsert',
      payloadId: doc.id ?? null,
      supabaseId: (supabaseId ?? generatedId) ?? null,
      status: 'success',
      metadata: { slug, hasImage: Boolean(image_url), featureCount: features.length },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error while syncing solution';
    await logCmsSyncEvent({
      collection: 'solutions',
      action: 'upsert',
      payloadId: doc.id ?? null,
      supabaseId,
      status: 'error',
      message,
      metadata: { slug },
    });
    throw error;
  }
};

const Solutions: CollectionConfig = {
  slug: 'solutions',
  admin: {
    useAsTitle: 'title',
    preview: (doc: any) =>
      buildSpaPreviewUrl(
        doc?.slug && typeof doc.slug === 'string'
          ? `/solutions/${doc.slug}`
          : '/solutions'
      ),
  },
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
