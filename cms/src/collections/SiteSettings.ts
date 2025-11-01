/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { serializeValue } from '../utilities/validation';
import { createUpsertHook } from '../utilities/upsert-factory';
import { resolveOptionalLocalizedText } from '../utilities/localization';
import { buildSpaPreviewUrl } from '../utilities/preview';
import { adminOnlyAccess, supabaseIdField } from '../utilities/collection-helpers';

const upsertIntoSupabase = createUpsertHook({
  collectionName: 'siteSettings',
  tableName: 'site_settings',
  conflictFieldWithoutId: 'key',
  jsonbFields: ['value'],
  extractData: (doc: any) => {
    const key = doc.key;
    const description = resolveOptionalLocalizedText(doc.description);
    const value = serializeValue(doc.value);

    return { key, value, description };
  },
});

const SiteSettings: CollectionConfig = {
  slug: 'siteSettings',
  admin: {
    useAsTitle: 'key',
    preview: () => buildSpaPreviewUrl('/contact'),
  },
  access: adminOnlyAccess,
  fields: [
    supabaseIdField,
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
