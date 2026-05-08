import {
  Box, Chip, Tooltip, Typography, Paper,
} from '@mui/material';

export const METRICS = [
  {
    key: 'dau',
    label: 'DAU',
    description: 'Daily Active Users — O gün en az bir Copilot özelliğini kullanan benzersiz kullanıcı sayısı.',
    color: '#1976d2',
  },
  {
    key: 'wau',
    label: 'WAU',
    description: 'Weekly Active Users — Son 7 günde Copilot kullanan benzersiz kullanıcı sayısı.',
    color: '#9c27b0',
  },
  {
    key: 'mau',
    label: 'MAU',
    description: 'Monthly Active Users — Son 30 günde Copilot kullanan benzersiz kullanıcı sayısı.',
    color: '#ed6c02',
  },
  {
    key: 'acceptanceRate',
    label: 'Acceptance Rate',
    description: 'Kabul Oranı — IDE\'de önerilen kodların kullanıcı tarafından kabul edilme yüzdesi.',
    color: '#2e7d32',
  },
  {
    key: 'totalRequests',
    label: 'Total Requests',
    description: 'Toplam İstek — Copilot\'a gönderilen toplam kod tamamlama isteği sayısı.',
    color: '#0288d1',
  },
  {
    key: 'dauTrend',
    label: 'DAU Trend',
    description: 'DAU Trend Grafiği — Günlük aktif, meşgul ve toplam kullanıcı sayısının zaman içindeki değişimi.',
    color: '#1976d2',
  },
  {
    key: 'completions',
    label: 'Code Completions',
    description: 'Kod Tamamlamaları — IDE\'de sunulan öneri ve kabul sayılarının günlük trendi.',
    color: '#388e3c',
  },
  {
    key: 'featureDist',
    label: 'Feature Distribution',
    description: 'Özellik Dağılımı — Kullanıcıların hangi Copilot özelliğini (completion, chat, agent) ne kadar kullandığının dağılımı.',
    color: '#f57c00',
  },
  {
    key: 'loc',
    label: 'Lines of Code',
    description: 'Kod Satırı — Copilot tarafından önerilen ve kabul edilen kod satırı sayısının günlük trendi.',
    color: '#0288d1',
  },
];

export default function MetricToggles({ enabled, onChange }) {
  const toggle = (key) => {
    onChange({ ...enabled, [key]: !enabled[key] });
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        Gösterilecek metrikleri seçin
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {METRICS.map(({ key, label, description, color }) => (
          <Tooltip key={key} title={description} placement="top" arrow>
            <Chip
              label={label}
              onClick={() => toggle(key)}
              variant={enabled[key] ? 'filled' : 'outlined'}
              sx={{
                backgroundColor: enabled[key] ? color : 'transparent',
                color: enabled[key] ? '#fff' : 'text.primary',
                borderColor: color,
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: enabled[key] ? color : `${color}22`,
                },
              }}
            />
          </Tooltip>
        ))}
      </Box>
    </Paper>
  );
}
