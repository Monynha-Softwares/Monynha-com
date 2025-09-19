import * as React from 'react';

import { ToastContext, type ToastContextValue } from './ToastProvider';

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}

export default useToast;
