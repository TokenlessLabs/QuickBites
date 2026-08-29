import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css';

const authToken = localStorage.getItem('authToken');
if (authToken) axios.defaults.headers.common.Authorization = `Bearer ${authToken}`;
const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
axios.interceptors.request.use((config) => {
  if (config.url?.startsWith('http://localhost:5000')) {
    config.url = config.url.replace('http://localhost:5000', apiBaseUrl);
  }
  return config;
});
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('authToken')) {
      localStorage.clear();
      window.location.assign('/');
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
