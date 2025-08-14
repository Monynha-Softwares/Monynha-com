import { Helmet } from 'react-helmet-async';

interface MetaProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

const Meta = ({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
}: MetaProps) => (
  <Helmet>
    {title && <title>{title}</title>}
    {description && <meta name="description" content={description} />}
    {ogTitle && <meta property="og:title" content={ogTitle} />}
    {ogDescription && (
      <meta property="og:description" content={ogDescription} />
    )}
    {ogImage && <meta property="og:image" content={ogImage} />}
  </Helmet>
);

export default Meta;
