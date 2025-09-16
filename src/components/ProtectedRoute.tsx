import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loading from './Loading';
import { useAuth } from '@/hooks/useAuth';

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Loading />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
