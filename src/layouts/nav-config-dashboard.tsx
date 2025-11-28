import { useState, useEffect } from 'react';

import { fetchResearch } from 'src/api/research';
import { fetchPrograms } from 'src/api/programs';
import { fetchPublications } from 'src/api/publications';

import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Research',
    path: '/manage-research',
    icon: icon('research'),
    info: <RecentResearchCount />,
  },
  {
    title: 'Publication',
    path: '/manage-publications',
    icon: icon('publication'),
    info: <RecentPublicationsCount />,
  },
  {
    title: 'Program',
    path: '/manage-programs',
    icon: icon('ic-user'),
    info: <RecentProgramsCount />,
  },
  {
    title: 'Partner',
    path: '# ',
    icon: icon('partners'),
  },
  {
    title: 'Event',
    path: '#',
    icon: icon('ic-disabled'),
  },




  // {
  //   title: 'Sign in',
  //   path: '/sign-in',
  //   icon: icon('ic-lock'),
  // },
  // {
  //   title: 'Not found',
  //   path: '/404',
  //   icon: icon('ic-disabled'),
  // },
];

function RecentPublicationsCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await fetchPublications();
        console.log('Publications fetched:', list);
        if (list.length > 0) {
          console.log('First publication:', list[0]);
        }
        const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours
        const recent = list.filter((p) => {
          const dateStr = (p.createdAt ?? p.publishedDate) || '';
          const t = Date.parse(dateStr);
          if (isNaN(t)) return false;
          return t >= cutoff;
        }).length;
        if (mounted) setCount(recent);
      } catch (err) {
        // failed to fetch — set zero
        if (mounted) setCount(0);
        console.error('RecentPublicationsCount fetch error', err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (count === null) return null;
  if (count === 0) return null;

  return (
    <Label color="error" variant="inverted">
      {`+${count}`}
    </Label>
  );
}

function RecentResearchCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await fetchResearch();
        console.log('Research fetched:', list);
        if (list.length > 0) {
          console.log('First research item:', list[0]);
          console.log('First research keys:', Object.keys(list[0]));
          list.forEach((item, idx) => {
            console.log(`Research[${idx}] createdAt:`, item.createdAt, 'type:', typeof item.createdAt);
          });
        }
        const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours
        const recent = list.filter((r) => {
          // Try createdAt, updated, updatedAt, publishedDate, or any date field
          const dateStr = (r.createdAt || (r as any).updated || (r as any).updatedAt || (r as any).publishedDate) ?? '';
          const t = Date.parse(dateStr);
          console.log(`Checking research "${(r as any).title || 'unknown'}": dateStr="${dateStr}", parsed=${t}, cutoff=${cutoff}, isRecent=${t >= cutoff}`);
          if (isNaN(t)) return false;
          return t >= cutoff;
        }).length;
        console.log('Recent research count:', recent);
        if (mounted) setCount(recent);
      } catch (err) {
        if (mounted) setCount(0);
        console.error('RecentResearchCount fetch error', err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (count === null) return null;
  if (count === 0) return null;

  return (
    <Label color="error" variant="inverted">
      {`+${count}`}
    </Label>
  );
}

function RecentProgramsCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await fetchPrograms();
        console.log('Programs fetched:', list);
        if (list.length > 0) {
          console.log('First program:', list[0]);
        }
        const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours
        const recent = list.filter((p) => {
          const dateStr = (p.createdAt ?? p.publishedDate) || '';
          const t = Date.parse(dateStr);
          if (isNaN(t)) return false;
          return t >= cutoff;
        }).length;
        if (mounted) setCount(recent);
      } catch (err) {
        if (mounted) setCount(0);
        console.error('RecentProgramsCount fetch error', err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (count === null) return null;
  if (count === 0) return null;

  return (
    <Label color="error" variant="inverted">
      {`+${count}`}
    </Label>
  );
}

