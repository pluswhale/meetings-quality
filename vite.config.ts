import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Use root path for local development (Docker or local)
    // Use /meetings-quality/ only for GitHub Pages deployment
    const base = mode === 'production' && !process.env.DOCKER_ENV ? '/meetings-quality/' : '/';
    
    return {
      base: base,
      server: {
        port: 3000,
        host: '0.0.0.0',
        watch: {
          usePolling: true, // Required for Docker volume watching
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
