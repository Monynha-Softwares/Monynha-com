import type { Lead } from '@/lib/leads';
import type { NewsletterSubscriber } from '@/lib/newsletter-subscribers';

export interface AdminDashboardData {
  leads: Lead[];
  newsletterSubscribers: NewsletterSubscriber[];
}

export const fetchAdminDashboardData = async (
  accessToken: string
): Promise<AdminDashboardData> => {
  if (!accessToken) {
    throw new Error('Missing access token for admin dashboard request.');
  }

  const response = await fetch('/api/admin-dashboard', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload?.error) {
        message = payload.error;
      }
    } catch {
      // Ignore JSON parsing errors and use the default message
    }

    throw new Error(message);
  }

  const data = (await response.json()) as AdminDashboardData;

  return {
    leads: data.leads ?? [],
    newsletterSubscribers: data.newsletterSubscribers ?? [],
  };
};
