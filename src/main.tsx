import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n';
import { Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById('root')!).render(
  <Suspense fallback={null}>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </Suspense>
);
