/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CollectionConfig } from 'payload';
import { normalizeEmail } from '../utilities/validation';
import { createUpsertHook } from '../utilities/upsert-factory';
import { adminOnlyAccess, supabaseIdField, activeField } from '../utilities/collection-helpers';

const upsertIntoSupabase = createUpsertHook({
  collectionName: 'newsletterSubscribers',
  tableName: 'newsletter_subscribers',
  conflictFieldWithoutId: 'email',
  extractData: (doc: any) => {
    const email = normalizeEmail(doc.email);
    const active = !!doc.active;

    if (!email) {
      throw new Error('A valid email address is required.');
    }

    return { email, active };
  },
});

const NewsletterSubscribers: CollectionConfig = {
  slug: 'newsletterSubscribers',
  admin: { useAsTitle: 'email' },
  access: adminOnlyAccess,
  fields: [
    supabaseIdField,
    {
      name: 'email',
      type: 'text',
      required: true,
      unique: true,
      validate: (value: unknown) => {
        if (!normalizeEmail(value)) {
          return 'Enter a valid email address.';
        }

        return true;
      },
    },
    activeField,
  ],
  hooks: { afterChange: [upsertIntoSupabase] },
};

export default NewsletterSubscribers;
