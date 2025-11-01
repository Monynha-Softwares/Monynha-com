import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageBreadcrumbProps {
  currentPage: string;
  items?: BreadcrumbItem[];
  className?: string;
}

/**
 * Reusable breadcrumb navigation component
 * @param currentPage - Translation key for current page (e.g., 'navigation.blog')
 * @param items - Optional array of intermediate breadcrumb items
 * @param className - Optional CSS classes for container
 */
export const PageBreadcrumb = ({ 
  currentPage, 
  items = [], 
  className = 'max-w-7xl mx-auto px-4 pt-4' 
}: PageBreadcrumbProps) => {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">{t('navigation.home')}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {item.path ? (
                  <BreadcrumbLink asChild>
                    <Link to={item.path}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
          
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t(currentPage)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
