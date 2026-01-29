import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    define: {
      // Polyfills for Web3 libraries
      'global': 'globalThis',
      'process.env': process.env, // Safe pass-through for some libs
      
      // Explicitly inject env vars
      'process.env.NEXT_PUBLIC_PROJECT_ID': JSON.stringify(env.NEXT_PUBLIC_PROJECT_ID),
      'process.env.NEXT_PUBLIC_RECEIVER_WALLET': JSON.stringify(env.NEXT_PUBLIC_RECEIVER_WALLET),
      'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL),
      'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    resolve: {
      alias: {
        process: "process/browser",
        stream: "stream-browserify",
        zlib: "browserify-zlib",
        util: "util",
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
});