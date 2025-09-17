import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
  },
  plugins: [react(), mode === 'development' && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@monynha/ui': path.resolve(__dirname, './packages/ui/src/index.ts'),
      '@monynha/config': path.resolve(
        __dirname,
        './packages/config/src/index.ts'
      ),
    },
  },
}));
