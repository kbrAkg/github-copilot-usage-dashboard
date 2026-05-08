import { useState, useEffect, useMemo } from 'react';
import {
  Box, CircularProgress, Alert, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TableSortLabel, TextField, Chip,
  Dialog, DialogTitle, DialogContent, IconButton, Grid, List, ListItem, ListItemText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getEnterpriseUsers } from '../api';

export default function UserView({ slug, selectedDay }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [orderBy, setOrderBy] = useState('loc_added_sum');
  const [order, setOrder] = useState('desc');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getEnterpriseUsers(slug, selectedDay)
      .then((res) => {
        // Aggregate users across days if no specific day selected
        const raw = res.data.users;
        if (!selectedDay) {
          const map = {};
          raw.forEach((u) => {
            if (!map[u.user_login]) {
              map[u.user_login] = { ...u };
            } else {
              const agg = map[u.user_login];
              agg.total_code_suggestions += u.total_code_suggestions;
              agg.total_code_acceptances += u.total_code_acceptances;
              agg.total_code_lines_suggested += u.total_code_lines_suggested;
              agg.total_code_lines_accepted += u.total_code_lines_accepted;
              agg.total_chat_turns += u.total_chat_turns;
              agg.code_generation_activity_count += u.code_generation_activity_count;
              agg.code_acceptance_activity_count += u.code_acceptance_activity_count;
              agg.loc_added_sum += u.loc_added_sum;
              agg.used_agent = agg.used_agent || u.used_agent;
              agg.used_chat = agg.used_chat || u.used_chat;
              agg.used_cli = agg.used_cli || u.used_cli;
            }
          });
          setUsers(Object.values(map));
        } else {
          setUsers(raw);
        }
      })
      .catch((err) => {
        const status = err.response?.status;
        if (status === 403) setError('Token does not have sufficient permissions (403).');
        else if (status === 404) setError('Enterprise not found (404).');
        else setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [slug, selectedDay]);

  const handleSort = (field) => {
    if (orderBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(field);
      setOrder('desc');
    }
  };

  const filtered = useMemo(() => {
    let list = [...users];
    if (filter) {
      list = list.filter((u) => u.user_login.toLowerCase().includes(filter.toLowerCase()));
    }
    list.sort((a, b) => {
      const av = a[orderBy] ?? 0;
      const bv = b[orderBy] ?? 0;
      return order === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return list;
  }, [users, filter, orderBy, order]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;

  const columns = [
    { id: 'user_login', label: 'User' },
    { id: 'code_generation_activity_count', label: 'Gen Activity' },
    { id: 'code_acceptance_activity_count', label: 'Accept Activity' },
    { id: 'loc_added_sum', label: 'LoC Added' },
    { id: 'total_code_suggestions', label: 'Suggestions' },
    { id: 'total_code_acceptances', label: 'Acceptances' },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>User Details</Typography>
      <TextField
        size="small"
        placeholder="Filter users..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        sx={{ mb: 2, width: 300 }}
      />

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id}>
                  <TableSortLabel
                    active={orderBy === col.id}
                    direction={orderBy === col.id ? order : 'asc'}
                    onClick={() => handleSort(col.id)}
                  >
                    <strong>{col.label}</strong>
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell><strong>Features</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((u) => (
              <TableRow
                key={u.user_login}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => setSelectedUser(u)}
              >
                <TableCell>{u.user_login}</TableCell>
                <TableCell>{u.code_generation_activity_count}</TableCell>
                <TableCell>{u.code_acceptance_activity_count}</TableCell>
                <TableCell>{u.loc_added_sum?.toLocaleString()}</TableCell>
                <TableCell>{u.total_code_suggestions?.toLocaleString()}</TableCell>
                <TableCell>{u.total_code_acceptances?.toLocaleString()}</TableCell>
                <TableCell>
                  {u.used_agent && <Chip label="Agent" size="small" color="primary" sx={{ mr: 0.5 }} />}
                  {u.used_chat && <Chip label="Chat" size="small" color="secondary" sx={{ mr: 0.5 }} />}
                  {u.used_cli && <Chip label="CLI" size="small" color="warning" />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* User detail dialog */}
      <Dialog open={!!selectedUser} onClose={() => setSelectedUser(null)} maxWidth="md" fullWidth>
        {selectedUser && (
          <>
            <DialogTitle>
              {selectedUser.user_login}
              <IconButton onClick={() => setSelectedUser(null)} sx={{ position: 'absolute', right: 8, top: 8 }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" gutterBottom>Feature Breakdown</Typography>
                  <List dense>
                    {(selectedUser.totals_by_feature || []).map((f, i) => (
                      <ListItem key={i}>
                        <ListItemText
                          primary={f.feature}
                          secondary={`Suggestions: ${f.total_code_suggestions} | Chat turns: ${f.total_chat_turns}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" gutterBottom>IDE Breakdown</Typography>
                  <List dense>
                    {(selectedUser.totals_by_ide || []).map((ide, i) => (
                      <ListItem key={i}>
                        <ListItemText
                          primary={ide.name}
                          secondary={`Suggestions: ${ide.total_code_suggestions} | Acceptances: ${ide.total_code_acceptances}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" gutterBottom>Language/Model Breakdown</Typography>
                  <List dense>
                    {(selectedUser.totals_by_language_model || []).map((lm, i) => (
                      <ListItem key={i}>
                        <ListItemText
                          primary={`${lm.language} / ${lm.model}`}
                          secondary={`Suggestions: ${lm.total_code_suggestions} | LoC: ${lm.total_code_lines_accepted}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                  {selectedUser.totals_by_cli && (
                    <>
                      <Typography variant="subtitle2" sx={{ mt: 1 }}>CLI Token Usage</Typography>
                      <Typography variant="body2">
                        Input: {selectedUser.totals_by_cli.token_usage?.input_tokens?.toLocaleString()} |
                        Output: {selectedUser.totals_by_cli.token_usage?.output_tokens?.toLocaleString()}
                      </Typography>
                    </>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}
