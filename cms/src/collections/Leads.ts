/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { normalizeEmail } from '../utilities/validation';
import { createUpsertHook } from '../utilities/upsert-factory';
import { adminOnlyAccess, supabaseIdField } from '../utilities/collection-helpers';

const upsertIntoSupabase = createUpsertHook({
  collectionName: 'leads',
  tableName: 'leads',
  extractData: (doc: any) => {
    const name = typeof doc.name === 'string' ? doc.name.trim() : '';
    const email = normalizeEmail(doc.email);
    const company = typeof doc.company === 'string' && doc.company.trim().length > 0 ? doc.company.trim() : null;
    const project = typeof doc.project === 'string' && doc.project.trim().length > 0 ? doc.project.trim() : null;
    const message = typeof doc.message === 'string' ? doc.message.trim() : '';

    if (!name) {
      throw new Error('Name is required.');
    }

    if (!email) {
      throw new Error('A valid email address is required.');
    }

    if (!message) {
      throw new Error('Message cannot be empty.');
    }

    return { name, email, company, project, message };
  },
});

const Leads: CollectionConfig = {
  slug: 'leads',
  admin: { useAsTitle: 'name' },
  access: adminOnlyAccess,
  fields: [
    supabaseIdField,
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'text',
      required: true,
      validate: (value: unknown) => {
        if (!normalizeEmail(value)) {
          return 'Enter a valid email address.';
        }

        return true;
      },
    },
    {
      name: 'company',
      type: 'text',
    },
    {
      name: 'project',
      type: 'text',
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Details provided by the lead when contacting the team.',
      },
    },
  ],
  hooks: { afterChange: [upsertIntoSupabase] },
};

export default Leads;
