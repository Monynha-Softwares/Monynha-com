/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { pool, resolveLocalizedString } from '../utils/supabase';

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
  const name = resolveLocalizedString(doc.name, '');
  const description = resolveLocalizedString(doc.description, '');
  const githubUrl: string | null = doc.githubUrl ?? null;
  const demoUrl: string | null = doc.demoUrl ?? null;
  const tags: string[] = Array.isArray(doc.tags)
    ? doc.tags
        .map((tag: unknown) => {
          if (typeof tag === 'string') {
            return tag.trim();
          }

          if (tag && typeof tag === 'object' && 'value' in (tag as Record<string, unknown>)) {
            const raw = (tag as Record<string, unknown>).value;
            return typeof raw === 'string' ? raw.trim() : null;
          }

          return null;
        })
        .filter((tag: string | null): tag is string => Boolean(tag))
    : [];
  const active = doc.active !== false;

  const queryWithId = `
    insert into public.repositories (id, name, description, github_url, demo_url, tags, active, updated_at)
    values ($1::uuid,$2,$3,$4,$5,$6,$7, now())
    on conflict (id) do update set
      name=excluded.name,
      description=excluded.description,
      github_url=excluded.github_url,
      demo_url=excluded.demo_url,
      tags=excluded.tags,
      active=excluded.active,
      updated_at=now()
    returning id`;

  const queryWithoutId = `
    insert into public.repositories (name, description, github_url, demo_url, tags, active, updated_at)
    values ($1,$2,$3,$4,$5,$6, now())
    returning id`;

  const result = supabaseId
    ? await pool.query(queryWithId, [supabaseId, name, description, githubUrl, demoUrl, tags, active])
    : await pool.query(queryWithoutId, [name, description, githubUrl, demoUrl, tags, active]);

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
    {
      name: 'name',
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
      name: 'githubUrl',
      label: 'GitHub URL',
      type: 'text',
      required: true,
      validate: (value: unknown) =>
        isValidUrl(value) ? true : 'Please enter a valid GitHub repository URL',
    },
    {
      name: 'demoUrl',
      label: 'Demo URL',
      type: 'text',
      required: false,
      validate: (value: unknown) => {
        if (!value) {
          return true;
        }
        return isValidUrl(value) ? true : 'Please enter a valid URL';
      },
    },
    {
      name: 'tags',
      type: 'array',
      labels: { singular: 'Tag', plural: 'Tags' },
      fields: [
        {
          name: 'value',
          label: 'Tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  hooks: { afterChange: [upsertIntoSupabase] },
};

export default Repositories;
