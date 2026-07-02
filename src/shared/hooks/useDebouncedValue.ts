import { useEffect, useState } from 'react';

/**
 * Debounces a fast-changing value (typically text input) so expensive
 * derived work — filtering, ranking, network calls — only runs once the
 * user pauses, keeping list scrolling and keystrokes smooth on lower-end
 * Android devices in particular.
 */
export function useDebouncedValue<T>(value: T, delayMs = 150): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
