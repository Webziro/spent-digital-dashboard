import { useMemo } from 'react';

import { useLatestResearch } from './use-latest-research';

export type TimelineItem = {
  id: string;
  title: string;
  type: string;
  time: string;
};

export function useTimeline(limit = 5) {
  const { items, loading, error } = useLatestResearch(limit);

  const timeline = useMemo(
    () =>
      items.map((it) => ({
        id: it._id ?? it.title,
        title: it.title,
        type: 'research',
        time: it.createdAt ?? new Date().toISOString(),
      })),
    [items]
  );

  return { items: timeline, loading, error } as const;
}
