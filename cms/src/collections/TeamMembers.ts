/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { pool } from '../utilities/supabasePool';
import {
  getLocalizedOptionalString,
  getLocalizedRequiredString,
} from '../utilities/localization';

const upsertTeamMember = async ({ doc, req }: { doc: any; req: any }) => {
  const supabaseId = doc.supabaseId ?? null;
  const name = getLocalizedRequiredString(doc.name);
  const role = getLocalizedRequiredString(doc.role);
  const bio = getLocalizedOptionalString(doc.bio);
  const image_url = doc?.photo?.url ?? null;
  const linkedin_url = doc.linkedinUrl ?? null;
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

  const result = supabaseId
    ? await pool.query(queryWithId, [supabaseId, name, role, bio, image_url, linkedin_url, active])
    : await pool.query(queryWithoutId, [name, role, bio, image_url, linkedin_url, active]);

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
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'role', 'active'] },
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
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'linkedinUrl',
      type: 'text',
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
    { name: 'active', type: 'checkbox', defaultValue: true },
  ],
  hooks: { afterChange: [upsertTeamMember] },
};

export default TeamMembers;
