/**
 * Centralized API base URL.
 *
 * Vite replaces import.meta.env.VITE_API_URL at build time with the value
 * from your .env file.  Set it to your Render backend URL for production.
 *
 * Local dev:   http://localhost:5000  (see client/.env)
 * Production:  https://your-backend.onrender.com  (set in Vercel dashboard)
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
