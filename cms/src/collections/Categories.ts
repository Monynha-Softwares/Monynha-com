/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { getLocalizedRequiredString } from '../utilities/localization';

const Categories: CollectionConfig = {
  slug: 'categories',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug'] },
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
      localized: true,
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      validate: (value: string | undefined | null, { data }: { data: any }) => {
        if (!value) return 'Slug é obrigatório';
        const normalized = value.trim();
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) {
          return 'Use apenas letras minúsculas, números e hífens';
        }
        const title = getLocalizedRequiredString(data?.title);
        return normalized.length > 0 && title ? true : 'Informe um título antes do slug';
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
