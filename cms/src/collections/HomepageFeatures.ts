/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { normalizeUrl } from '../utilities/validation';
import { createUpsertHook } from '../utilities/upsert-factory';
import { resolveLocalizedText } from '../utilities/localization';
import { buildSpaPreviewUrl } from '../utilities/preview';
import { publicReadAuthWrite, supabaseIdField, activeField } from '../utilities/collection-helpers';

const ICON_OPTIONS = ['Brain', 'Zap', 'Shield', 'Users', 'Globe', 'Laptop'];

const upsertIntoSupabase = createUpsertHook({
  collectionName: 'homepageFeatures',
  tableName: 'homepage_features',
  conflictFieldWithoutId: 'title',
  extractData: (doc: any) => {
    const title = resolveLocalizedText(doc.title);
    const description = resolveLocalizedText(doc.description);
    const icon = ICON_OPTIONS.includes(doc.icon) ? doc.icon : ICON_OPTIONS[0];
    const url = normalizeUrl(doc.url);
    const order_index = Number.parseInt(String(doc.orderIndex ?? '0'), 10);
    const active = !!doc.active;

    return { title, description, icon, url, order_index, active };
  },
});

const HomepageFeatures: CollectionConfig = {
  slug: 'homepageFeatures',
  admin: {
    useAsTitle: 'title',
    preview: () => buildSpaPreviewUrl('/'),
  },
  access: publicReadAuthWrite,
  fields: [
    supabaseIdField,
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'description', type: 'textarea', required: true, localized: true },
    {
      name: 'icon',
      type: 'select',
      required: true,
      defaultValue: ICON_OPTIONS[0],
      options: ICON_OPTIONS.map((option) => ({ label: option, value: option })),
    },
    {
      name: 'url',
      type: 'text',
      validate: (value: unknown) => {
        if (value === null || value === undefined || value === '') {
          return true;
        }

        if (!normalizeUrl(value)) {
          return 'Enter a valid URL or leave blank.';
        }

        return true;
      },
    },
    {
      name: 'orderIndex',
      type: 'number',
      required: true,
      admin: {
        step: 1,
        description: 'Controls the display order on the homepage.',
      },
      validate: (value: unknown) => {
        if (value === null || value === undefined || value === '') {
          return 'Provide an order number.';
        }

        const parsed = Number(value);
        if (!Number.isInteger(parsed) || parsed < 0) {
          return 'Order index must be a non-negative integer.';
        }

        return true;
      },
    },
    activeField,
  ],
  hooks: { afterChange: [upsertIntoSupabase] },
};

export default HomepageFeatures;
