import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true, // Esto expone el servidor a la red local (para celulares)
  }
});
