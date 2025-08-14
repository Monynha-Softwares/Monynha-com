import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-neutral-50 border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">M</span>
              </div>
              <div className="flex flex-col">
                <span className="font-brand font-semibold text-xl text-neutral-900">
                  Mon<span className="text-brand-blue">y</span>nha.com
                </span>
                <span className="text-sm text-neutral-400 font-medium">
                  {t('footer.tagline')}
                </span>
              </div>
            </Link>
            <p className="text-neutral-600 max-w-md">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-4">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/solutions"
                  className="text-neutral-600 hover:text-brand-blue transition-colors ease-in-out duration-300"
                >
                  {t('navigation.solutions')}
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-neutral-600 hover:text-brand-blue transition-colors ease-in-out duration-300"
                >
                  {t('navigation.about')}
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-neutral-600 hover:text-brand-blue transition-colors ease-in-out duration-300"
                >
                  {t('navigation.blog')}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-neutral-600 hover:text-brand-blue transition-colors ease-in-out duration-300"
                >
                  {t('navigation.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-4">
              {t('footer.solutions')}
            </h3>
            <ul className="space-y-2">
              <li>
                <span className="text-neutral-600">
                  {t('footer.solutionList.boteco')}
                </span>
              </li>
              <li>
                <span className="text-neutral-600">
                  {t('footer.solutionList.assistina')}
                </span>
              </li>
              <li>
                <span className="text-neutral-600">
                  {t('footer.solutionList.custom')}
                </span>
              </li>
              <li>
                <span className="text-neutral-600">
                  {t('footer.solutionList.integration')}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-500 text-sm">{t('footer.copyright')}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              to="#"
              className="text-neutral-500 hover:text-brand-blue transition-colors ease-in-out duration-300 text-sm"
            >
              {t('footer.privacy')}
            </Link>
            <Link
              to="#"
              className="text-neutral-500 hover:text-brand-blue transition-colors ease-in-out duration-300 text-sm"
            >
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
