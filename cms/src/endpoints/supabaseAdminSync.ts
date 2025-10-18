import crypto from 'node:crypto';
import type { CollectionSlug } from 'payload';
import type { Endpoint } from 'payload/config';

const SUPABASE_SYNC_SECRET_HEADER = 'x-admin-sync-secret';
const USERS_COLLECTION: CollectionSlug = 'users';

const generateRandomPassword = () => crypto.randomBytes(24).toString('base64url');

interface SyncProfile {
  id?: string;
  user_id?: string;
  email?: string;
  name?: string;
  role?: string;
}

interface SyncPayload {
  action?: 'promote' | 'demote';
  profile?: SyncProfile;
}

type PayloadQueryResult<T = unknown> = {
  docs: T[];
  totalDocs: number;
};

type PayloadOperations = {
  find: (args: Record<string, unknown>) => Promise<PayloadQueryResult>;
  create: (args: Record<string, unknown>) => Promise<unknown>;
  update: (args: Record<string, unknown>) => Promise<unknown>;
  delete: (args: Record<string, unknown>) => Promise<unknown>;
  forgotPassword?: (args: Record<string, unknown>) => Promise<unknown>;
};

interface AdminSyncRequest {
  headers: Record<string, string | undefined>;
  body?: unknown;
  payload: PayloadOperations;
}

interface AdminSyncResponse {
  status: (code: number) => AdminSyncResponse;
  json: (body: unknown) => AdminSyncResponse;
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const findUserByField = async (
  payloadOps: PayloadOperations,
  field: string,
  value: string
) =>
  payloadOps.find({
    collection: USERS_COLLECTION,
    where: {
      [field]: {
        equals: value,
      },
    },
    limit: 1,
    overrideAccess: true,
  });

const promoteUser = async (
  payloadOps: PayloadOperations,
  profile: Required<Pick<SyncProfile, 'user_id' | 'email' | 'name'>>
) => {
  const bySupabase = await findUserByField(payloadOps, 'supabaseId', profile.user_id);
  if (bySupabase.totalDocs > 0 && bySupabase.docs[0]) {
    const existing = bySupabase.docs[0] as { id?: string };
    await payloadOps.update({
      collection: USERS_COLLECTION,
      id: existing.id,
      overrideAccess: true,
      data: {
        name: profile.name,
        email: profile.email,
        supabaseId: profile.user_id,
        role: 'admin',
      },
    });
    return { status: 'updated' as const };
  }

  const byEmail = await findUserByField(payloadOps, 'email', profile.email);
  if (byEmail.totalDocs > 0 && byEmail.docs[0]) {
    const existing = byEmail.docs[0] as { id?: string };
    await payloadOps.update({
      collection: USERS_COLLECTION,
      id: existing.id,
      overrideAccess: true,
      data: {
        name: profile.name,
        supabaseId: profile.user_id,
        role: 'admin',
      },
    });
    return { status: 'updated' as const };
  }

  const temporaryPassword = generateRandomPassword();

  await payloadOps.create({
    collection: USERS_COLLECTION,
    overrideAccess: true,
    data: {
      email: profile.email,
      name: profile.name,
      supabaseId: profile.user_id,
      role: 'admin',
      password: temporaryPassword,
      passwordConfirm: temporaryPassword,
    },
  });

  if (payloadOps.forgotPassword) {
    try {
      await payloadOps.forgotPassword({
        collection: USERS_COLLECTION,
        data: { email: profile.email },
      });
    } catch (error) {
      console.warn('Unable to send Payload reset email for', profile.email, error);
    }
  }

  return { status: 'created' as const };
};

const demoteUser = async (payloadOps: PayloadOperations, supabaseId: string) => {
  const bySupabase = await findUserByField(payloadOps, 'supabaseId', supabaseId);
  if (bySupabase.totalDocs === 0 || !bySupabase.docs[0]) {
    return { status: 'not_found' as const };
  }

  const existing = bySupabase.docs[0] as { id?: string };
  await payloadOps.delete({
    collection: USERS_COLLECTION,
    id: existing.id,
    overrideAccess: true,
  });

  return { status: 'removed' as const };
};

export const handleSupabaseAdminSync = async (
  req: AdminSyncRequest,
  res: AdminSyncResponse
) => {
  const secret = process.env.SUPABASE_ADMIN_SYNC_SECRET;
  if (!secret) {
    console.warn('SUPABASE_ADMIN_SYNC_SECRET is not configured.');
  }

  const headerSecret = req.headers[SUPABASE_SYNC_SECRET_HEADER];
  if (!secret || headerSecret !== secret) {
    return res
      .status(401)
      .json({ error: 'Unauthorized webhook request for Payload admin sync.' });
  }

  const payload = req.body as SyncPayload | undefined;
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ error: 'Invalid payload.' });
  }

  const { action, profile } = payload;
  if (!action || !profile) {
    return res.status(400).json({ error: 'Action and profile are required.' });
  }

  if (action === 'promote') {
    if (!isNonEmptyString(profile.user_id) || !isNonEmptyString(profile.email)) {
      return res.status(400).json({ error: 'Profile is missing required fields.' });
    }

    const result = await promoteUser(req.payload, {
      user_id: profile.user_id,
      email: profile.email,
      name: isNonEmptyString(profile.name) ? profile.name : profile.email,
    });

    return res.status(200).json({ result: result.status });
  }

  if (action === 'demote') {
    if (!isNonEmptyString(profile.user_id)) {
      return res.status(400).json({ error: 'Profile is missing user identifier.' });
    }

    const result = await demoteUser(req.payload, profile.user_id);
    return res.status(200).json({ result: result.status });
  }

  return res.status(400).json({ error: `Unsupported action: ${action}` });
};

export const supabaseAdminSyncEndpoint: Endpoint = {
  path: '/hooks/supabase/admin-sync',
  method: 'post',
  handler: (req, res) => {
    void handleSupabaseAdminSync(req as AdminSyncRequest, res as AdminSyncResponse);
  },
};

export { SUPABASE_SYNC_SECRET_HEADER };
export type { SyncPayload };
