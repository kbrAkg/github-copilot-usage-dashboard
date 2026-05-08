import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import OrganizationView from './pages/OrganizationView';
import UserView from './pages/UserView';
import ModelUsage from './pages/ModelUsage';
import SettingsPage from './pages/Settings';
import { getSettings } from './api';

const theme = createTheme({
  palette: { mode: 'light' },
});

export default function App() {
  const [settings, setSettings] = useState(null);
  const [selectedDay, setSelectedDay] = useState('');

  useEffect(() => {
    getSettings()
      .then((res) => setSettings(res.data))
      .catch(() => {
        setSettings({
          enterprise_slug: 'my-enterprise',
          organizations: ['org-alpha', 'org-beta', 'org-gamma'],
          mock_mode: true,
        });
      });
  }, []);

  const slug = settings?.enterprise_slug || 'my-enterprise';
  const orgs = settings?.organizations || [];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <Layout settings={settings} selectedDay={selectedDay} onDayChange={setSelectedDay} />
            }
          >
            <Route index element={<Dashboard slug={slug} selectedDay={selectedDay} />} />
            <Route path="organization" element={<OrganizationView organizations={orgs} selectedDay={selectedDay} />} />
            <Route path="users" element={<UserView slug={slug} selectedDay={selectedDay} />} />
            <Route path="models" element={<ModelUsage slug={slug} selectedDay={selectedDay} />} />
            <Route path="settings" element={<SettingsPage onSettingsChange={setSettings} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
