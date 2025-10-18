/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const Categories: CollectionConfig = {
  slug: 'categories',
  admin: { useAsTitle: 'title' },
  access: {
    read: () => true,
    create: ({ req }: { req: any }) => Boolean(req.user),
    update: ({ req }: { req: any }) => Boolean(req.user),
    delete: ({ req }: { req: any }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'title',
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
      name: 'description',
      type: 'textarea',
      localized: true,
    },
  ],
};

export default Categories;
