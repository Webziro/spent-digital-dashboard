import type { Research } from 'src/sections/research/view/manage-research-view';

import { useState, useEffect } from 'react';

import { getLatestResearch } from 'src/api/research';

export function useLatestResearch(limit = 5) {
  const [items, setItems] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getLatestResearch(limit)
      .then((data) => {
        if (!mounted) return;
        setItems(data);
      })
      .catch((err: any) => {
        if (!mounted) return;
        setError(err?.message ?? String(err));
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [limit]);

  return { items, loading, error } as const;
}

