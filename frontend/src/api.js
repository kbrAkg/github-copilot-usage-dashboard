import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Enterprise metrics
export const getEnterpriseMetrics = (slug, day) => {
  const params = day ? { day } : {};
  return api.get(`/enterprise/${slug}/metrics`, { params });
};

export const getEnterpriseUsers = (slug, day) => {
  const params = day ? { day } : {};
  return api.get(`/enterprise/${slug}/users`, { params });
};

// Organization metrics
export const getOrgMetrics = (org, day) => {
  const params = day ? { day } : {};
  return api.get(`/org/${org}/metrics`, { params });
};

export const getOrgUsers = (org, day) => {
  const params = day ? { day } : {};
  return api.get(`/org/${org}/users`, { params });
};

export const getOrgTeams = (org) => api.get(`/org/${org}/teams`);

export const getTeamMetrics = (org, teamSlug, day) => {
  const params = day ? { day } : {};
  return api.get(`/org/${org}/team/${teamSlug}/metrics`, { params });
};

// Settings
export const getSettings = () => api.get('/settings');
export const updateSettings = (data) => api.post('/settings', data);
export const testConnection = () => api.post('/settings/test-connection');

export default api;
