/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { pool, resolveLocalizedText, resolveStringArray } from '../utils/supabase';

const upsertRepository = async ({ doc, req }: { doc: any; req: any }) => {
  const supabaseId = doc.supabaseId ?? null;
  const name = resolveLocalizedText(doc.name);
  const description = resolveLocalizedText(doc.description);
  const githubUrl: string = doc.githubUrl;
  const demoUrl: string | null = doc.demoUrl?.trim() ? doc.demoUrl.trim() : null;
  const tags = resolveStringArray(doc.tags ?? [], 'value');
  const active = Boolean(doc.active ?? true);

  const params = [name, description, githubUrl, demoUrl, tags, active];

  const queryWithId = `
    insert into public.repositories (id, name, description, github_url, demo_url, tags, active, updated_at)
    values ($1::uuid,$2,$3,$4,$5,$6::text[],$7, now())
    on conflict (id) do update set
      name=excluded.name,
      description=excluded.description,
      github_url=excluded.github_url,
      demo_url=excluded.demo_url,
      tags=excluded.tags,
      active=excluded.active,
      updated_at=now()
    returning id
  `;

  const queryWithoutId = `
    insert into public.repositories (name, description, github_url, demo_url, tags, active, updated_at)
    values ($1,$2,$3,$4,$5::text[],$6, now())
    on conflict (github_url) do update set
      name=excluded.name,
      description=excluded.description,
      demo_url=excluded.demo_url,
      tags=excluded.tags,
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
      collection: 'repositories',
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

const optionalUrlValidator = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return true;
  }
  return urlValidator(value);
};

const Repositories: CollectionConfig = {
  slug: 'repositories',
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true,
    create: ({ req }: { req: any }) => Boolean(req.user),
    update: ({ req }: { req: any }) => Boolean(req.user),
    delete: ({ req }: { req: any }) => Boolean(req.user),
  },
  fields: [
    { name: 'supabaseId', type: 'text', admin: { hidden: true } },
    { name: 'name', type: 'text', required: true, localized: true },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'githubUrl',
      type: 'text',
      required: true,
      label: 'GitHub URL',
      validate: urlValidator,
    },
    {
      name: 'demoUrl',
      type: 'text',
      required: false,
      label: 'Live Demo URL',
      validate: optionalUrlValidator,
    },
    {
      name: 'tags',
      type: 'array',
      labels: {
        singular: 'Tag',
        plural: 'Tags',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
    },
    { name: 'active', type: 'checkbox', defaultValue: true },
  ],
  hooks: { afterChange: [upsertRepository] },
};

export default Repositories;
