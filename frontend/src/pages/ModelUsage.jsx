import { useState, useEffect } from 'react';
import {
  Box, CircularProgress, Alert, Paper, Typography, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { getEnterpriseMetrics } from '../api';

const COLORS = ['#1976d2', '#9c27b0', '#ed6c02', '#2e7d32', '#d32f2f', '#0288d1', '#f57c00', '#388e3c'];

export default function ModelUsage({ slug, selectedDay }) {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getEnterpriseMetrics(slug, selectedDay)
      .then((res) => setMetrics(res.data.metrics))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug, selectedDay]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  if (!metrics.length) return <Alert severity="info">No data</Alert>;

  // Aggregate model-feature data across all days
  const modelFeatureMap = {};
  metrics.forEach((day) => {
    (day.totals_by_model_feature || []).forEach((mf) => {
      const key = `${mf.model}|${mf.feature}`;
      if (!modelFeatureMap[key]) {
        modelFeatureMap[key] = { ...mf, total_engaged_users_sum: mf.total_engaged_users };
      } else {
        const agg = modelFeatureMap[key];
        agg.total_code_suggestions += mf.total_code_suggestions;
        agg.total_code_acceptances += mf.total_code_acceptances;
        agg.total_chat_turns += mf.total_chat_turns;
        agg.total_chat_acceptances += mf.total_chat_acceptances;
        agg.total_engaged_users_sum += mf.total_engaged_users;
      }
    });
  });
  const modelFeatureRows = Object.values(modelFeatureMap);

  // Pie chart: suggestions by model
  const modelSuggestionsMap = {};
  modelFeatureRows.forEach((r) => {
    modelSuggestionsMap[r.model] = (modelSuggestionsMap[r.model] || 0) + r.total_code_suggestions;
  });
  const modelPieData = Object.entries(modelSuggestionsMap).map(([name, value]) => ({ name, value }));

  // Language-model table
  const langModelMap = {};
  metrics.forEach((day) => {
    (day.totals_by_language_model || []).forEach((lm) => {
      const key = `${lm.language}|${lm.model}`;
      if (!langModelMap[key]) {
        langModelMap[key] = { ...lm };
      } else {
        const agg = langModelMap[key];
        agg.total_code_suggestions += lm.total_code_suggestions;
        agg.total_code_acceptances += lm.total_code_acceptances;
        agg.total_code_lines_suggested += lm.total_code_lines_suggested;
        agg.total_code_lines_accepted += lm.total_code_lines_accepted;
      }
    });
  });
  const langModelRows = Object.values(langModelMap);

  // Bar chart: model-feature totals
  const models = [...new Set(modelFeatureRows.map((r) => r.model))];
  const barData = models.map((model) => {
    const row = { model };
    modelFeatureRows.filter((r) => r.model === model).forEach((r) => {
      row[`${r.feature}_suggestions`] = r.total_code_suggestions;
      row[`${r.feature}_chat`] = r.total_chat_turns;
    });
    return row;
  });

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Model Usage Analysis</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Suggestions by Model</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={modelPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {modelPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Model-Feature Breakdown</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="code_completion_suggestions" fill={COLORS[0]} name="Completions" />
                <Bar dataKey="chat_chat" fill={COLORS[1]} name="Chat Turns" />
                <Bar dataKey="agent_chat" fill={COLORS[2]} name="Agent Turns" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>Language × Model Distribution</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Language</strong></TableCell>
              <TableCell><strong>Model</strong></TableCell>
              <TableCell align="right"><strong>Suggestions</strong></TableCell>
              <TableCell align="right"><strong>Acceptances</strong></TableCell>
              <TableCell align="right"><strong>LoC Suggested</strong></TableCell>
              <TableCell align="right"><strong>LoC Accepted</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {langModelRows.map((r, i) => (
              <TableRow key={i}>
                <TableCell>{r.language}</TableCell>
                <TableCell>{r.model}</TableCell>
                <TableCell align="right">{r.total_code_suggestions.toLocaleString()}</TableCell>
                <TableCell align="right">{r.total_code_acceptances.toLocaleString()}</TableCell>
                <TableCell align="right">{r.total_code_lines_suggested.toLocaleString()}</TableCell>
                <TableCell align="right">{r.total_code_lines_accepted.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
