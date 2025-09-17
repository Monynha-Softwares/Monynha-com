import * as React from 'react';

import type { ToastActionElement, ToastProps } from '@monynha/ui/toast';
import reducer, {
  TOAST_REMOVE_DELAY,
  genId,
} from './use-toast-reducer';

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type Toast = Omit<ToasterToast, 'id'>;

interface ToastContextValue {
  toasts: ToasterToast[];
  toast: (toast: Toast) => {
    id: string;
    dismiss: () => void;
    update: (props: ToasterToast) => void;
  };
  dismiss: (toastId?: string) => void;
}

import { ToastContext } from './ToastProvider';

/**
 * Access the toast context helper for showing notifications.
 */
function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export { useToast };
