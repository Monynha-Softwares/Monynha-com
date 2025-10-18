/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { pool } from '../utilities/pool';
import { resolveOptionalLocalizedText } from '../utilities/localization';
import { buildSpaPreviewUrl } from '../utilities/preview';
import { logCmsSyncEvent } from '../utilities/monitoring';

const serializeValue = (value: any): string => {
  if (typeof value === 'string') {
    try {
      JSON.parse(value);
      return value;
    } catch {
      return JSON.stringify(value);
    }
  }

  if (value === null || value === undefined) {
    return JSON.stringify({});
  }

  return JSON.stringify(value);
};

const upsertIntoSupabase = async ({ doc, req }: { doc: any; req: any }) => {
  const supabaseId = doc.supabaseId ?? null;
  const key = doc.key;
  const description = resolveOptionalLocalizedText(doc.description);
  const value = serializeValue(doc.value);

  const queryWithId = `
    insert into public.site_settings (id, key, value, description, updated_at)
    values ($1::uuid,$2,$3::jsonb,$4, now())
    on conflict (id) do update set
      key=excluded.key,
      value=excluded.value,
      description=excluded.description,
      updated_at=now()
    returning id`;

  const queryWithoutId = `
    insert into public.site_settings (key, value, description, updated_at)
    values ($1,$2::jsonb,$3, now())
    on conflict (key) do update set
      value=excluded.value,
      description=excluded.description,
      updated_at=now()
    returning id`;

  const paramsWithId = [supabaseId, key, value, description];
  const paramsWithoutId = [key, value, description];

  try {
    const result = supabaseId
      ? await pool.query(queryWithId, paramsWithId)
      : await pool.query(queryWithoutId, paramsWithoutId);

    const generatedId = result?.rows?.[0]?.id ?? null;

    if (!supabaseId && generatedId && req?.payload) {
      await req.payload.update({
        collection: 'siteSettings',
        id: doc.id,
        data: { supabaseId: generatedId },
        depth: 0,
      });
    }

    await logCmsSyncEvent({
      collection: 'siteSettings',
      action: 'upsert',
      payloadId: doc.id ?? null,
      supabaseId: (supabaseId ?? generatedId) ?? null,
      status: 'success',
      metadata: { key, hasDescription: Boolean(description) },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error while syncing site setting';
    await logCmsSyncEvent({
      collection: 'siteSettings',
      action: 'upsert',
      payloadId: doc.id ?? null,
      supabaseId,
      status: 'error',
      message,
      metadata: { key },
    });
    throw error;
  }
};

const SiteSettings: CollectionConfig = {
  slug: 'siteSettings',
  admin: {
    useAsTitle: 'key',
    preview: () => buildSpaPreviewUrl('/contact'),
  },
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
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      validate: (value: unknown) => {
        if (typeof value !== 'string' || value.trim().length === 0) {
          return 'Setting key is required.';
        }

        if (!/^[a-z0-9_-]+$/.test(value)) {
          return 'Use lowercase letters, numbers, underscores, or hyphens.';
        }

        return true;
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'value',
      type: 'json',
      required: true,
      admin: {
        description: 'Stores arbitrary configuration consumed by the frontend.',
      },
    },
  ],
  hooks: { afterChange: [upsertIntoSupabase] },
};

export default SiteSettings;
