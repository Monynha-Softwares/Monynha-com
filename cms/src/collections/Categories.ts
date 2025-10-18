/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';

const Categories: CollectionConfig = {
  slug: 'categories',
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
        const slug = typeof value === 'string' ? value.trim() : '';
        if (!slug) {
          return 'Slug is required.';
        }

        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
          return 'Use lowercase letters, numbers, and hyphens only.';
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
