import { type ComponentProps } from 'react';

import CreativeNavigation from './CreativeNavigation';
import Layout, { type LayoutProps } from './Layout';

export type LayoutCreativeProps = Omit<LayoutProps, 'variant'> & {
  creativeNavigationProps?: ComponentProps<typeof CreativeNavigation>;
};

const LayoutCreative = ({ creativeNavigationProps, ...props }: LayoutCreativeProps) => {
  return (
    <Layout
      variant="creative"
      creativeNavigationProps={creativeNavigationProps}
      {...props}
    />
  );
};

export default LayoutCreative;
