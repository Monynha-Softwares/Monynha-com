import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const DEFAULT_SITE_URL =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    (import.meta.env as Record<string, string>).VITE_SITE_URL) ||
  'https://monynha.com';

interface MetaProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
}

const Meta = ({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  canonical,
  noIndex = false,
}: MetaProps) => {
  const { pathname } = useLocation();
  const resolvedUrl = canonical ?? `${DEFAULT_SITE_URL}${pathname}`;
  const openGraphTitle = ogTitle ?? title;
  const openGraphDescription = ogDescription ?? description;

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={resolvedUrl} />
      {openGraphTitle && <meta property="og:title" content={openGraphTitle} />}
      {openGraphDescription && (
        <meta property="og:description" content={openGraphDescription} />
      )}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={resolvedUrl} />
      {openGraphTitle && <meta name="twitter:title" content={openGraphTitle} />}
      {openGraphDescription && (
        <meta name="twitter:description" content={openGraphDescription} />
      )}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      <link rel="canonical" href={resolvedUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
};

export default Meta;
