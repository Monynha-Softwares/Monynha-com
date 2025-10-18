/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { pool } from '../utilities/supabasePool';

const upsertLead = async ({ doc, req }: { doc: any; req: any }) => {
  const supabaseId = doc.supabaseId ?? null;
  const name = doc.name;
  const email = doc.email;
  const company = doc.company ?? null;
  const project = doc.project ?? null;
  const message = doc.message;

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

  const result = supabaseId
    ? await pool.query(queryWithId, [supabaseId, name, email, company, project, message])
    : await pool.query(queryWithoutId, [name, email, company, project, message]);

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
  admin: { useAsTitle: 'email', defaultColumns: ['name', 'email', 'company'] },
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
    {
      name: 'createdAt',
      type: 'date',
      admin: { readOnly: true, date: { displayFormat: 'yyyy-MM-dd HH:mm' } },
    },
  ],
  hooks: { afterChange: [upsertLead] },
};

export default Leads;
