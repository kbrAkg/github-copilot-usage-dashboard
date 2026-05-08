import { useState, useEffect } from 'react';
import {
  Box, CircularProgress, Alert, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Grid, Chip, Accordion, AccordionSummary,
  AccordionDetails, Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GroupsIcon from '@mui/icons-material/Groups';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getOrgMetrics, getOrgTeams, getTeamMetrics } from '../api';

const COLORS = ['#1976d2', '#9c27b0', '#ed6c02'];

export default function OrganizationView({ organizations, selectedDay }) {
  const [orgData, setOrgData] = useState({});
  const [teamsData, setTeamsData] = useState({});       // { org: [TeamInfo] }
  const [teamMetrics, setTeamMetrics] = useState({});   // { "org/slug": [metrics] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load org metrics + teams list
  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all(
      organizations.map((org) =>
        Promise.all([
          getOrgMetrics(org, selectedDay)
            .then((res) => ({ org, metrics: res.data.metrics }))
            .catch(() => ({ org, metrics: [] })),
          getOrgTeams(org)
            .then((res) => ({ org, teams: res.data.teams }))
            .catch(() => ({ org, teams: [] })),
        ])
      )
    )
      .then((results) => {
        const data = {};
        const teams = {};
        results.forEach(([metricsResult, teamsResult]) => {
          data[metricsResult.org] = metricsResult.metrics;
          teams[teamsResult.org] = teamsResult.teams;
        });
        setOrgData(data);
        setTeamsData(teams);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [organizations, selectedDay]);

  // Load team metrics when a team accordion is expanded
  const handleTeamExpand = (org, teamSlug, expanded) => {
    if (!expanded) return;
    const key = `${org}/${teamSlug}`;
    if (teamMetrics[key]) return; // already loaded
    getTeamMetrics(org, teamSlug, selectedDay)
      .then((res) => setTeamMetrics((prev) => ({ ...prev, [key]: res.data.metrics })))
      .catch(() => setTeamMetrics((prev) => ({ ...prev, [key]: [] })));
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;

  // Build comparison table
  const summary = organizations.map((org) => {
    const metrics = orgData[org] || [];
    const latest = metrics[metrics.length - 1];
    const totalSuggestions = metrics.reduce((s, m) => s + m.total_code_suggestions, 0);
    const totalAcceptances = metrics.reduce((s, m) => s + m.total_code_acceptances, 0);
    return {
      org,
      dau: latest?.copilot_dau || 0,
      mau: latest?.copilot_mau || 0,
      totalSuggestions,
      totalAcceptances,
      acceptanceRate: totalSuggestions > 0 ? ((totalAcceptances / totalSuggestions) * 100).toFixed(1) : '0',
    };
  });

  // Build comparison bar chart data
  const barData = summary.map((s) => ({
    name: s.org,
    DAU: s.dau,
    'Total Suggestions': s.totalSuggestions,
    'Total Acceptances': s.totalAcceptances,
  }));

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Organization Comparison</Typography>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Organization</strong></TableCell>
              <TableCell align="right"><strong>DAU</strong></TableCell>
              <TableCell align="right"><strong>MAU</strong></TableCell>
              <TableCell align="right"><strong>Suggestions</strong></TableCell>
              <TableCell align="right"><strong>Acceptances</strong></TableCell>
              <TableCell align="right"><strong>Acceptance %</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {summary.map((s) => (
              <TableRow key={s.org}>
                <TableCell>{s.org}</TableCell>
                <TableCell align="right">{s.dau}</TableCell>
                <TableCell align="right">{s.mau}</TableCell>
                <TableCell align="right">{s.totalSuggestions.toLocaleString()}</TableCell>
                <TableCell align="right">{s.totalAcceptances.toLocaleString()}</TableCell>
                <TableCell align="right">{s.acceptanceRate}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Org Comparison</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Total Suggestions" fill={COLORS[0]} />
            <Bar dataKey="Total Acceptances" fill={COLORS[1]} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Team Metrics Section */}
      <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>Team Metrics</Typography>
      {organizations.map((org) => {
        const teams = teamsData[org] || [];
        return (
          <Paper key={org} sx={{ mb: 2, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <GroupsIcon color="primary" />
              <Typography variant="h6">{org}</Typography>
              <Chip label={`${teams.length} team${teams.length !== 1 ? 's' : ''}`} size="small" />
            </Box>
            {teams.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No teams configured for this organization.</Typography>
            ) : (
              teams.map((team) => {
                const key = `${org}/${team.slug}`;
                const metrics = teamMetrics[key];
                const totalSuggestions = metrics ? metrics.reduce((s, m) => s + m.total_code_suggestions, 0) : null;
                const totalAcceptances = metrics ? metrics.reduce((s, m) => s + m.total_code_acceptances, 0) : null;
                const totalChatTurns = metrics ? metrics.reduce((s, m) => s + m.total_chat_turns, 0) : null;
                const latestDau = metrics && metrics.length > 0 ? metrics[metrics.length - 1].copilot_dau : null;
                const acceptanceRate = totalSuggestions > 0
                  ? ((totalAcceptances / totalSuggestions) * 100).toFixed(1)
                  : '0';

                return (
                  <Accordion
                    key={team.slug}
                    onChange={(_, expanded) => handleTeamExpand(org, team.slug, expanded)}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', flexWrap: 'wrap' }}>
                        <Typography fontWeight={600}>{team.name}</Typography>
                        {team.description && (
                          <Typography variant="body2" color="text.secondary">{team.description}</Typography>
                        )}
                        {metrics && (
                          <Box sx={{ ml: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip label={`DAU: ${latestDau}`} size="small" color="primary" variant="outlined" />
                            <Chip label={`Suggestions: ${totalSuggestions?.toLocaleString()}`} size="small" variant="outlined" />
                            <Chip label={`Acceptance: ${acceptanceRate}%`} size="small" color="success" variant="outlined" />
                          </Box>
                        )}
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      {!metrics ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : metrics.length === 0 ? (
                        <Alert severity="info">No metrics available for this team.</Alert>
                      ) : (
                        <Box>
                          <Grid container spacing={2} sx={{ mb: 2 }}>
                            {[
                              { label: 'Latest DAU', value: latestDau },
                              { label: 'Total Suggestions', value: totalSuggestions?.toLocaleString() },
                              { label: 'Total Acceptances', value: totalAcceptances?.toLocaleString() },
                              { label: 'Acceptance Rate', value: `${acceptanceRate}%` },
                              { label: 'Chat Turns', value: totalChatTurns?.toLocaleString() },
                              { label: 'Days with Data', value: metrics.length },
                            ].map(({ label, value }) => (
                              <Grid item xs={6} sm={4} md={2} key={label}>
                                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                                  <Typography variant="h6" fontWeight={700}>{value}</Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                          <Divider sx={{ mb: 2 }} />
                          <Typography variant="subtitle2" gutterBottom>Daily Trend (Suggestions vs Acceptances)</Typography>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={metrics.slice(-14).map((m) => ({
                              date: m.date.slice(5),
                              Suggestions: m.total_code_suggestions,
                              Acceptances: m.total_code_acceptances,
                            }))}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="Suggestions" fill={COLORS[0]} />
                              <Bar dataKey="Acceptances" fill={COLORS[1]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                );
              })
            )}
          </Paper>
        );
      })}
    </Box>
  );
}
