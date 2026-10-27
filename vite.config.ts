import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import express from 'express';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { apiRouter } from './src/server/routes.ts';

function apiPlugin(): Plugin {
  return {
    name: 'api-server-plugin',
    configureServer(server) {
      const app = express();
      app.use(express.json({ limit: '50mb' }));
      app.use(express.urlencoded({ extended: true, limit: '50mb' }));
      app.use('/api', apiRouter);
      server.middlewares.use(app);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
