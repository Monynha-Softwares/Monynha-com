import { useContext } from 'react';

import { ToastContext } from './toast-context';

/**
 * Access the toast context helper for showing notifications.
 */
function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export { useToast };
