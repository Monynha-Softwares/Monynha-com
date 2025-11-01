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

interface PageBreadcrumbProps {
  /**
   * The current page title, will be shown as the last breadcrumb item
   */
  currentPage: string;
  /**
   * Optional additional breadcrumb items between home and current page
   */
  items?: Array<{
    label: string;
    href: string;
  }>;
}

/**
 * A reusable breadcrumb component for pages
 * Always includes Home as the first item and current page as the last
 */
export const PageBreadcrumb = ({ currentPage, items = [] }: PageBreadcrumbProps) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 pt-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">{t('navigation.home')}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {items.map((item, index) => (
            <React.Fragment key={item.href}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </React.Fragment>
          ))}
          <BreadcrumbItem>
            <BreadcrumbPage>{currentPage}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
