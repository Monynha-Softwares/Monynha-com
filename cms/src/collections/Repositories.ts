/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { normalizeUrl, extractTags } from '../utilities/validation';
import { createUpsertHook } from '../utilities/upsert-factory';
import { resolveLocalizedText } from '../utilities/localization';
import { buildSpaPreviewUrl } from '../utilities/preview';
import { publicReadAuthWrite, supabaseIdField, activeField } from '../utilities/collection-helpers';

const upsertIntoSupabase = createUpsertHook({
  collectionName: 'repositories',
  tableName: 'repositories',
  extractData: (doc: any) => {
    const name = resolveLocalizedText(doc.name);
    const description = resolveLocalizedText(doc.description);
    const github_url = normalizeUrl(doc.githubUrl);
    const demo_url = normalizeUrl(doc.demoUrl);
    const tags = extractTags(doc.tags, resolveLocalizedText);
    const active = !!doc.active;

    if (!github_url) {
      throw new Error('A valid GitHub URL is required for repositories.');
    }

    return { name, description, github_url, demo_url, tags, active };
  },
});

const Repositories: CollectionConfig = {
  slug: 'repositories',
  admin: {
    useAsTitle: 'name',
    preview: () => buildSpaPreviewUrl('/projects'),
  },
  access: publicReadAuthWrite,
  fields: [
    supabaseIdField,
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'description', type: 'textarea', required: true, localized: true },
    {
      name: 'githubUrl',
      type: 'text',
      required: true,
      unique: true,
      validate: (value: unknown) => {
        if (!normalizeUrl(value)) {
          return 'Enter a valid GitHub repository URL.';
        }

        return true;
      },
    },
    {
      name: 'demoUrl',
      type: 'text',
      validate: (value: unknown) => {
        if (value === null || value === undefined || value === '') {
          return true;
        }

        if (!normalizeUrl(value)) {
          return 'Enter a valid demo URL or leave blank.';
        }

        return true;
      },
    },
    {
      name: 'tags',
      type: 'array',
      labels: {
        singular: 'Tag',
        plural: 'Tags',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
          localized: true,
        },
      ],
    },
    activeField,
  ],
  hooks: { afterChange: [upsertIntoSupabase] },
};

export default Repositories;
