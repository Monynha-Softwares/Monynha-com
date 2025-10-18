/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import {
  extractMediaUrl,
  pool,
  resolveLocalizedNullableString,
  resolveLocalizedString,
} from '../utils/supabase';

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
  const role = resolveLocalizedString(doc.role, '');
  const bio = resolveLocalizedNullableString(doc.bio);
  const imageUrl = extractMediaUrl(doc.avatar);
  const linkedinUrl = typeof doc.linkedinUrl === 'string' ? doc.linkedinUrl : null;
  const active = doc.active !== false;

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

  const result = supabaseId
    ? await pool.query(queryWithId, [supabaseId, name, role, bio, imageUrl, linkedinUrl, active])
    : await pool.query(queryWithoutId, [name, role, bio, imageUrl, linkedinUrl, active]);

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
    { name: 'supabaseId', type: 'text', admin: { hidden: true } },
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'role',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'bio',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'linkedinUrl',
      label: 'LinkedIn URL',
      type: 'text',
      required: false,
      validate: (value: unknown) => {
        if (!value) {
          return true;
        }
        return isValidUrl(value)
          ? true
          : 'Please provide a valid LinkedIn profile URL (including https://)';
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
