/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['email', 'role', 'supabaseId'],
  },
  access: {
    read: ({ req }: { req: any }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      label: 'Função no CMS',
      defaultValue: 'admin',
      options: [
        { label: 'Administrador', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      admin: {
        description:
          'Controla o nível de acesso dentro do painel do Payload. Usuários sincronizados do Supabase sempre são administradores.',
      },
    },
    {
      name: 'supabaseId',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description:
          'Identificador do usuário no Supabase. Definido automaticamente para perfis com papel de administrador.',
      },
      hooks: {
        beforeValidate: [({ value }) => (isNonEmptyString(value) ? value : undefined)],
      },
    },
  ],
};

export default Users;
