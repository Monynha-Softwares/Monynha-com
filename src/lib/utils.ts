import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Type guard to check if value is a non-empty string
 */
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

/**
 * Normalizes a value to an array of strings
 * Handles JSON strings, arrays, and objects with an 'options' property
 * @param value - The value to normalize
 * @returns An array of unique non-empty strings
 */
export const normalizeToStringArray = (value: unknown): string[] => {
  if (value === null || value === undefined) {
    return [];
  }

  let parsedValue = value;

  // Try to parse JSON string
  if (typeof parsedValue === 'string') {
    const trimmedValue = parsedValue.trim();
    if (!trimmedValue) {
      return [];
    }

    try {
      parsedValue = JSON.parse(trimmedValue);
    } catch {
      return [trimmedValue];
    }
  }

  // Handle arrays
  if (Array.isArray(parsedValue)) {
    return Array.from(
      new Set(
        parsedValue
          .filter(isNonEmptyString)
          .map((item) => item.trim())
      )
    );
  }

  // Handle objects with 'options' or 'stats' property
  if (typeof parsedValue === 'object' && parsedValue !== null) {
    const record = parsedValue as Record<string, unknown>;
    if (Array.isArray(record.options)) {
      return Array.from(
        new Set(
          record.options
            .filter(isNonEmptyString)
            .map((item) => item.trim())
        )
      );
    }
  }

  return [];
};

/**
 * Normalizes a value to an array of typed objects
 * @param value - The value to normalize
 * @param validator - Function to validate and transform each item
 * @returns An array of validated objects
 */
export const normalizeToTypedArray = <T>(
  value: unknown,
  validator: (item: unknown) => T | null
): T[] => {
  if (!value) {
    return [];
  }

  let parsedValue: unknown = value;

  // Try to parse JSON string
  if (typeof parsedValue === 'string') {
    try {
      parsedValue = JSON.parse(parsedValue);
    } catch {
      return [];
    }
  }

  // Handle arrays
  if (Array.isArray(parsedValue)) {
    return parsedValue
      .map(validator)
      .filter((item): item is T => item !== null);
  }

  // Handle objects with nested arrays
  if (typeof parsedValue === 'object' && parsedValue !== null) {
    const record = parsedValue as Record<string, unknown>;
    if (Array.isArray(record.stats)) {
      return normalizeToTypedArray(record.stats, validator);
    }
    if (Array.isArray(record.options)) {
      return normalizeToTypedArray(record.options, validator);
    }
  }

  return [];
};
