/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { normalizeUrl } from '../utilities/validation';
import { createUpsertHook } from '../utilities/upsert-factory';
import { resolveLocalizedText, resolveOptionalLocalizedText } from '../utilities/localization';
import { buildSpaPreviewUrl } from '../utilities/preview';
import { publicReadAuthWrite, supabaseIdField, activeField } from '../utilities/collection-helpers';

const upsertIntoSupabase = createUpsertHook({
  collectionName: 'teamMembers',
  tableName: 'team_members',
  extractData: (doc: any) => {
    const name = resolveLocalizedText(doc.name);
    const role = resolveLocalizedText(doc.role);
    const bio = resolveOptionalLocalizedText(doc.bio);
    const image_url = doc?.photo?.url ?? null;
    const linkedin_url = normalizeUrl(doc.linkedinUrl);
    const active = !!doc.active;

    return { name, role, bio, image_url, linkedin_url, active };
  },
});

const TeamMembers: CollectionConfig = {
  slug: 'teamMembers',
  admin: {
    useAsTitle: 'name',
    preview: () => buildSpaPreviewUrl('/about'),
  },
  access: publicReadAuthWrite,
  fields: [
    supabaseIdField,
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'role', type: 'text', required: true, localized: true },
    { name: 'bio', type: 'textarea', localized: true },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'linkedinUrl',
      type: 'text',
      validate: (value: unknown) => {
        if (value === null || value === undefined || value === '') {
          return true;
        }

        if (!normalizeUrl(value)) {
          return 'Enter a valid LinkedIn URL or leave blank.';
        }

        return true;
      },
    },
    activeField,
  ],
  hooks: { afterChange: [upsertIntoSupabase] },
};

export default TeamMembers;
