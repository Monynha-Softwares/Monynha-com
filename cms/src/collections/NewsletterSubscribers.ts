/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { pool } from '../utilities/supabasePool';

const upsertNewsletterSubscriber = async ({ doc, req }: { doc: any; req: any }) => {
  const supabaseId = doc.supabaseId ?? null;
  const email = doc.email;
  const active = doc.active ?? true;

  const queryWithId = `
    insert into public.newsletter_subscribers (id, email, active)
    values ($1::uuid,$2,$3)
    on conflict (id) do update set
      email=excluded.email,
      active=excluded.active
    returning id`;

  const queryWithoutId = `
    insert into public.newsletter_subscribers (email, active)
    values ($1,$2)
    on conflict (email) do update set
      active=excluded.active
    returning id`;

  const result = supabaseId
    ? await pool.query(queryWithId, [supabaseId, email, active])
    : await pool.query(queryWithoutId, [email, active]);

  const generatedId = result?.rows?.[0]?.id;

  if (!supabaseId && generatedId && req?.payload) {
    await req.payload.update({
      collection: 'newsletterSubscribers',
      id: doc.id,
      data: { supabaseId: generatedId },
      depth: 0,
    });
  }
};

const NewsletterSubscribers: CollectionConfig = {
  slug: 'newsletterSubscribers',
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'active'] },
  access: {
    read: ({ req }: { req: any }) => Boolean(req.user),
    create: ({ req }: { req: any }) => Boolean(req.user),
    update: ({ req }: { req: any }) => Boolean(req.user),
    delete: ({ req }: { req: any }) => Boolean(req.user),
  },
  fields: [
    { name: 'supabaseId', type: 'text', admin: { hidden: true } },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    { name: 'active', type: 'checkbox', defaultValue: true },
    {
      name: 'subscribedAt',
      type: 'date',
      admin: { readOnly: true, date: { displayFormat: 'yyyy-MM-dd HH:mm' } },
    },
  ],
  hooks: { afterChange: [upsertNewsletterSubscriber] },
};

export default NewsletterSubscribers;
