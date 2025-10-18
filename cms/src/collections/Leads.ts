/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { pool } from '../utils/supabase';

const upsertLead = async ({ doc, req }: { doc: any; req: any }) => {
  const supabaseId = doc.supabaseId ?? null;
  const name: string = doc.name?.trim();
  const email: string = doc.email?.trim();
  const company: string | null = doc.company?.trim() ? doc.company.trim() : null;
  const project: string | null = doc.project?.trim() ? doc.project.trim() : null;
  const message: string = doc.message?.trim();

  if (!name || !email || !message) {
    return;
  }

  const params = [name, email, company, project, message];

  const queryWithId = `
    insert into public.leads (id, name, email, company, project, message)
    values ($1::uuid,$2,$3,$4,$5,$6)
    on conflict (id) do update set
      name=excluded.name,
      email=excluded.email,
      company=excluded.company,
      project=excluded.project,
      message=excluded.message
    returning id
  `;

  const queryWithoutId = `
    insert into public.leads (name, email, company, project, message)
    values ($1,$2,$3,$4,$5)
    returning id
  `;

  const result = supabaseId
    ? await pool.query(queryWithId, [supabaseId, ...params])
    : await pool.query(queryWithoutId, params);

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
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'company', type: 'text' },
    { name: 'project', type: 'text' },
    { name: 'message', type: 'textarea', required: true },
  ],
  hooks: { afterChange: [upsertLead] },
};

export default Leads;
