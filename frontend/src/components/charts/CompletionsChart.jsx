import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Paper, Typography } from '@mui/material';

export default function CompletionsChart({ data }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Code Completions (Suggested vs Accepted)</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total_code_suggestions" fill="#42a5f5" name="Suggested" />
          <Bar dataKey="total_code_acceptances" fill="#66bb6a" name="Accepted" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}
