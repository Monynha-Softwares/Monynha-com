import * as React from 'react';
import type { ToasterToast } from './use-toast-reducer';

export interface ToastContextValue {
  toasts: ToasterToast[];
  toast: (toast: Omit<ToasterToast, 'id'>) => {
    id: string;
    dismiss: () => void;
    update: (props: ToasterToast) => void;
  };
  dismiss: (toastId?: string) => void;
}

export const ToastContext = React.createContext<ToastContextValue | undefined>(
  undefined
);
