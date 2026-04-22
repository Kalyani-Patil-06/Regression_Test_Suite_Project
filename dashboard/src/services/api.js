import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' }
});

// Dashboard stats
export const getStats = () => api.get('/test-runs/stats/summary');
export const getChartData = () => api.get('/test-runs/stats/chart');

// Test runs
export const getTestRuns = () => api.get('/test-runs');
export const getTestRun = (id) => api.get(`/test-runs/${id}`);

// Trigger
export const triggerTests = (data = {}) => api.post('/trigger', data);

// Interactions
export const postInteraction = (data) => api.post('/interactions', data);
export const getInteractions = () => api.get('/interactions');

export default api;
