import {
  handleSupabaseAdminSync,
  SUPABASE_SYNC_SECRET_HEADER,
} from '../endpoints/supabaseAdminSync';

type MockResponse = {
  statusCode?: number;
  body?: unknown;
};

type RequestType = Parameters<typeof handleSupabaseAdminSync>[0];
type ResponseType = Parameters<typeof handleSupabaseAdminSync>[1];

describe('Payload admin sync endpoint', () => {
  beforeEach(() => {
    process.env.SUPABASE_ADMIN_SYNC_SECRET = 'secret-token';
  });

  const createMockReqRes = (body: unknown, header?: string) => {
    const payloadOps = {
      find: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      forgotPassword: jest.fn(),
    };

    const responseState: MockResponse = {};

    const res: Partial<ResponseType> = {
      status: (code: number) => {
        responseState.statusCode = code;
        return res as ResponseType;
      },
      json: (data: unknown) => {
        responseState.body = data;
        return res as ResponseType;
      },
    };

    const req: Partial<RequestType> = {
      headers: {
        [SUPABASE_SYNC_SECRET_HEADER]: header,
      } as Record<string, string | undefined>,
      body,
      payload: payloadOps,
    };

    return {
      req: req as RequestType,
      res: res as ResponseType,
      ops: payloadOps,
      responseState,
    };
  };

  it('rejects requests without the shared secret', async () => {
    const { req, res, responseState } = createMockReqRes({});
    await handleSupabaseAdminSync(req, res);
    expect(responseState.statusCode).toBe(401);
  });

  it('creates a new Payload user when promoting an admin', async () => {
    const { req, res, ops, responseState } = createMockReqRes(
      {
        action: 'promote',
        profile: {
          user_id: 'supabase-user',
          email: 'admin@example.com',
          name: 'Admin',
        },
      },
      'secret-token'
    );

    ops.find.mockResolvedValue({ docs: [], totalDocs: 0 });

    await handleSupabaseAdminSync(req, res);

    expect(ops.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'users',
        data: expect.objectContaining({ email: 'admin@example.com', supabaseId: 'supabase-user' }),
      })
    );
    expect(responseState).toEqual({ statusCode: 200, body: { result: 'created' } });
  });

  it('updates existing Payload user when supabaseId matches', async () => {
    const { req, res, ops, responseState } = createMockReqRes(
      {
        action: 'promote',
        profile: {
          user_id: 'supabase-user',
          email: 'admin@example.com',
          name: 'Admin',
        },
      },
      'secret-token'
    );

    ops.find.mockResolvedValueOnce({ docs: [{ id: 'payload-user' }], totalDocs: 1 });

    await handleSupabaseAdminSync(req, res);

    expect(ops.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'payload-user',
        data: expect.objectContaining({ role: 'admin' }),
      })
    );
    expect(responseState.body).toEqual({ result: 'updated' });
  });

  it('removes Payload user when demoting an admin', async () => {
    const { req, res, ops, responseState } = createMockReqRes(
      {
        action: 'demote',
        profile: {
          user_id: 'supabase-user',
          email: 'admin@example.com',
          name: 'Admin',
        },
      },
      'secret-token'
    );

    ops.find.mockResolvedValue({ docs: [{ id: 'payload-user' }], totalDocs: 1 });

    await handleSupabaseAdminSync(req, res);

    expect(ops.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'payload-user',
      })
    );
    expect(responseState.body).toEqual({ result: 'removed' });
  });
});
