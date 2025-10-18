import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../Dashboard';
import type { Tables } from '@/integrations/supabase/types';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => jest.fn(),
  };
});

const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const mockSignOut = jest.fn();
const mockUseAuth = jest.fn();
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockFrom = jest.fn();
const mockRpc = jest.fn();
const mockMfaList = jest.fn();

jest.mock('@/integrations/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    rpc: (...args: unknown[]) => mockRpc(...args),
    auth: {
      mfa: {
        listFactors: (...args: unknown[]) => mockMfaList(...args),
      },
    },
  },
}));

describe('Dashboard role-based data loading', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'user@example.com' },
      session: { user: { id: 'user-1' } },
      isLoading: false,
      signOut: mockSignOut,
    });

    mockMfaList.mockResolvedValue({ data: { totp: [] }, error: null });
  });

  it('fetches admin data via RPC when profile role is admin', async () => {
    const adminProfile: Tables<'profiles'> = {
      id: 'profile-1',
      user_id: 'user-1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: adminProfile, error: null }),
            }),
          }),
        };
      }
      throw new Error(`Unexpected table ${table}`);
    });

    mockRpc.mockResolvedValue({
      data: {
        leads: [
          {
            id: 'lead-1',
            name: 'Lead One',
            email: 'lead@example.com',
            message: 'Hello',
            company: null,
            project: null,
            created_at: new Date().toISOString(),
          },
        ],
        newsletter_subscribers: [],
      },
      error: null,
    });

    render(<Dashboard />);

    await waitFor(() => expect(mockRpc).toHaveBeenCalledWith('get_admin_dashboard_data'));
    expect(await screen.findByText('Leads')).toBeInTheDocument();
    expect(screen.getByText('Lead One')).toBeInTheDocument();
  });

  it('avoids RPC call when profile is a standard user', async () => {
    const userProfile: Tables<'profiles'> = {
      id: 'profile-2',
      user_id: 'user-1',
      email: 'user@example.com',
      name: 'Regular User',
      role: 'user',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: userProfile, error: null }),
            }),
          }),
        };
      }
      throw new Error(`Unexpected table ${table}`);
    });

    render(<Dashboard />);

    await waitFor(() => expect(mockRpc).not.toHaveBeenCalled());
    expect(screen.queryByText('Leads')).not.toBeInTheDocument();
  });
});
