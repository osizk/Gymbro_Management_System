import axios from 'axios';

// Vite proxy forwards /api → http://backend:5000/api (see vite.config.js)
// No env variable needed — works in Docker and local dev automatically
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;