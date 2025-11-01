/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Access, Field } from 'payload';

/**
 * Standard access control that requires authentication
 */
export const authenticatedAccess: Access = ({ req }: { req: any }) => Boolean(req.user);

/**
 * Public read access
 */
export const publicReadAccess: Access = () => true;

/**
 * Standard access control for collections with public read
 * and authenticated write/update/delete
 */
export const publicReadAuthWrite = {
  read: publicReadAccess,
  create: authenticatedAccess,
  update: authenticatedAccess,
  delete: authenticatedAccess,
};

/**
 * Standard access control for admin-only collections
 */
export const adminOnlyAccess = {
  read: authenticatedAccess,
  create: authenticatedAccess,
  update: authenticatedAccess,
  delete: authenticatedAccess,
};

/**
 * Hidden Supabase ID field used across all synced collections
 */
export const supabaseIdField: Field = {
  name: 'supabaseId',
  type: 'text',
  admin: { hidden: true },
};

/**
 * Standard active/inactive checkbox field
 */
export const activeField: Field = {
  name: 'active',
  type: 'checkbox',
  defaultValue: true,
};
