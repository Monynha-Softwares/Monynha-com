import { jest } from '@jest/globals';
import { render, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Solutions from '@/pages/Solutions';
import { AuthProvider } from '@/hooks/useAuth';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}

expect.extend(toHaveNoViolations);

const queryClient = new QueryClient();

const mockSupabase = {
  auth: {
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
    getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
  },
};

jest.mock('@/integrations/supabase', () => ({
  supabase: mockSupabase,
  clearSupabaseSession: jest.fn(),
  AUTH_STORAGE_KEY: 'auth_token',
}));

const mockFetchSolutions = jest.fn();

jest.mock('@/lib/data/supabase', () => {
  const actual = jest.requireActual('@/lib/data/supabase');
  return {
    ...actual,
    fetchSolutions: (...args: unknown[]) => mockFetchSolutions(...args),
  };
});

describe('Solutions page accessibility', () => {
  beforeEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    mockFetchSolutions.mockResolvedValue([
      {
        id: 'sol-1',
        slug: 'ai-ops',
        title: 'AI Ops Automation',
        description: 'Streamline operations with applied AI.',
        imageUrl: 'https://cdn.example.com/ai-ops.png',
        features: ['Realtime anomaly detection', 'Human-in-the-loop guardrails'],
        gradient: 'from-brand-blue to-brand-purple',
      },
    ]);
  });

  it('renders without axe violations', async () => {
    const { container } = render(
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <MemoryRouter initialEntries={['/solutions']}>
              <Solutions />
            </MemoryRouter>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    );

    await waitFor(() => expect(mockFetchSolutions).toHaveBeenCalled());

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
