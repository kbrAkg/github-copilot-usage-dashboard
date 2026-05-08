import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Paper, Typography } from '@mui/material';

export default function LocChart({ data }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Lines of Code (Suggested vs Added)</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total_code_lines_suggested" fill="#ab47bc" name="LoC Suggested" />
          <Bar dataKey="total_code_lines_accepted" fill="#26a69a" name="LoC Added" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}
