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
  const email = normalizeEmail(doc.email);
  const active = !!doc.active;

  if (!email) {
    throw new Error('A valid email address is required.');
  }

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
      active=excluded.active,
      email=excluded.email
    returning id`;

  const paramsWithId = [supabaseId, email, active];
  const paramsWithoutId = [email, active];

  try {
    const result = supabaseId
      ? await pool.query(queryWithId, paramsWithId)
      : await pool.query(queryWithoutId, paramsWithoutId);

    const generatedId = result?.rows?.[0]?.id ?? null;

    if (!supabaseId && generatedId && req?.payload) {
      await req.payload.update({
        collection: 'newsletterSubscribers',
        id: doc.id,
        data: { supabaseId: generatedId },
        depth: 0,
      });
    }

    await logCmsSyncEvent({
      collection: 'newsletterSubscribers',
      action: 'upsert',
      payloadId: doc.id ?? null,
      supabaseId: (supabaseId ?? generatedId) ?? null,
      status: 'success',
      metadata: { email, active },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error while syncing newsletter subscriber';
    await logCmsSyncEvent({
      collection: 'newsletterSubscribers',
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
    {
      name: 'supabaseId',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'email',
      type: 'text',
      required: true,
      unique: true,
      validate: (value: unknown) => {
        if (!normalizeEmail(value)) {
          return 'Enter a valid email address.';
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

export default NewsletterSubscribers;
