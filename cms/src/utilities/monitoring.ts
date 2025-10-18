/* eslint-disable @typescript-eslint/no-explicit-any */

export type CmsSyncStatus = 'success' | 'error';

export interface CmsSyncEvent {
  collection: string;
  action: 'upsert' | 'delete';
  payloadId?: string | number | null;
  supabaseId?: string | null;
  status: CmsSyncStatus;
  message?: string;
  metadata?: Record<string, any>;
}

const OBSERVABILITY_WEBHOOK_URL = process.env.CMS_OBSERVABILITY_WEBHOOK_URL;
const OBSERVABILITY_DASHBOARD_URL = process.env.CMS_OBSERVABILITY_DASHBOARD_URL;

const safeStringify = (value: unknown) => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    return `"[unserializable payload: ${error instanceof Error ? error.message : 'unknown'}]"`;
  }
};

const toPlainObject = (event: CmsSyncEvent) => ({
  ...event,
  dashboardUrl: OBSERVABILITY_DASHBOARD_URL ?? null,
  timestamp: new Date().toISOString(),
});

export const logCmsSyncEvent = async (event: CmsSyncEvent) => {
  const entry = toPlainObject(event);
  const prefix = `[CMS Sync:${event.collection}]`;

  if (event.status === 'error') {
    console.error(prefix, event.message ?? 'Sync failed', event.metadata ?? {});
  } else {
    console.info(prefix, event.message ?? 'Sync completed', event.metadata ?? {});
  }

  if (!OBSERVABILITY_WEBHOOK_URL) {
    return;
  }

  try {
    await fetch(OBSERVABILITY_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: safeStringify(entry),
    });
  } catch (error) {
    console.warn(`${prefix} Unable to notify observability webhook`, error);
  }
};
