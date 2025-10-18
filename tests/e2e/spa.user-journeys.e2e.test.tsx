import React from 'react';
import { jest } from '@jest/globals';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelmetProvider } from 'react-helmet-async';

const mockFetchSolutions = jest.fn();
const mockFetchHomepageFeatures = jest.fn();
const mockFetchLocalizedCopy = jest.fn();
const mockFetchContactInfo = jest.fn();
const mockFetchProjectTypes = jest.fn();
const mockFetchTeamMembers = jest.fn();
const mockCreateLead = jest.fn();

const mockSupabase = {
  auth: {
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
    getSession: jest.fn(() =>
      Promise.resolve({ data: { session: { user: null } } })
    ),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
  },
};

jest.mock('@/integrations/supabase', () => ({
  supabase: mockSupabase,
  clearSupabaseSession: jest.fn(),
  AUTH_STORAGE_KEY: 'auth_token',
}));

jest.mock('@/hooks/useAuth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({ user: null, session: null, isLoading: false, signOut: jest.fn() }),
}));

jest.mock('@/lib/data/supabase', () => {
  const actual = jest.requireActual('@/lib/data/supabase');
  return {
    ...actual,
    fetchSolutions: (...args: unknown[]) => mockFetchSolutions(...args),
    fetchHomepageFeatures: (...args: unknown[]) =>
      mockFetchHomepageFeatures(...args),
    fetchLocalizedCopy: (...args: unknown[]) =>
      mockFetchLocalizedCopy(...args),
    fetchContactInfo: (...args: unknown[]) => mockFetchContactInfo(...args),
    fetchProjectTypes: (...args: unknown[]) =>
      mockFetchProjectTypes(...args),
    fetchTeamMembers: (...args: unknown[]) =>
      mockFetchTeamMembers(...args),
    createLead: (...args: unknown[]) => mockCreateLead(...args),
  };
});

import App from '@/App';

const actUserEvent = async <T,>(operation: () => Promise<T>) => {
  await act(async () => {
    await operation();
  });
};

describe('SPA user journey', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockFetchLocalizedCopy.mockResolvedValue(null);
    mockFetchHomepageFeatures.mockResolvedValue([
      {
        id: 'feature-1',
        title: 'Rapid onboarding',
        description: 'Launch quicker with our experts.',
        icon: 'Zap',
        url: null,
        order_index: 0,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    const homeSolutions = [
      {
        id: 'sol-1',
        slug: 'ai-ops',
        title: 'AI Ops Automation',
        description: 'Streamline observability with tailored AI.',
        imageUrl: null,
        features: ['Proactive runbooks'],
        gradient: 'from-brand-blue to-brand-purple',
      },
      {
        id: 'sol-2',
        slug: 'boteco-pro',
        title: 'Boteco Pro',
        description: 'Hospitality tooling built for growth.',
        imageUrl: null,
        features: [],
        gradient: 'from-brand-purple to-brand-blue',
      },
    ];

    const listingSolutions = [
      ...homeSolutions,
      {
        id: 'sol-3',
        slug: 'assistina',
        title: 'AssisTina AI',
        description: 'AI copilots for inclusive customer support.',
        imageUrl: 'https://cdn.example.com/assistina.png',
        features: ['Live translation', 'Bias detection'],
        gradient: 'from-brand-pink to-brand-orange',
      },
    ];

    mockFetchSolutions.mockImplementation((options?: Record<string, unknown>) => {
      if (options && 'limit' in options) {
        return Promise.resolve(homeSolutions);
      }

      return Promise.resolve(listingSolutions);
    });

    mockFetchTeamMembers.mockResolvedValue([
      {
        id: 'tm-1',
        name: 'Jo Dev',
        role: 'Principal Engineer',
        bio: 'Leading the platform guild.',
        image_url: null,
        linkedin_url: null,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    mockFetchContactInfo.mockResolvedValue({
      email: 'hello@monynha.com',
      phone: '+55 11 99999-0000',
    });

    mockFetchProjectTypes.mockResolvedValue([
      'AI Integrations',
      'Automation Accelerator',
    ]);

    mockCreateLead.mockResolvedValue(undefined);
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: null } },
    });
  });

  it('navigates from the homepage to the solutions catalog and submits the contact form', async () => {
    window.history.pushState({}, '', '/');
    const user = userEvent.setup();

    await act(async () => {
      render(
        <HelmetProvider>
          <App />
        </HelmetProvider>
      );
    });

    await waitFor(() => expect(mockFetchHomepageFeatures).toHaveBeenCalled());
    await waitFor(() => expect(mockFetchSolutions).toHaveBeenCalled());

    const projectCtas = await screen.findAllByRole('link', {
      name: /start your project/i,
    });
    expect(projectCtas.length).toBeGreaterThan(0);

    const solutionsLinks = screen.getAllByRole('link', { name: /solutions/i });
    await actUserEvent(() => user.click(solutionsLinks[0]));

    await waitFor(() =>
      expect(mockFetchSolutions).toHaveBeenCalledWith(
        expect.objectContaining({ orderAscending: false })
      )
    );

    expect(
      await screen.findByRole('heading', {
        name: /ai ops automation/i,
      })
    ).toBeInTheDocument();

    const contactLinks = screen.getAllByRole('link', { name: /contact/i });
    await actUserEvent(() => user.click(contactLinks[0]));

    const nameInput = await screen.findByLabelText(/full name/i);
    await actUserEvent(() => user.type(nameInput, 'Alex Example'));
    await actUserEvent(() =>
      user.type(screen.getByLabelText(/email address/i), 'alex@example.com')
    );
    await actUserEvent(() =>
      user.type(screen.getByLabelText(/company name/i), 'Example Corp')
    );
    await actUserEvent(() =>
      user.type(
        screen.getByLabelText(/project details/i),
        'Building an inclusive analytics dashboard.'
      )
    );

    await actUserEvent(() =>
      user.click(screen.getByRole('button', { name: /send message/i }))
    );

    await waitFor(() => expect(mockCreateLead).toHaveBeenCalledTimes(1));
    expect(mockCreateLead).toHaveBeenCalledWith({
      name: 'Alex Example',
      email: 'alex@example.com',
      company: 'Example Corp',
      project: null,
      message: 'Building an inclusive analytics dashboard.',
    });
  });
});
