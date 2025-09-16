import { jest } from '@jest/globals';

jest.mock('@/integrations/supabase', () => ({
  getSupabaseBrowserClient: jest.fn(() => {
    throw new Error('getSupabaseBrowserClient should not be used in tests');
  }),
  clearSupabaseAuthCookies: jest.fn(),
  createSupabaseServerClient: jest.fn(),
  createSupabaseServiceRoleClient: jest.fn(),
}));

import {
  fetchActiveSolutions,
  fetchSolutionBySlug,
} from '../solutions';
import { fetchActiveRepositories } from '../repositories';
import { fetchPublishedBlogPosts } from '../blogPosts';
import { fetchActiveHomepageFeatures } from '../homepageFeatures';
import { fetchActiveTeamMembers } from '../teamMembers';
import { fetchProfileByUserId } from '../profiles';
import { createLead, fetchLeadsForAdmin } from '../leads';
import {
  subscribeToNewsletter,
  fetchNewsletterSubscribersForAdmin,
} from '../newsletterSubscribers';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

interface BuilderOverrides {
  selectResult?: { data: unknown; error: unknown };
  maybeSingleResult?: { data: unknown; error: unknown };
  insertResult?: { data?: unknown; error: unknown };
}

type TypedClient = SupabaseClient<Database>;

type BuilderMock = {
  select: jest.Mock;
  eq: jest.Mock;
  order: jest.Mock;
  limit: jest.Mock;
  maybeSingle: jest.Mock;
  insert: jest.Mock;
  then: (onFulfilled: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) => Promise<unknown>;
  catch: (onRejected: (reason: unknown) => unknown) => Promise<unknown>;
};

const createQueryBuilderMock = (overrides?: BuilderOverrides) => {
  const selectResult = overrides?.selectResult ?? { data: [], error: null };
  const maybeSingleResult = overrides?.maybeSingleResult ?? { data: null, error: null };
  const insertResult = overrides?.insertResult ?? { data: null, error: null };

  const builder: Partial<BuilderMock> = {};

  builder.select = jest.fn(() => builder);
  builder.eq = jest.fn(() => builder);
  builder.order = jest.fn(() => builder);
  builder.limit = jest.fn(() => builder);
  builder.maybeSingle = jest.fn(() => Promise.resolve(maybeSingleResult));
  builder.insert = jest.fn(() => Promise.resolve(insertResult));
  builder.then = (onFulfilled, onRejected) =>
    Promise.resolve(selectResult).then(onFulfilled, onRejected);
  builder.catch = (onRejected) => Promise.resolve(selectResult).catch(onRejected);

  return builder as BuilderMock;
};

const createSupabaseClientMock = (overrides?: BuilderOverrides) => {
  const builder = createQueryBuilderMock(overrides);
  const from = jest.fn(() => builder);
  return { client: ({ from } as unknown) as TypedClient, builder, from };
};

describe('Supabase query helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('applies active filter and ordering when fetching solutions', async () => {
    const { client, builder, from } = createSupabaseClientMock();

    await fetchActiveSolutions({ client, ascending: true });

    expect(from).toHaveBeenCalledWith('solutions');
    expect(builder.select).toHaveBeenCalledWith(
      'id, title, description, slug, image_url, features, active, created_at, updated_at'
    );
    expect(builder.eq).toHaveBeenCalledWith('active', true);
    expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: true });
  });

  it('applies limit when provided for solutions', async () => {
    const { client, builder } = createSupabaseClientMock();

    await fetchActiveSolutions({ client, limit: 2 });

    expect(builder.limit).toHaveBeenCalledWith(2);
  });

  it('filters solutions by slug and active status', async () => {
    const { client, builder, from } = createSupabaseClientMock({
      maybeSingleResult: { data: null, error: null },
    });

    await fetchSolutionBySlug('demo-slug', client);

    expect(from).toHaveBeenCalledWith('solutions');
    expect(builder.eq.mock.calls).toContainEqual(['slug', 'demo-slug']);
    expect(builder.eq.mock.calls).toContainEqual(['active', true]);
  });

  it('filters active repositories sorted by creation date', async () => {
    const { client, builder, from } = createSupabaseClientMock();

    await fetchActiveRepositories({ client, ascending: false });

    expect(from).toHaveBeenCalledWith('repositories');
    expect(builder.eq).toHaveBeenCalledWith('active', true);
    expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('fetches published blog posts ordered by update date', async () => {
    const { client, builder, from } = createSupabaseClientMock();

    await fetchPublishedBlogPosts(client);

    expect(from).toHaveBeenCalledWith('blog_posts');
    expect(builder.eq).toHaveBeenCalledWith('published', true);
    expect(builder.order).toHaveBeenCalledWith('updated_at', { ascending: false });
  });

  it('filters homepage features by active status and order index', async () => {
    const { client, builder, from } = createSupabaseClientMock();

    await fetchActiveHomepageFeatures(client);

    expect(from).toHaveBeenCalledWith('homepage_features');
    expect(builder.eq).toHaveBeenCalledWith('active', true);
    expect(builder.order).toHaveBeenCalledWith('order_index', { ascending: true });
  });

  it('fetches active team members ordered by creation date', async () => {
    const { client, builder, from } = createSupabaseClientMock();

    await fetchActiveTeamMembers(client);

    expect(from).toHaveBeenCalledWith('team_members');
    expect(builder.eq).toHaveBeenCalledWith('active', true);
    expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: true });
  });

  it('fetches profile by user id respecting RLS', async () => {
    const { client, builder, from } = createSupabaseClientMock({
      maybeSingleResult: { data: null, error: null },
    });

    await fetchProfileByUserId('user-123', client);

    expect(from).toHaveBeenCalledWith('profiles');
    expect(builder.eq).toHaveBeenCalledWith('user_id', 'user-123');
  });

  it('sanitizes and inserts leads through public endpoint', async () => {
    const { client, builder, from } = createSupabaseClientMock({
      insertResult: { data: null, error: null },
    });

    await createLead(
      {
        name: ' Jane Doe ',
        email: ' jane@example.com ',
        message: ' Interested in a project ',
        company: ' ',
        project: 'Automation',
      },
      client
    );

    expect(from).toHaveBeenCalledWith('leads');
    expect(builder.insert).toHaveBeenCalledWith([
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Interested in a project',
        company: null,
        project: 'Automation',
      },
    ]);
  });

  it('uses service role client to fetch leads for admins', async () => {
    const { client, builder, from } = createSupabaseClientMock();

    await fetchLeadsForAdmin(client);

    expect(from).toHaveBeenCalledWith('leads');
    expect(builder.select).toHaveBeenCalledWith(
      'id, name, email, company, project, message, created_at'
    );
    expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('subscribes newsletter users with trimmed email', async () => {
    const { client, builder, from } = createSupabaseClientMock({
      insertResult: { data: null, error: null },
    });

    await subscribeToNewsletter(' user@example.com ', client);

    expect(from).toHaveBeenCalledWith('newsletter_subscribers');
    expect(builder.insert).toHaveBeenCalledWith([
      {
        email: 'user@example.com',
      },
    ]);
  });

  it('fetches newsletter subscribers ordered by subscription date', async () => {
    const { client, builder, from } = createSupabaseClientMock();

    await fetchNewsletterSubscribersForAdmin(client);

    expect(from).toHaveBeenCalledWith('newsletter_subscribers');
    expect(builder.select).toHaveBeenCalledWith('id, email, active, subscribed_at');
    expect(builder.order).toHaveBeenCalledWith('subscribed_at', { ascending: false });
  });
});
