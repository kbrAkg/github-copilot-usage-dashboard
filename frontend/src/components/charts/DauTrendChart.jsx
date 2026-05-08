import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Paper, Typography } from '@mui/material';

export default function DauTrendChart({ data }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Daily Active Users (28-day trend)</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="copilot_dau" stroke="#1976d2" name="DAU" strokeWidth={2} />
          <Line type="monotone" dataKey="copilot_wau" stroke="#9c27b0" name="WAU" strokeWidth={1} dot={false} />
          <Line type="monotone" dataKey="copilot_mau" stroke="#ed6c02" name="MAU" strokeWidth={1} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}
