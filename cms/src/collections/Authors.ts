/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { resolveLocalizedText } from '../utilities/localization';

const Authors: CollectionConfig = {
  slug: 'authors',
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true,
    create: ({ req }: { req: any }) => Boolean(req.user),
    update: ({ req }: { req: any }) => Boolean(req.user),
    delete: ({ req }: { req: any }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      validate: (value: unknown, { siblingData }: { siblingData: any }) => {
        const slug = typeof value === 'string' ? value.trim() : '';
        if (!slug) {
          return 'Slug is required.';
        }

        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
          return 'Use lowercase letters, numbers, and hyphens only.';
        }

        if (siblingData?.name) {
          const resolvedName = resolveLocalizedText(siblingData.name);
          if (resolvedName && resolvedName.trim().length > 0 && slug === resolvedName) {
            return 'Slug should differ from the localized name to avoid conflicts.';
          }
        }

        return true;
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
  ],
};

export default Authors;
