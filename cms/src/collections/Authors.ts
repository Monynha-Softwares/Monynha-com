/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
      validate: (value: unknown) => {
        if (typeof value !== 'string' || value.trim().length === 0) {
          return 'Slug is required';
        }
        if (!slugPattern.test(value)) {
          return 'Use lowercase letters, numbers, and hyphens only';
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
