import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Switch, FormControlLabel, Alert,
  Chip, CircularProgress, Divider, Grid,
} from '@mui/material';
import { getSettings, updateSettings, testConnection } from '../api';

export default function Settings({ onSettingsChange }) {
  const [form, setForm] = useState({
    enterprise_slug: '',
    organizations: [],
    mock_mode: true,
    github_token: '',
  });
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveResult, setSaveResult] = useState(null);

  useEffect(() => {
    getSettings()
      .then((res) => {
        setCurrent(res.data);
        setForm({
          enterprise_slug: res.data.enterprise_slug,
          organizations: res.data.organizations,
          mock_mode: res.data.mock_mode,
          github_token: '',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = () => {
    setSaving(true);
    setSaveResult(null);
    const payload = { ...form };
    if (!payload.github_token) delete payload.github_token; // Don't clear token if empty
    updateSettings(payload)
      .then((res) => {
        setCurrent(res.data);
        setSaveResult({ type: 'success', msg: 'Settings saved.' });
        onSettingsChange?.(res.data);
      })
      .catch((err) => setSaveResult({ type: 'error', msg: err.message }))
      .finally(() => setSaving(false));
  };

  const handleTest = () => {
    setTesting(true);
    setTestResult(null);
    testConnection()
      .then((res) => setTestResult(res.data))
      .catch((err) => setTestResult({ status: 'error', message: err.message }))
      .finally(() => setTesting(false));
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Settings</Typography>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Enterprise Slug"
              value={form.enterprise_slug}
              onChange={(e) => setForm({ ...form, enterprise_slug: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Organizations (comma-separated)"
              value={form.organizations.join(', ')}
              onChange={(e) => setForm({
                ...form,
                organizations: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              })}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              type="password"
              label="GitHub Token"
              placeholder={current?.token_set ? 'Token is set (enter new to replace)' : 'Enter GitHub token'}
              value={form.github_token}
              onChange={(e) => setForm({ ...form, github_token: e.target.value })}
              helperText={current?.token_set ? `Current: ${current.token_masked}` : 'No token set'}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.mock_mode}
                  onChange={(e) => setForm({ ...form, mock_mode: e.target.checked })}
                />
              }
              label="Mock Mode (use generated data)"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
          <Button variant="outlined" onClick={handleTest} disabled={testing}>
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
        </Box>

        {saveResult && (
          <Alert severity={saveResult.type} sx={{ mt: 2 }}>{saveResult.msg}</Alert>
        )}

        {testResult && (
          <Alert severity={testResult.status === 'ok' ? 'success' : 'error'} sx={{ mt: 2 }}>
            {testResult.status === 'ok'
              ? `Connection successful! User: ${testResult.user || testResult.message || ''}`
              : `Connection failed: ${testResult.message || JSON.stringify(testResult)}`}
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
