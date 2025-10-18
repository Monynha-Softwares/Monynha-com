/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { pool } from '../utilities/supabasePool';
import { getLocalizedRequiredString } from '../utilities/localization';

const normalizeTags = (value: any): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const tags = new Set<string>();

  for (const entry of value) {
    if (typeof entry === 'string') {
      const trimmed = entry.trim();
      if (trimmed) {
        tags.add(trimmed);
      }
      continue;
    }

    if (entry && typeof entry === 'object') {
      const text = getLocalizedRequiredString(entry.value ?? entry.label ?? entry.text);
      const trimmed = text.trim();
      if (trimmed) {
        tags.add(trimmed);
      }
    }
  }

  return Array.from(tags);
};

const upsertRepository = async ({ doc, req }: { doc: any; req: any }) => {
  const supabaseId = doc.supabaseId ?? null;
  const name = getLocalizedRequiredString(doc.name);
  const description = getLocalizedRequiredString(doc.description);
  const github_url = doc.githubUrl;
  const demo_url = doc.demoUrl ?? null;
  const tags = normalizeTags(doc.tags);
  const active = !!doc.active;

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
    returning id`;

  const queryWithoutId = `
    insert into public.repositories (name, description, github_url, demo_url, tags, active, updated_at)
    values ($1,$2,$3,$4,$5::text[],$6, now())
    returning id`;

  const result = supabaseId
    ? await pool.query(queryWithId, [supabaseId, name, description, github_url, demo_url, tags, active])
    : await pool.query(queryWithoutId, [name, description, github_url, demo_url, tags, active]);

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
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'active'] },
  access: {
    read: () => true,
    create: ({ req }: { req: any }) => Boolean(req.user),
    update: ({ req }: { req: any }) => Boolean(req.user),
    delete: ({ req }: { req: any }) => Boolean(req.user),
  },
  fields: [
    { name: 'supabaseId', type: 'text', admin: { hidden: true } },
    { name: 'name', type: 'text', localized: true, required: true },
    { name: 'description', type: 'textarea', localized: true, required: true },
    {
      name: 'githubUrl',
      type: 'text',
      required: true,
      validate: (value: string | undefined | null) => {
        if (!value) return 'GitHub URL é obrigatória';
        try {
          const parsed = new URL(value);
          return parsed.protocol.startsWith('http') ? true : 'Informe uma URL válida';
        } catch {
          return 'Informe uma URL válida';
        }
      },
    },
    {
      name: 'demoUrl',
      type: 'text',
      admin: { description: 'Opcional' },
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
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'value',
          type: 'text',
          label: 'Tag',
        },
      ],
    },
    { name: 'active', type: 'checkbox', defaultValue: true },
  ],
  hooks: { afterChange: [upsertRepository] },
};

export default Repositories;
