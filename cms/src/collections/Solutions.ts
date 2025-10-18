/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { pool, resolveLocalizedText, resolveStringArray } from '../utils/supabase';

const gradientOptions = [
  'from-brand-purple to-brand-blue',
  'from-brand-pink to-brand-orange',
  'from-brand-blue to-brand-purple',
  'from-brand-orange to-brand-pink',
];

const upsertSolution = async ({ doc, req }: { doc: any; req: any }) => {
  const supabaseId = doc.supabaseId ?? null;
  const slug: string = doc.slug;
  const active = Boolean(doc.active ?? true);
  const title = resolveLocalizedText(doc.title);
  const description = resolveLocalizedText(doc.description);
  const features = resolveStringArray(doc.features ?? []);
  const imageUrl =
    doc.imageUrl ?? doc?.image?.url ?? (typeof doc.image === 'string' ? null : null);
  const params = [slug, title, description, JSON.stringify(features), imageUrl, active];

  const queryWithId = `
    insert into public.solutions (id, slug, title, description, features, image_url, active, updated_at)
    values ($1::uuid,$2,$3,$4,$5::jsonb,$6,$7, now())
    on conflict (id) do update set
      slug=excluded.slug,
      title=excluded.title,
      description=excluded.description,
      features=excluded.features,
      image_url=excluded.image_url,
      active=excluded.active,
      updated_at=now()
    returning id
  `;

  const queryWithoutId = `
    insert into public.solutions (slug, title, description, features, image_url, active, updated_at)
    values ($1,$2,$3,$4::jsonb,$5,$6, now())
    on conflict (slug) do update set
      title=excluded.title,
      description=excluded.description,
      features=excluded.features,
      image_url=excluded.image_url,
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
      collection: 'solutions',
      id: doc.id,
      data: { supabaseId: generatedId },
      depth: 0,
    });
  }
};

const Solutions: CollectionConfig = {
  slug: 'solutions',
  admin: { useAsTitle: 'slug' },
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
      validate: (value: unknown) => {
        if (typeof value !== 'string' || value.trim().length === 0) {
          return 'Slug is required.';
        }
        return /^[a-z0-9-]+$/.test(value)
          ? true
          : 'Use lowercase letters, numbers, and hyphens.';
      },
    },
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'features',
      type: 'array',
      minRows: 1,
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
      name: 'imageUrl',
      type: 'text',
      required: false,
      admin: { description: 'Optional direct image URL.' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    { name: 'active', type: 'checkbox', defaultValue: true },
  ],
  hooks: { afterChange: [upsertSolution] },
};

export default Solutions;
