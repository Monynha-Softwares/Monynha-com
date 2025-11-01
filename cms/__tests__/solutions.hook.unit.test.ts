import { jest } from '@jest/globals';

const mockQuery = jest.fn();
const mockLogCmsSyncEvent = jest.fn().mockResolvedValue(undefined);

jest.mock('../src/utilities/pool', () => ({
  pool: { query: mockQuery },
}));

jest.mock('../src/utilities/monitoring', () => ({
  logCmsSyncEvent: mockLogCmsSyncEvent,
}));

describe('Solutions afterChange hook', () => {
  beforeEach(() => {
    mockQuery.mockReset();
    mockLogCmsSyncEvent.mockClear();
  });

  it('persists solution payloads and backfills the Supabase ID', async () => {
    const { default: Solutions } = await import('../src/collections/Solutions');
    const hook = Solutions.hooks?.afterChange?.[0];
    expect(typeof hook).toBe('function');

    const generatedId = 'c3b6f1d1-8a44-4efb-9f2a-d7faacb3b561';
    mockQuery.mockResolvedValue({ rows: [{ id: generatedId }] });

    const update = jest.fn().mockResolvedValue(undefined);

    await hook?.({
      doc: {
        id: 'payload-doc-id',
        supabaseId: null,
        slug: 'demo-solution',
        title: { en: 'AI Consulting', 'pt-BR': 'Consultoria IA' },
        description: { en: 'Helping teams deliver AI responsibly.' },
        image: { url: 'https://cdn.example.com/img.png' },
        features: [
          { content: { en: 'Feature one', 'pt-BR': 'Recurso 1' } },
          { value: { en: 'Second capability' } },
          '  ',
        ],
        active: true,
        gradient: 'from-brand-blue to-brand-purple',
      },
      req: { payload: { update } },
    });

    expect(mockQuery).toHaveBeenCalledTimes(1);
    const [queryText, params] = mockQuery.mock.calls[0];
    expect(queryText).toContain('insert into public.solutions');
    expect(Array.isArray(params)).toBe(true);
    expect(params[0]).toBe('demo-solution');
    expect(JSON.parse(params[4] as string)).toEqual([
      'Recurso 1',
      'Second capability',
    ]);

    expect(update).toHaveBeenCalledWith({
      collection: 'solutions',
      id: 'payload-doc-id',
      data: { supabaseId: generatedId },
      depth: 0,
    });

    expect(mockLogCmsSyncEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'solutions',
        status: 'success',
        supabaseId: generatedId,
        metadata: expect.objectContaining({ 
          slug: 'demo-solution',
          title: 'Consultoria IA',
          description: 'Helping teams deliver AI responsibly.',
          features: JSON.stringify(['Recurso 1', 'Second capability']),
          active: true,
          gradient: 'from-brand-blue to-brand-purple',
        }),
      })
    );
  });

  it('logs failures before surfacing the error', async () => {
    const { default: Solutions } = await import('../src/collections/Solutions');
    const hook = Solutions.hooks?.afterChange?.[0];
    const thrown = new Error('database is offline');
    mockQuery.mockRejectedValueOnce(thrown);

    await expect(
      hook?.({
        doc: {
          id: 'payload-doc-id',
          supabaseId: '70dd7c75-028d-412c-82d7-3eeb5c4ce355',
          slug: 'failing-solution',
          title: { en: 'Broken sync' },
          description: { en: 'This will fail.' },
          features: [],
          active: false,
        },
        req: {},
      })
    ).rejects.toThrow('database is offline');

    expect(mockLogCmsSyncEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'solutions',
        status: 'error',
        message: 'database is offline',
        supabaseId: '70dd7c75-028d-412c-82d7-3eeb5c4ce355',
      })
    );
  });
});
