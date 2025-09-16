import { fetchActiveHomepageFeatures } from '@/lib/homepageFeatures';
import { fetchPublishedBlogPosts, fetchPublishedBlogPostBySlug } from '@/lib/blogPosts';
import { fetchActiveRepositories } from '@/lib/repositories';
import {
  fetchActiveSolutionBySlug,
  fetchActiveSolutions,
} from '@/lib/solutions';
import { fetchActiveTeamMembers } from '@/lib/teamMembers';
import { createLead, fetchAllLeads } from '@/lib/leads';
import { fetchNewsletterSubscribers, subscribeToNewsletter } from '@/lib/newsletter';
import type { SupabaseClient } from '@/integrations/supabase';

type QueryResponse<T> = {
  data: T;
  error: null;
};

type MaybeResponse<T> = {
  data: T;
  error: null;
};

class MockQueryBuilder<T> {
  public readonly select = jest.fn(() => this);
  public readonly eq = jest.fn((column: string, value: unknown) => {
    this.eqCalls.push({ column, value });
    return this;
  });
  public readonly order = jest.fn(() => this);
  public readonly limit = jest.fn(() => this);
  public readonly maybeSingle = jest.fn(async () => this.maybeSingleResponse);
  public readonly eqCalls: Array<{ column: string; value: unknown }> = [];

  constructor(
    private readonly response: QueryResponse<T>,
    private readonly maybeSingleResponse: MaybeResponse<T extends unknown[] ? T[number] | null : T | null>
  ) {}

  then<TResult1 = QueryResponse<T>, TResult2 = never>(
    onfulfilled?:
      | ((value: QueryResponse<T>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.response).then(onfulfilled, onrejected);
  }
}

const createSelectClient = <T>(
  response: QueryResponse<T>,
  maybeSingleResponse: MaybeResponse<T extends unknown[] ? T[number] | null : T | null> = {
    data: null,
    error: null,
  }
) => {
  const builder = new MockQueryBuilder<T>(response, maybeSingleResponse);
  const client = {
    from: jest.fn(() => builder),
  } as unknown as SupabaseClient;

  return { client, builder };
};

const createInsertClient = () => {
  const insert = jest.fn(async () => ({ data: null, error: null }));
  const client = {
    from: jest.fn(() => ({ insert })),
  } as unknown as SupabaseClient;

  return { client, insert };
};

describe('typed Supabase queries', () => {
  it('fetchActiveSolutions enforces RLS filter', async () => {
    const { client, builder } = createSelectClient({ data: [], error: null });

    await fetchActiveSolutions({}, client);

    expect(builder.eq).toHaveBeenCalledWith('active', true);
  });

  it('fetchActiveSolutionBySlug filters by slug and active', async () => {
    const { client, builder } = createSelectClient({ data: [], error: null });

    await fetchActiveSolutionBySlug('test-slug', client);

    expect(builder.eq).toHaveBeenNthCalledWith(1, 'active', true);
    expect(builder.eq).toHaveBeenNthCalledWith(2, 'slug', 'test-slug');
    expect(builder.maybeSingle).toHaveBeenCalled();
  });

  it('fetchActiveRepositories enforces active filter', async () => {
    const { client, builder } = createSelectClient({ data: [], error: null });

    await fetchActiveRepositories({}, client);

    expect(builder.eq).toHaveBeenCalledWith('active', true);
  });

  it('fetchActiveHomepageFeatures enforces active filter', async () => {
    const { client, builder } = createSelectClient({ data: [], error: null });

    await fetchActiveHomepageFeatures(client);

    expect(builder.eq).toHaveBeenCalledWith('active', true);
  });

  it('fetchActiveTeamMembers enforces active filter', async () => {
    const { client, builder } = createSelectClient({ data: [], error: null });

    await fetchActiveTeamMembers(client);

    expect(builder.eq).toHaveBeenCalledWith('active', true);
  });

  it('fetchPublishedBlogPosts enforces published filter', async () => {
    const { client, builder } = createSelectClient({ data: [], error: null });

    await fetchPublishedBlogPosts({}, client);

    expect(builder.eq).toHaveBeenCalledWith('published', true);
  });

  it('fetchPublishedBlogPostBySlug filters by slug and published', async () => {
    const { client, builder } = createSelectClient({ data: [], error: null });

    await fetchPublishedBlogPostBySlug('example', client);

    expect(builder.eq).toHaveBeenNthCalledWith(1, 'published', true);
    expect(builder.eq).toHaveBeenNthCalledWith(2, 'slug', 'example');
    expect(builder.maybeSingle).toHaveBeenCalled();
  });

  it('createLead normalizes optional values', async () => {
    const { client, insert } = createInsertClient();

    await createLead(
      {
        name: 'Test',
        email: 'test@example.com',
        company: '',
        project: undefined,
        message: 'Hello',
      },
      client
    );

    expect(insert).toHaveBeenCalledWith([
      {
        name: 'Test',
        email: 'test@example.com',
        company: null,
        project: null,
        message: 'Hello',
      },
    ]);
  });

  it('subscribeToNewsletter lowercases the email', async () => {
    const { client, insert } = createInsertClient();

    await subscribeToNewsletter(' USER@Example.com ', client);

    expect(insert).toHaveBeenCalledWith([
      {
        email: 'user@example.com',
      },
    ]);
  });

  it('fetchAllLeads requires privileged client', async () => {
    const { client, builder } = createSelectClient({ data: [], error: null });

    await fetchAllLeads(client);

    expect((client as unknown as { from: jest.Mock }).from).toHaveBeenCalledWith(
      'leads'
    );
    expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('fetchNewsletterSubscribers uses privileged client', async () => {
    const { client, builder } = createSelectClient({ data: [], error: null });

    await fetchNewsletterSubscribers(client);

    expect(
      (client as unknown as { from: jest.Mock }).from
    ).toHaveBeenCalledWith('newsletter_subscribers');
    expect(builder.order).toHaveBeenCalledWith('subscribed_at', { ascending: false });
  });
});
