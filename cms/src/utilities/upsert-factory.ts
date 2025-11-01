/* eslint-disable @typescript-eslint/no-explicit-any */
import { pool } from './pool';
import { logCmsSyncEvent } from './monitoring';

/**
 * Configuration for the upsert factory
 */
export interface UpsertConfig {
  collectionName: string;
  tableName: string;
  extractData: (doc: any) => Record<string, any>;
  conflictFieldWithId?: string;
  conflictFieldWithoutId?: string;
  jsonbFields?: string[];
}

/**
 * Creates a reusable upsert hook for Payload CMS collections
 * This factory reduces code duplication across collection files
 */
export const createUpsertHook = (config: UpsertConfig) => {
  const {
    collectionName,
    tableName,
    extractData,
    conflictFieldWithId = 'id',
    conflictFieldWithoutId,
    jsonbFields = [],
  } = config;

  return async ({ doc, req }: { doc: any; req: any }) => {
    const supabaseId = doc.supabaseId ?? null;
    const data = extractData(doc);
    
    // Separate supabaseId from other data fields
    const { supabaseId: _, ...dataFields } = data;
    
    const fieldNames = Object.keys(dataFields);
    const fieldValues = Object.values(dataFields);

    // Build the field list for the INSERT clause
    const insertFields = fieldNames.join(', ');
    
    // Build the UPDATE clause (exclude conflict fields from updates)
    const updateFields = fieldNames
      .filter(f => f !== conflictFieldWithId && f !== conflictFieldWithoutId)
      .map(f => `${f}=excluded.${f}`)
      .join(',\n      ');

    // Build parameter placeholders with type casting for special fields
    const buildPlaceholders = (offset: number) =>
      fieldNames.map((fieldName, i) => {
        const paramNum = i + offset;
        // Handle JSONB fields
        if (jsonbFields.includes(fieldName)) {
          return `$${paramNum}::jsonb`;
        }
        return `$${paramNum}`;
      }).join(', ');

    let query: string;
    let params: any[];

    if (supabaseId) {
      // Insert with existing ID
      const placeholders = buildPlaceholders(2);
      query = `
        insert into public.${tableName} (id, ${insertFields})
        values ($1::uuid, ${placeholders})
        on conflict (${conflictFieldWithId}) do update set
          ${updateFields},
          updated_at=now()
        returning id`;
      params = [supabaseId, ...fieldValues];
    } else {
      // Insert without ID
      const placeholders = buildPlaceholders(1);
      const conflictField = conflictFieldWithoutId || conflictFieldWithId;
      query = `
        insert into public.${tableName} (${insertFields})
        values (${placeholders})
        on conflict (${conflictField}) do update set
          ${updateFields},
          updated_at=now()
        returning id`;
      params = fieldValues;
    }

    try {
      const result = await pool.query(query, params);
      const generatedId = result?.rows?.[0]?.id ?? null;

      // Update the Payload document with the generated Supabase ID
      if (!supabaseId && generatedId && req?.payload) {
        await req.payload.update({
          collection: collectionName,
          id: doc.id,
          data: { supabaseId: generatedId },
          depth: 0,
        });
      }

      await logCmsSyncEvent({
        collection: collectionName,
        action: 'upsert',
        payloadId: doc.id ?? null,
        supabaseId: (supabaseId ?? generatedId) ?? null,
        status: 'success',
        metadata: dataFields,
      });
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : `Unknown error while syncing ${collectionName}`;
      
      await logCmsSyncEvent({
        collection: collectionName,
        action: 'upsert',
        payloadId: doc.id ?? null,
        supabaseId,
        status: 'error',
        message,
        metadata: dataFields,
      });
      
      throw error;
    }
  };
};
