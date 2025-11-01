/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { extractFeatureList } from '../utilities/validation';
import { createUpsertHook } from '../utilities/upsert-factory';
import { resolveLocalizedText, resolveOptionalLocalizedText } from '../utilities/localization';
import { buildSpaPreviewUrl } from '../utilities/preview';
import { publicReadAuthWrite, supabaseIdField, activeField } from '../utilities/collection-helpers';

const gradientOptions = [
  'from-brand-purple to-brand-blue',
  'from-brand-pink to-brand-orange',
  'from-brand-blue to-brand-purple',
  'from-brand-orange to-brand-pink',
];

const upsertIntoSupabase = createUpsertHook({
  collectionName: 'solutions',
  tableName: 'solutions',
  conflictFieldWithoutId: 'slug',
  jsonbFields: ['features'],
  extractData: (doc: any) => {
    const slug = doc.slug;
    const title = resolveLocalizedText(doc.title);
    const description = resolveLocalizedText(doc.description);
    const image_url = doc?.image?.url ?? null;
    const features = JSON.stringify(extractFeatureList(doc.features, resolveOptionalLocalizedText) ?? []);
    const active = !!doc.active;
    const gradient = doc.gradient ?? null;

    return { slug, title, description, image_url, features, gradient, active };
  },
});

const Solutions: CollectionConfig = {
  slug: 'solutions',
  admin: {
    useAsTitle: 'title',
    preview: (doc: any) =>
      buildSpaPreviewUrl(
        doc?.slug && typeof doc.slug === 'string'
          ? `/solutions/${doc.slug}`
          : '/solutions'
      ),
  },
  access: publicReadAuthWrite,
  fields: [
    supabaseIdField,
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      validate: (value: unknown) => {
        if (typeof value !== 'string' || value.trim().length === 0) {
          return 'Slug is required.';
        }

        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
          return 'Use lowercase letters, numbers, and hyphens only.';
        }

        return true;
      },
    },
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'description', type: 'textarea', required: true, localized: true },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'features',
      type: 'array',
      labels: {
        singular: 'Feature',
        plural: 'Features',
      },
      fields: [
        {
          name: 'content',
          type: 'text',
          required: true,
          localized: true,
        },
      ],
    },
    {
      name: 'gradient',
      type: 'select',
      required: true,
      defaultValue: gradientOptions[0],
      options: gradientOptions.map((value) => ({ label: value, value })),
    },
    activeField,
  ],
  hooks: { afterChange: [upsertIntoSupabase] },
};

export default Solutions;
