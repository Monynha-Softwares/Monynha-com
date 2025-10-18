/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { pool } from '../utilities/pool';
import { resolveLocalizedText, resolveOptionalLocalizedText } from '../utilities/localization';

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
  const name = resolveLocalizedText(doc.name);
  const role = resolveLocalizedText(doc.role);
  const bio = resolveOptionalLocalizedText(doc.bio);
  const image_url = doc?.photo?.url ?? null;
  const linkedin_url = normalizeUrl(doc.linkedinUrl);
  const active = !!doc.active;

  const queryWithId = `
    insert into public.team_members (id, name, role, bio, image_url, linkedin_url, active, updated_at)
    values ($1::uuid,$2,$3,$4,$5,$6,$7, now())
    on conflict (id) do update set
      name=excluded.name,
      role=excluded.role,
      bio=excluded.bio,
      image_url=excluded.image_url,
      linkedin_url=excluded.linkedin_url,
      active=excluded.active,
      updated_at=now()
    returning id`;

  const queryWithoutId = `
    insert into public.team_members (name, role, bio, image_url, linkedin_url, active, updated_at)
    values ($1,$2,$3,$4,$5,$6, now())
    returning id`;

  const paramsWithId = [supabaseId, name, role, bio, image_url, linkedin_url, active];
  const paramsWithoutId = [name, role, bio, image_url, linkedin_url, active];

  const result = supabaseId
    ? await pool.query(queryWithId, paramsWithId)
    : await pool.query(queryWithoutId, paramsWithoutId);

  const generatedId = result?.rows?.[0]?.id;

  if (!supabaseId && generatedId && req?.payload) {
    await req.payload.update({
      collection: 'teamMembers',
      id: doc.id,
      data: { supabaseId: generatedId },
      depth: 0,
    });
  }
};

const TeamMembers: CollectionConfig = {
  slug: 'teamMembers',
  admin: { useAsTitle: 'name' },
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
    { name: 'role', type: 'text', required: true, localized: true },
    { name: 'bio', type: 'textarea', localized: true },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'linkedinUrl',
      type: 'text',
      validate: (value: unknown) => {
        if (value === null || value === undefined || value === '') {
          return true;
        }

        if (!normalizeUrl(value)) {
          return 'Enter a valid LinkedIn URL or leave blank.';
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

export default TeamMembers;
