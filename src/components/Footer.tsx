import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container py-10 md:py-12">
        <div className="grid gap-8 md:grid-cols-2 text-center md:text-left">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              {t('footer.ecosystem')}
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://monynha.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  monynha.tech
                </a>
              </li>
              <li>
                <a
                  href="https://monynha.store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  monynha.store
                </a>
              </li>
              <li>
                <a
                  href="https://monynha.online"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  monynha.online
                </a>
              </li>
              <li>
                <a
                  href="https://monynha.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  monynha.me
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              {t('footer.contact')}
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:hello@monynha.com"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  hello@monynha.com
                </a>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  São Paulo, Brasil
                </span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
          <p className="text-xs text-muted-foreground">
            {t('footer.copyright', { year: currentYear })}
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            {t('footer.madeWith')}{' '}
            <Heart className="w-4 h-4 text-red-500" /> {t('footer.and')}{' '}
            {t('footer.caffeine')}.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

