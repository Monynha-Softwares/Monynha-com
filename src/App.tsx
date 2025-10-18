import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ToastProvider } from '@/hooks/ToastProvider';
import { AuthProvider } from '@/hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Loading from './components/Loading';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import useDynamicCopy from '@/hooks/useDynamicCopy';

const Index = lazy(() => import('./pages/Index'));
const Solutions = lazy(() => import('./pages/Solutions'));
const SolutionDetail = lazy(() => import('./pages/solutions/[slug]'));
const Projects = lazy(() => import('./pages/Projects'));
const About = lazy(() => import('./pages/About'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/blog/[slug]'));
const Contact = lazy(() => import('./pages/Contact'));
const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient();

const AppRoutes = () => {
  useDynamicCopy();

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ScrollToTop />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/solutions/:slug" element={<SolutionDetail />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ToastProvider>
        <TooltipProvider>
          <Toaster />
          <AppRoutes />
        </TooltipProvider>
      </ToastProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
