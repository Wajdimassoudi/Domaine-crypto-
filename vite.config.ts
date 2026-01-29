import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // We use a try-catch for cwd to be safe in all environments
  let env = {};
  try {
      env = loadEnv(mode, '.', '');
  } catch (e) {
      env = process.env || {};
  }

  // Helper to get value from loaded env OR process.env (Vercel injection)
  const getVal = (key) => JSON.stringify(env[key] || process.env[key] || '');

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    define: {
      // Explicitly inject the env vars needed for the client side
      'process.env.NEXT_PUBLIC_PROJECT_ID': getVal('NEXT_PUBLIC_PROJECT_ID'),
      'process.env.NEXT_PUBLIC_RECEIVER_WALLET': getVal('NEXT_PUBLIC_RECEIVER_WALLET'),
      'process.env.NEXT_PUBLIC_SUPABASE_URL': getVal('NEXT_PUBLIC_SUPABASE_URL'),
      'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': getVal('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
      'process.env.API_KEY': getVal('API_KEY'),
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        }
      }
    }
  };
});