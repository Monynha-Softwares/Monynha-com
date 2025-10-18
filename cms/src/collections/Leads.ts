/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { pool } from '../utils/supabase';

const isValidEmail = (value: unknown): boolean => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return false;
  }

  return /.+@.+\..+/.test(value.trim());
};

const upsertIntoSupabase = async ({ doc, req }: { doc: any; req: any }) => {
  const supabaseId = doc.supabaseId ?? null;
  const name = typeof doc.name === 'string' ? doc.name.trim() : '';
  const email = typeof doc.email === 'string' ? doc.email.trim() : '';
  const company = typeof doc.company === 'string' ? doc.company.trim() : null;
  const project = typeof doc.project === 'string' ? doc.project.trim() : null;
  const message = typeof doc.message === 'string' ? doc.message.trim() : '';
  const hasCreatedAt =
    typeof doc.createdAt === 'string' && doc.createdAt.trim().length > 0;
  const createdAt = hasCreatedAt
    ? new Date(doc.createdAt).toISOString()
    : supabaseId
      ? null
      : new Date().toISOString();

  const queryWithId = `
    insert into public.leads (id, name, email, company, project, message, created_at)
    values ($1::uuid,$2,$3,$4,$5,$6,$7)
    on conflict (id) do update set
      name=excluded.name,
      email=excluded.email,
      company=excluded.company,
      project=excluded.project,
      message=excluded.message,
      created_at=COALESCE(excluded.created_at, public.leads.created_at)
    returning id`;

  const queryWithoutId = `
    insert into public.leads (name, email, company, project, message, created_at)
    values ($1,$2,$3,$4,$5,$6)
    returning id`;

  const result = supabaseId
    ? await pool.query(queryWithId, [supabaseId, name, email, company, project, message, createdAt])
    : await pool.query(queryWithoutId, [name, email, company, project, message, createdAt]);

  const generatedId = result?.rows?.[0]?.id;

  if (!supabaseId && generatedId && req?.payload) {
    await req.payload.update({
      collection: 'leads',
      id: doc.id,
      data: { supabaseId: generatedId },
      depth: 0,
    });
  }
};

const Leads: CollectionConfig = {
  slug: 'leads',
  admin: { useAsTitle: 'email' },
  access: {
    read: ({ req }: { req: any }) => Boolean(req.user),
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
    },
    {
      name: 'email',
      type: 'text',
      required: true,
      validate: (value: unknown) =>
        isValidEmail(value) ? true : 'Please provide a valid email address',
    },
    {
      name: 'company',
      type: 'text',
    },
    {
      name: 'project',
      type: 'text',
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'createdAt',
      label: 'Created At',
      type: 'date',
      admin: { readOnly: true },
    },
  ],
  hooks: { afterChange: [upsertIntoSupabase] },
};

export default Leads;
