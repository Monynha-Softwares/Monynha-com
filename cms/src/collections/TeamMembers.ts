/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { pool, resolveLocalizedText, resolveNullableLocalizedText } from '../utils/supabase';

const upsertTeamMember = async ({ doc, req }: { doc: any; req: any }) => {
  const supabaseId = doc.supabaseId ?? null;
  const name = resolveLocalizedText(doc.name);
  const role = resolveLocalizedText(doc.role);
  const bio = resolveNullableLocalizedText(doc.bio);
  const imageUrl = doc.imageUrl ?? doc?.photo?.url ?? null;
  const linkedinUrl = doc.linkedinUrl?.trim() ? doc.linkedinUrl.trim() : null;
  const active = Boolean(doc.active ?? true);

  const params = [name, role, bio, imageUrl, linkedinUrl, active];

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
    returning id
  `;

  const queryWithoutId = `
    insert into public.team_members (name, role, bio, image_url, linkedin_url, active, updated_at)
    values ($1,$2,$3,$4,$5,$6, now())
    on conflict (name, role) do update set
      bio=excluded.bio,
      image_url=excluded.image_url,
      linkedin_url=excluded.linkedin_url,
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
      collection: 'teamMembers',
      id: doc.id,
      data: { supabaseId: generatedId },
      depth: 0,
    });
  }
};

const optionalUrlValidator = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return true;
  }
  if (typeof value !== 'string') {
    return 'Provide a valid URL.';
  }
  try {
    new URL(value);
    return true;
  } catch {
    return 'Provide a valid URL including protocol (https://).';
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
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'role', type: 'text', required: true, localized: true },
    { name: 'bio', type: 'textarea', localized: true },
    {
      name: 'imageUrl',
      type: 'text',
      required: false,
      admin: { description: 'Optional direct image URL.' },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'linkedinUrl',
      type: 'text',
      label: 'LinkedIn URL',
      required: false,
      validate: optionalUrlValidator,
    },
    { name: 'active', type: 'checkbox', defaultValue: true },
  ],
  hooks: { afterChange: [upsertTeamMember] },
};

export default TeamMembers;
