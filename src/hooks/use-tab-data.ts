'use client';

import { useState, useCallback, useRef } from 'react';

export function useTabData<T>(fetchUrl: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const load = useCallback(async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(fetchUrl);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      fetchedRef.current = false;
    } finally {
      setLoading(false);
    }
  }, [fetchUrl]);

  const refetch = useCallback(() => {
    fetchedRef.current = false;
    load();
  }, [load]);

  return { data, loading, error, load, refetch };
}
