import type { CollectionConfig } from 'payload';

const Media: CollectionConfig = {
  slug: 'media',
  upload: true,
  access: {
    read: () => true,
  },
  fields: [],
};

export default Media;
