import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-neutral-100 bg-neutral-50 transition-colors dark:border-neutral-800 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="sm:col-span-2">
            <Link to="/" className="mb-4 flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand">
                <span className="text-lg font-bold text-white">M</span>
              </div>
              <div className="flex flex-col">
                <span className="font-brand text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Mon<span className="text-brand-blue">y</span>nha.com
                </span>
                <span className="text-sm font-medium text-neutral-400 dark:text-neutral-500">
                  {t('footer.tagline')}
                </span>
              </div>
            </Link>
            <p className="max-w-md text-neutral-600 dark:text-neutral-300">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold text-neutral-900 dark:text-neutral-100">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/solutions"
                  className="text-neutral-600 transition-colors duration-300 ease-in-out hover:text-brand-blue dark:text-neutral-300"
                >
                  {t('navigation.solutions')}
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-neutral-600 transition-colors duration-300 ease-in-out hover:text-brand-blue dark:text-neutral-300"
                >
                  {t('navigation.about')}
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-neutral-600 transition-colors duration-300 ease-in-out hover:text-brand-blue dark:text-neutral-300"
                >
                  {t('navigation.blog')}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-neutral-600 transition-colors duration-300 ease-in-out hover:text-brand-blue dark:text-neutral-300"
                >
                  {t('navigation.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="mb-4 font-semibold text-neutral-900 dark:text-neutral-100">
              {t('footer.solutions')}
            </h3>
            <ul className="space-y-2">
              <li>
                <span className="text-neutral-600 dark:text-neutral-300">
                  {t('footer.solutionList.boteco')}
                </span>
              </li>
              <li>
                <span className="text-neutral-600 dark:text-neutral-300">
                  {t('footer.solutionList.assistina')}
                </span>
              </li>
              <li>
                <span className="text-neutral-600 dark:text-neutral-300">
                  {t('footer.solutionList.custom')}
                </span>
              </li>
              <li>
                <span className="text-neutral-600 dark:text-neutral-300">
                  {t('footer.solutionList.integration')}
                </span>
              </li>
            </ul>
          </div>

          {/* Monynha Ecosystem */}
          <div>
            <h3 className="mb-4 font-semibold text-neutral-900 dark:text-neutral-100">
              {t('footer.ecosystem')}
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://monynha.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary dark:text-neutral-300"
                  aria-label="Visit monynha.tech"
                  title="monynha.tech"
                >
                  monynha.tech
                </a>
              </li>
              <li>
                <a
                  href="https://monynha.fun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary dark:text-neutral-300"
                  aria-label="Visit monynha.fun"
                  title="monynha.fun"
                >
                  monynha.fun
                </a>
              </li>
              <li>
                <a
                  href="https://monynha.online"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary dark:text-neutral-300"
                  aria-label="Visit monynha.online"
                  title="monynha.online"
                >
                  monynha.online
                </a>
              </li>
              <li>
                <a
                  href="https://monynha.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary dark:text-neutral-300"
                  aria-label="Visit monynha.me"
                  title="monynha.me"
                >
                  monynha.me
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-semibold text-neutral-900 dark:text-neutral-100">
              {t('footer.contact')}
            </h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground dark:text-neutral-300">
                {t('footer.email')}: {
                  <a
                    href="mailto:hello@monynha.com"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary dark:text-neutral-300"
                    aria-label="Send email to hello@monynha.com"
                    title="hello@monynha.com"
                  >
                    hello@monynha.com
                  </a>
                }
              </li>
              <li className="text-sm text-muted-foreground dark:text-neutral-300">
                {t('footer.location')}: Faro, Portugal
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-neutral-200 dark:bg-neutral-800" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="flex items-center space-x-1 text-sm text-neutral-500 dark:text-neutral-400">
            <span>
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </span>
            <span className="flex items-center space-x-1">
              <span>{t('footer.madeWith')}</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>{t('footer.andPride')}</span>
            </span>
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              to="#"
              className="text-sm text-neutral-500 transition-colors duration-300 ease-in-out hover:text-brand-blue dark:text-neutral-400"
            >
              {t('footer.privacy')}
            </Link>
            <Link
              to="#"
              className="text-sm text-neutral-500 transition-colors duration-300 ease-in-out hover:text-brand-blue dark:text-neutral-400"
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
