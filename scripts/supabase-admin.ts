#!/usr/bin/env tsx
import { getSupabaseServiceRoleClient } from '@/integrations/supabase';
import { fetchAllLeads } from '@/lib/leads';
import { fetchNewsletterSubscribers } from '@/lib/newsletter';

type Command = 'leads' | 'subscribers' | 'help';

const printHelp = () => {
  console.log(`Usage: tsx scripts/supabase-admin.ts <command>

Commands:
  leads         List all contact form leads (requires service role).
  subscribers   List newsletter subscribers (requires service role).
`);
};

const resolveCommand = (value: string | undefined): Command => {
  if (!value || value === '--help' || value === '-h') {
    return 'help';
  }

  if (value === 'leads' || value === 'subscribers') {
    return value;
  }

  return 'help';
};

const run = async () => {
  const command = resolveCommand(process.argv[2]);

  if (command === 'help') {
    printHelp();
    return;
  }

  const client = getSupabaseServiceRoleClient();

  switch (command) {
    case 'leads': {
      const leads = await fetchAllLeads(client);
      console.table(leads);
      break;
    }
    case 'subscribers': {
      const subscribers = await fetchNewsletterSubscribers(client);
      console.table(subscribers);
      break;
    }
  }
};

run().catch((error) => {
  console.error('Supabase admin command failed:', error);
  process.exit(1);
});
