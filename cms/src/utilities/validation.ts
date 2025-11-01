/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Shared validation and normalization utilities for CMS collections
 */

/**
 * Normalizes and validates a URL string
 * @param value - The value to normalize
 * @returns The normalized URL string or null if invalid
 */
export const normalizeUrl = (value: unknown): string | null => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  try {
    const parsed = new URL(value.trim());
    return parsed.toString();
  } catch {
    return null;
  }
};

/**
 * Normalizes and validates an email address
 * @param value - The value to normalize
 * @returns The normalized email string or null if invalid
 */
export const normalizeEmail = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim().toLowerCase();
  if (trimmed.length === 0) {
    return null;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(trimmed) ? trimmed : null;
};

/**
 * Extracts and normalizes tags from an array or object
 * Handles multiple formats: objects with label/value/tag properties or plain strings
 * @param tags - The tags array to extract from
 * @param resolver - Optional function to resolve localized text
 * @returns Array of unique, normalized tag strings
 */
export const extractTags = (
  tags: any,
  resolver?: (value: any) => string
): string[] => {
  if (!Array.isArray(tags)) {
    return [];
  }

  const unique = new Set<string>();

  for (const tag of tags) {
    let value: string | null = null;

    if (tag && typeof tag === 'object') {
      if ('label' in tag) {
        value = resolver ? resolver(tag.label).trim() : String(tag.label).trim();
      } else if ('value' in tag) {
        value = resolver ? resolver(tag.value).trim() : String(tag.value).trim();
      } else if ('tag' in tag) {
        value = resolver ? resolver(tag.tag).trim() : String(tag.tag).trim();
      }
    } else if (typeof tag === 'string') {
      value = tag.trim();
    }

    if (value && value.length > 0) {
      unique.add(value);
    }
  }

  return Array.from(unique);
};

/**
 * Extracts a list of features/items from an array
 * Handles multiple formats: objects with content/value/label properties or plain strings
 * @param features - The features array to extract from
 * @param resolver - Optional function to resolve localized text
 * @returns Array of feature strings
 */
export const extractFeatureList = (
  features: any,
  resolver?: (value: any) => string | null
): string[] => {
  if (!Array.isArray(features)) {
    return [];
  }

  const values = features
    .map((feature) => {
      if (feature && typeof feature === 'object') {
        if ('content' in feature) {
          return resolver ? resolver(feature.content) : String(feature.content || '');
        }

        if ('value' in feature) {
          return resolver ? resolver(feature.value) : String(feature.value || '');
        }

        if ('label' in feature) {
          return resolver ? resolver(feature.label) : String(feature.label || '');
        }
      }

      return resolver ? resolver(feature) : String(feature || '');
    })
    .filter((item): item is string => Boolean(item && item.trim().length > 0));

  return values;
};

/**
 * Serializes a value for JSON storage in the database
 * If value is already a JSON string, returns it as-is
 * Otherwise, stringifies the value
 * @param value - The value to serialize
 * @returns JSON string representation of the value
 */
export const serializeValue = (value: any): string => {
  if (typeof value === 'string') {
    try {
      JSON.parse(value);
      return value;
    } catch {
      return JSON.stringify(value);
    }
  }

  if (value === null || value === undefined) {
    return JSON.stringify({});
  }

  return JSON.stringify(value);
};
