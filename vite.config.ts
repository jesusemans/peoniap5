import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // Avoid String.prototype.includes to keep TS happy with older lib targets
          if (id.indexOf('node_modules') !== -1) {
            return 'vendor';
          }
          return undefined;
        }
      },
    },
  },
});
