import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value by a specified delay.
 * Useful for delaying search queries, filter changes, or auto-save operations.
 *
 * @param value The value to be debounced (e.g. search string)
 * @param delayMs Delay time in milliseconds (default: 400ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delayMs: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
