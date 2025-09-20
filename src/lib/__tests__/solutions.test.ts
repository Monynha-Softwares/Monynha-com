import type { GitHubRepository } from '@/lib/solutions';
import {
  fetchSupabaseSolutions,
  getFallbackSolution,
  getFallbackSolutions,
  mapGitHubRepoToContent,
  mapSupabaseSolutionToContent,
} from '@/lib/solutions';
import { fallbackSolutions, gradientOptions } from '@/data/solutions';
import type { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase';

type SupabaseSolutionRow = Database['public']['Tables']['solutions']['Row'];

const mockOrder = jest.fn();
const mockEq = jest.fn();
const mockSelect = jest.fn();

jest.mock('@/integrations/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockedSupabase = supabase as jest.Mocked<typeof supabase>;

describe('solutions library', () => {
  beforeEach(() => {
    mockOrder.mockReset();
    mockEq.mockReset();
    mockSelect.mockReset();
    mockedSupabase.from.mockReset();
  });

  it('maps GitHub repositories using fallback metadata and deduplicated features', () => {
    const repository: GitHubRepository = {
      id: 1,
      name: 'assistina',
      description: '   ',
      homepage: 'https://assistina.ai',
      topics: ['AI', 'AI ', 'automation'],
      language: 'TypeScript',
      private: false,
      archived: false,
      disabled: false,
      visibility: 'public',
      default_branch: 'main',
      stargazers_count: 25,
      watchers_count: 25,
      open_issues_count: 3,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: 'invalid-date',
      pushed_at: 'invalid-date',
      html_url: 'https://github.com/monynha/assistina',
    };

    const content = mapGitHubRepoToContent(repository, 1);

    expect(content).toMatchObject({
      id: '1',
      slug: 'assistina',
      title: 'AssisTina AI',
      description:
        'Intelligent AI assistant that learns your business processes and automates routine tasks, increasing efficiency and productivity.',
      externalUrl: 'https://github.com/monynha/assistina',
      gradient: fallbackSolutions[1].gradient,
      imageUrl: fallbackSolutions[1].imageUrl,
    });

    expect(content.features).toEqual([
      'AI',
      'automation',
      'Built with TypeScript.',
      'Live project: https://assistina.ai',
      '25 ⭐ stars on GitHub',
      '3 open issues',
      'Default branch: main',
    ]);
  });

  it('uses fallback information when Supabase rows do not provide features', () => {
    const supabaseRow: SupabaseSolutionRow = {
      id: 'row-1',
      slug: 'assistina',
      title: 'Custom title from Supabase',
      description: 'Supabase description',
      features: '[]',
      image_url: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
      active: true,
    };

    const content = mapSupabaseSolutionToContent(supabaseRow, 4);

    expect(content).toEqual({
      id: 'row-1',
      slug: 'assistina',
      title: 'Custom title from Supabase',
      description: 'Supabase description',
      imageUrl: fallbackSolutions[1].imageUrl,
      features: [...fallbackSolutions[1].features],
      gradient: fallbackSolutions[1].gradient,
      externalUrl: null,
    });

    expect(content.features).not.toBe(fallbackSolutions[1].features);
  });

  it('normalizes Supabase feature payloads and cycles gradients when needed', () => {
    const supabaseRow: SupabaseSolutionRow = {
      id: 'row-2',
      slug: 'custom-solution',
      title: 'Custom solution',
      description: 'Provided description',
      features: JSON.stringify(['Feature from DB', 'Feature from DB', 42, true, '', null]),
      image_url: 'https://example.com/image.png',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
      active: true,
    };

    const content = mapSupabaseSolutionToContent(supabaseRow, { index: 5 });

    expect(content).toEqual({
      id: 'row-2',
      slug: 'custom-solution',
      title: 'Custom solution',
      description: 'Provided description',
      imageUrl: 'https://example.com/image.png',
      features: ['Feature from DB', '42', 'true'],
      gradient: gradientOptions[1],
      externalUrl: null,
    });
  });

  it('returns isolated fallback entries', () => {
    const fallback = fallbackSolutions.find((solution) => solution.slug === 'assistina');
    expect(fallback).toBeDefined();

    const result = getFallbackSolution('assistina');

    expect(result).toEqual(fallback);
    expect(result).not.toBe(fallback);

    result?.features.push('New feature');
    expect(fallback?.features).not.toContain('New feature');

    const allFallbacks = getFallbackSolutions();
    expect(allFallbacks).toHaveLength(fallbackSolutions.length);
    allFallbacks.forEach((entry, index) => {
      expect(entry).toEqual(fallbackSolutions[index]);
      expect(entry).not.toBe(fallbackSolutions[index]);
      expect(entry.features).not.toBe(fallbackSolutions[index].features);
    });
  });

  it('fetches Supabase solutions and maps them correctly', async () => {
    const supabaseRow: SupabaseSolutionRow = {
      id: 'row-3',
      slug: 'custom-solution',
      title: 'From Supabase',
      description: 'Description',
      features: ['Direct feature'],
      image_url: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
      active: true,
    };

    mockedSupabase.from.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: [supabaseRow], error: null });

    const result = await fetchSupabaseSolutions();

    expect(mockedSupabase.from).toHaveBeenCalledWith('solutions');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockEq).toHaveBeenCalledWith('active', true);
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: true });

    expect(result).toEqual([
      {
        id: 'row-3',
        slug: 'custom-solution',
        title: 'From Supabase',
        description: 'Description',
        imageUrl: null,
        features: ['Direct feature'],
        gradient: gradientOptions[0],
        externalUrl: null,
      },
    ]);
  });

  it('throws when Supabase returns an error', async () => {
    mockedSupabase.from.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({ data: null, error: { message: 'failed to fetch' } });

    await expect(fetchSupabaseSolutions()).rejects.toThrow('failed to fetch');
  });
});
