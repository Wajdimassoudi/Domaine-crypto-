
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'web3-vendor': ['ethers', '@reown/appkit', '@reown/appkit-adapter-ethers'],
          }
        }
      }
    },
    define: {
      'global': 'window.global',
      'process.env': {},
      'process.env.NEXT_PUBLIC_PROJECT_ID': JSON.stringify(env.NEXT_PUBLIC_PROJECT_ID),
      'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL),
      'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      'process.env.RAPIDAPI_KEY': JSON.stringify(env.RAPIDAPI_KEY),
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    }
  };
});
