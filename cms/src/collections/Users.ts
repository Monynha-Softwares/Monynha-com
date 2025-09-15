/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';

const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  access: {
    read: ({ req }: { req: any }) => Boolean(req.user),
  },
  fields: [{ name: 'name', type: 'text' }],
};

export default Users;
