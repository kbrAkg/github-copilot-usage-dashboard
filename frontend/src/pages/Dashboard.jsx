import { useState, useEffect } from 'react';
import { Box, Grid, CircularProgress, Alert } from '@mui/material';
import { getEnterpriseMetrics } from '../api';
import SummaryCard from '../components/charts/SummaryCard';
import DauTrendChart from '../components/charts/DauTrendChart';
import CompletionsChart from '../components/charts/CompletionsChart';
import FeatureDistributionChart from '../components/charts/FeatureDistributionChart';
import LocChart from '../components/charts/LocChart';
import MetricToggles, { METRICS } from '../components/MetricToggles';

const DEFAULT_ENABLED = Object.fromEntries(METRICS.map((m) => [m.key, true]));

export default function Dashboard({ slug, selectedDay }) {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enabled, setEnabled] = useState(DEFAULT_ENABLED);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getEnterpriseMetrics(slug, selectedDay)
      .then((res) => setMetrics(res.data.metrics))
      .catch((err) => {
        const status = err.response?.status;
        if (status === 403) setError('Token does not have sufficient permissions (403).');
        else if (status === 404) setError('Enterprise not found (404).');
        else setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [slug, selectedDay]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  if (!metrics.length) return <Alert severity="info" sx={{ mt: 2 }}>No metrics data available.</Alert>;

  // Aggregate summary from latest day
  const latest = metrics[metrics.length - 1];
  const totalSuggestions = metrics.reduce((s, m) => s + m.total_code_suggestions, 0);
  const totalAcceptances = metrics.reduce((s, m) => s + m.total_code_acceptances, 0);
  const acceptanceRate = totalSuggestions > 0 ? ((totalAcceptances / totalSuggestions) * 100).toFixed(1) : 0;

  // Feature distribution pie data (from latest day)
  const featurePie = (latest.totals_by_feature || []).map((f) => ({
    name: f.feature,
    value: f.total_engaged_users,
  }));

  return (
    <Box>
      <MetricToggles enabled={enabled} onChange={setEnabled} />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {enabled.dau && (
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <SummaryCard title="DAU" value={latest.copilot_dau} color="#1976d2" />
          </Grid>
        )}
        {enabled.wau && (
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <SummaryCard title="WAU" value={latest.copilot_wau} color="#9c27b0" />
          </Grid>
        )}
        {enabled.mau && (
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <SummaryCard title="MAU" value={latest.copilot_mau} color="#ed6c02" />
          </Grid>
        )}
        {enabled.acceptanceRate && (
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <SummaryCard title="Acceptance Rate" value={`${acceptanceRate}%`} color="#2e7d32" />
          </Grid>
        )}
        {enabled.totalRequests && (
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <SummaryCard title="Total Requests" value={totalSuggestions} color="#0288d1" />
          </Grid>
        )}
      </Grid>

      <Grid container spacing={2}>
        {enabled.dauTrend && (
          <Grid size={{ xs: 12 }}>
            <DauTrendChart data={metrics} />
          </Grid>
        )}
        {enabled.completions && (
          <Grid size={{ xs: 12, md: 6 }}>
            <CompletionsChart data={metrics} />
          </Grid>
        )}
        {enabled.featureDist && (
          <Grid size={{ xs: 12, md: 6 }}>
            <FeatureDistributionChart data={featurePie} />
          </Grid>
        )}
        {enabled.loc && (
          <Grid size={{ xs: 12 }}>
            <LocChart data={metrics} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
