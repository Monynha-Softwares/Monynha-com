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
  const email = typeof doc.email === 'string' ? doc.email.trim() : '';
  const active = doc.active !== false;
  const hasSubscribedAt =
    typeof doc.subscribedAt === 'string' && doc.subscribedAt.trim().length > 0;
  const subscribedAt = hasSubscribedAt
    ? new Date(doc.subscribedAt).toISOString()
    : supabaseId
      ? null
      : new Date().toISOString();

  const queryWithId = `
    insert into public.newsletter_subscribers (id, email, active, subscribed_at)
    values ($1::uuid,$2,$3,$4)
    on conflict (id) do update set
      email=excluded.email,
      active=excluded.active,
      subscribed_at=COALESCE(excluded.subscribed_at, public.newsletter_subscribers.subscribed_at)
    returning id`;

  const queryWithoutId = `
    insert into public.newsletter_subscribers (email, active, subscribed_at)
    values ($1,$2,$3)
    on conflict (email) do update set
      active=excluded.active,
      subscribed_at=COALESCE(excluded.subscribed_at, public.newsletter_subscribers.subscribed_at)
    returning id`;

  const result = supabaseId
    ? await pool.query(queryWithId, [supabaseId, email, active, subscribedAt])
    : await pool.query(queryWithoutId, [email, active, subscribedAt]);

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
      name: 'email',
      type: 'text',
      required: true,
      unique: true,
      validate: (value: unknown) =>
        isValidEmail(value) ? true : 'Please provide a valid email address',
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'subscribedAt',
      label: 'Subscribed At',
      type: 'date',
      admin: { readOnly: true },
    },
  ],
  hooks: { afterChange: [upsertIntoSupabase] },
};

export default NewsletterSubscribers;
