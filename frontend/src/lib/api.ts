import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

export const api = axios.create({
   baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const session = await fetchAuthSession();
      if (session.tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${session.tokens.accessToken.toString()}`;
      }
    } catch (err) {
      // Ignore errors when no session exists
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[API error]', err.config?.url, err.response?.data?.message ?? err.message);
    return Promise.reject(err);
  }
);
