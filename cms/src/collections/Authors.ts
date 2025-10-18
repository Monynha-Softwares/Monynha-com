/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';

const Authors: CollectionConfig = {
  slug: 'authors',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'active'] },
  access: {
    read: () => true,
    create: ({ req }: { req: any }) => Boolean(req.user),
    update: ({ req }: { req: any }) => Boolean(req.user),
    delete: ({ req }: { req: any }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'bio', type: 'textarea', localized: true },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    { name: 'active', type: 'checkbox', defaultValue: true },
  ],
};

export default Authors;
