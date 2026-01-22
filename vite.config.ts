import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Use base path for GitHub Pages, or root for Docker/local dev
    const base = process.env.DOCKER_ENV === 'true' ? '/' : '/meetings-quality/';
    
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
