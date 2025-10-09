import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000;
const cache = new Map<string, CacheEntry<any>>();

export function useProductCache<T>(
  query: string,
  key: string,
  fetchFn: () => Promise<{ data: T | null; error: any }>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const cached = cache.get(key);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_DURATION) {
        setData(cached.data);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const result = await fetchFn();
        if (result.error) throw result.error;

        cache.set(key, {
          data: result.data,
          timestamp: now,
        });

        setData(result.data);
        setError(null);
      } catch (err) {
        setError(err);
        console.error(`Error fetching ${key}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key]);

  return { data, loading, error };
}

export function clearCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}
