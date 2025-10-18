/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { pool } from '../utilities/pool';
import { resolveLocalizedText } from '../utilities/localization';
import { buildSpaPreviewUrl } from '../utilities/preview';

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

const extractTags = (tags: any): string[] => {
  if (!Array.isArray(tags)) {
    return [];
  }

  const unique = new Set<string>();

  for (const tag of tags) {
    let value: string | null = null;

    if (tag && typeof tag === 'object') {
      if ('label' in tag) {
        value = resolveLocalizedText(tag.label).trim();
      } else if ('value' in tag) {
        value = resolveLocalizedText(tag.value).trim();
      } else if ('tag' in tag) {
        value = resolveLocalizedText(tag.tag).trim();
      }
    } else if (typeof tag === 'string') {
      value = tag.trim();
    }

    if (value && value.length > 0) {
      unique.add(value);
    }
  }

  return Array.from(unique);
};

const upsertIntoSupabase = async ({ doc, req }: { doc: any; req: any }) => {
  const supabaseId = doc.supabaseId ?? null;
  const name = resolveLocalizedText(doc.name);
  const description = resolveLocalizedText(doc.description);
  const github_url = normalizeUrl(doc.githubUrl);
  const demo_url = normalizeUrl(doc.demoUrl);
  const tags = extractTags(doc.tags);
  const active = !!doc.active;

  if (!github_url) {
    throw new Error('A valid GitHub URL is required for repositories.');
  }

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

  const paramsWithId = [supabaseId, name, description, github_url, demo_url, tags, active];
  const paramsWithoutId = [name, description, github_url, demo_url, tags, active];

  const result = supabaseId
    ? await pool.query(queryWithId, paramsWithId)
    : await pool.query(queryWithoutId, paramsWithoutId);

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
  admin: {
    useAsTitle: 'name',
    preview: () => buildSpaPreviewUrl('/projects'),
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
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'description', type: 'textarea', required: true, localized: true },
    {
      name: 'githubUrl',
      type: 'text',
      required: true,
      unique: true,
      validate: (value: unknown) => {
        if (!normalizeUrl(value)) {
          return 'Enter a valid GitHub repository URL.';
        }

        return true;
      },
    },
    {
      name: 'demoUrl',
      type: 'text',
      validate: (value: unknown) => {
        if (value === null || value === undefined || value === '') {
          return true;
        }

        if (!normalizeUrl(value)) {
          return 'Enter a valid demo URL or leave blank.';
        }

        return true;
      },
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
          localized: true,
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
