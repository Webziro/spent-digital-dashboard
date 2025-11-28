import { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { useTimeline } from 'src/hooks/use-timeline';

import { _posts } from 'src/_mock';
import { fetchPrograms } from 'src/api/programs';
import { fetchResearch } from 'src/api/research';
import { fetchPublications } from 'src/api/publications';
import { DashboardContent } from 'src/layouts/dashboard';

import { AnalyticsOrderTimeline } from '../analytics-order-timeline';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { AnalyticsPublication } from '../analytics-recent-publications';


// ----------------------------------------------------------------------

export function OverviewAnalyticsView() {
  const [researchTotal, setResearchTotal] = useState<number | null>(null);
  const [researchPercent, setResearchPercent] = useState<number | null>(null);
  const [publicationsTotal, setPublicationsTotal] = useState<number | null>(null);
  const [publicationsPercent, setPublicationsPercent] = useState<number | null>(null);
  const [programsTotal, setProgramsTotal] = useState<number | null>(null);
  const [programsPercent, setProgramsPercent] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Fetch all data in parallel
        const [researchList, publicationsList, programsList] = await Promise.all([
          fetchResearch(),
          fetchPublications(),
          fetchPrograms(),
        ]);

        if (!mounted) return;

        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;
        const period = 7 * day; // 7-day window
        const recentCutoff = now - period;
        const prevCutoff = now - period * 2;

        const getDate = (item: any) => Date.parse(item.createdAt ?? item.publishedDate ?? '');

        // Helper to compute total and percent
        const computeMetrics = (list: any[]) => {
          const total = Array.isArray(list) ? list.length : 0;
          const recent = list.filter((r: any) => {
            const t = getDate(r);
            return !isNaN(t) && t >= recentCutoff;
          }).length;
          const prev = list.filter((r: any) => {
            const t = getDate(r);
            return !isNaN(t) && t >= prevCutoff && t < recentCutoff;
          }).length;

          let percent = 0;
          if (prev === 0) {
            percent = recent > 0 ? 100 : 0;
          } else {
            percent = ((recent - prev) / prev) * 100;
          }
          return { total, percent: Number(percent.toFixed(1)) };
        };

        const researchMetrics = computeMetrics(researchList);
        const publicationsMetrics = computeMetrics(publicationsList);
        const programsMetrics = computeMetrics(programsList);

        setResearchTotal(researchMetrics.total);
        setResearchPercent(researchMetrics.percent);
        setPublicationsTotal(publicationsMetrics.total);
        setPublicationsPercent(publicationsMetrics.percent);
        setProgramsTotal(programsMetrics.total);
        setProgramsPercent(programsMetrics.percent);
      } catch (err) {
        console.error('Failed to fetch analytics data', err);
        if (mounted) {
          setResearchTotal(0);
          setResearchPercent(0);
          setPublicationsTotal(0);
          setPublicationsPercent(0);
          setProgramsTotal(0);
          setProgramsPercent(0);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hi, Welcome back Admin! 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Researches"
            percent={researchPercent ?? 0}
            total={researchTotal ?? 0}
            icon={<img alt="Researches" src="/assets/icons/glass/ic-glass-researches.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [22, 8, 35, 50, 82, 84, 77, 12],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Publications"
            percent={publicationsPercent ?? 0}
            total={publicationsTotal ?? 0}
            color="secondary"
            icon={<img alt="Publications" src="/assets/icons/glass/ic-glass-publications.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [56, 47, 40, 62, 73, 30, 23, 54],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Programs"
            percent={programsPercent ?? 0}
            total={programsTotal ?? 0}
            color="warning"
            icon={<img alt="Programs" src="/assets/icons/glass/ic-glass-programs.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [40, 70, 50, 28, 70, 75, 7, 64],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Partners"
            percent={3.6}
            total={234}
            color="error"
            icon={<img alt="Partners" src="/assets/icons/glass/ic-glass-partners.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [56, 30, 23, 54, 47, 40, 62, 73],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsPublication title="Recent Publications" list={_posts.slice(0, 5)} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          {/* Use live timeline data (falls back to mock on error) */}
          <LiveTimeline />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}

function LiveTimeline() {
  const { items } = useTimeline(5);
  return <AnalyticsOrderTimeline title="Research timeline" list={items} />;
}
