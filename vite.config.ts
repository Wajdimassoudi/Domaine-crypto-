import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 1000, // Increase warning limit slightly
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          // Fix: Split vendor code into separate chunks to avoid "Chunk too large" warnings
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'web3-vendor': ['ethers', '@reown/appkit', '@reown/appkit-adapter-ethers'],
            'utils': ['@google/genai', '@supabase/supabase-js']
          }
        }
      }
    },
    define: {
      // FIX: Redirect 'global' to 'window.global' for browser compatibility with older libs
      'global': 'window.global',
      
      // FIX: Ensure process.env is defined as an object
      'process.env': {},

      // Explicitly inject specific env vars as replacement strings
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