import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';

  return {
    server: {
      host: '::',
      port: 8080,
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(
        isDevelopment ? 'development' : 'production'
      ),
    },
    plugins: [react(), isDevelopment && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@monynha/ui': path.resolve(__dirname, './packages/ui/src'),
        'react/jsx-dev-runtime': path.resolve(
          __dirname,
          './src/lib/react-jsx-dev-runtime.ts'
        ),
      },
    },
  };
});
