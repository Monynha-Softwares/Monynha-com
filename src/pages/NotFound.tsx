import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Meta from '@/components/Meta';

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
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
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
