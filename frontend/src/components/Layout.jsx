import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar, AppBar, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Sidebar from './Sidebar';
import DateRangePicker from './DateRangePicker';

const DRAWER_WIDTH = 240;

export default function Layout({ settings, selectedDay, onDayChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: 0 }}>
            <Box
              component="img"
              src="/favicon.svg"
              alt="GitHub Copilot logo"
              sx={{ width: 26, height: 26, mr: 1.2, flexShrink: 0 }}
            />
            <Typography variant="h6" noWrap>
              Copilot Usage Dashboard
            </Typography>
          </Box>
          {settings && (
            <Typography variant="body2" sx={{ mr: 2, opacity: 0.8 }}>
              {settings.mock_mode ? '🔶 Mock Mode' : '🟢 Live'}
            </Typography>
          )}
          <DateRangePicker selectedDay={selectedDay} onDayChange={onDayChange} />
        </Toolbar>
      </AppBar>
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
