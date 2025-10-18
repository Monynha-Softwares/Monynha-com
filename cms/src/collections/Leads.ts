/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { pool } from '../utilities/pool';
import { logCmsSyncEvent } from '../utilities/monitoring';

const normalizeEmail = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim().toLowerCase();
  if (trimmed.length === 0) {
    return null;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(trimmed) ? trimmed : null;
};

const upsertIntoSupabase = async ({ doc, req }: { doc: any; req: any }) => {
  const supabaseId = doc.supabaseId ?? null;
  const name = typeof doc.name === 'string' ? doc.name.trim() : '';
  const email = normalizeEmail(doc.email);
  const company = typeof doc.company === 'string' && doc.company.trim().length > 0 ? doc.company.trim() : null;
  const project = typeof doc.project === 'string' && doc.project.trim().length > 0 ? doc.project.trim() : null;
  const message = typeof doc.message === 'string' ? doc.message.trim() : '';

  if (!name) {
    throw new Error('Name is required.');
  }

  if (!email) {
    throw new Error('A valid email address is required.');
  }

  if (!message) {
    throw new Error('Message cannot be empty.');
  }

  const queryWithId = `
    insert into public.leads (id, name, email, company, project, message)
    values ($1::uuid,$2,$3,$4,$5,$6)
    on conflict (id) do update set
      name=excluded.name,
      email=excluded.email,
      company=excluded.company,
      project=excluded.project,
      message=excluded.message
    returning id`;

  const queryWithoutId = `
    insert into public.leads (name, email, company, project, message)
    values ($1,$2,$3,$4,$5)
    returning id`;

  const paramsWithId = [supabaseId, name, email, company, project, message];
  const paramsWithoutId = [name, email, company, project, message];

  try {
    const result = supabaseId
      ? await pool.query(queryWithId, paramsWithId)
      : await pool.query(queryWithoutId, paramsWithoutId);

    const generatedId = result?.rows?.[0]?.id ?? null;

    if (!supabaseId && generatedId && req?.payload) {
      await req.payload.update({
        collection: 'leads',
        id: doc.id,
        data: { supabaseId: generatedId },
        depth: 0,
      });
    }

    await logCmsSyncEvent({
      collection: 'leads',
      action: 'upsert',
      payloadId: doc.id ?? null,
      supabaseId: (supabaseId ?? generatedId) ?? null,
      status: 'success',
      metadata: { email, hasCompany: Boolean(company), hasProject: Boolean(project) },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error while syncing lead';
    await logCmsSyncEvent({
      collection: 'leads',
      action: 'upsert',
      payloadId: doc.id ?? null,
      supabaseId,
      status: 'error',
      message,
      metadata: { email },
    });
    throw error;
  }
};

const Leads: CollectionConfig = {
  slug: 'leads',
  admin: { useAsTitle: 'name' },
  access: {
    read: ({ req }: { req: any }) => Boolean(req.user),
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
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'text',
      required: true,
      validate: (value: unknown) => {
        if (!normalizeEmail(value)) {
          return 'Enter a valid email address.';
        }

        return true;
      },
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
      admin: {
        description: 'Details provided by the lead when contacting the team.',
      },
    },
  ],
  hooks: { afterChange: [upsertIntoSupabase] },
};

export default Leads;
