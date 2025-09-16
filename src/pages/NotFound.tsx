import { Link, useLocation } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Meta from '@/components/Meta';
import type { CSSProperties } from 'react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error(
        '404 Error: User attempted to access non-existent route:',
        location.pathname
      );
    }
  }, [location.pathname]);

  const { t } = useTranslation();

  const surfaceStyles = useMemo(
    () =>
      ({
        '--surface-overlay':
          'radial-gradient(circle at 20% 20%, rgba(124,58,237,0.12), transparent 55%), radial-gradient(circle at 80% 80%, rgba(14,165,233,0.12), transparent 60%)',
        '--surface-blur': '24px',
      }) satisfies CSSProperties,
    []
  );
  return (
    <div
      className="surface-section min-h-screen flex items-center justify-center px-4"
      style={surfaceStyles}
    >
      <Meta
        title="404 - Page Not Found"
        description="The page you are looking for does not exist."
        ogTitle="404 - Page Not Found"
        ogDescription="The page you are looking for does not exist."
        ogImage="/placeholder.svg"
      />
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">{t('notFound.oops')}</p>
        <Link
          to="/"
          className="text-blue-500 hover:text-blue-700 underline transition-all ease-in-out duration-300"
        >
          {t('notFound.returnHome')}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
