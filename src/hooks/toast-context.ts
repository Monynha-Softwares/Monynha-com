import { createContext } from 'react';
import type { ReactNode } from 'react';
import type { ToastActionElement, ToastProps } from '@/components/ui/toast';

export type ToasterToast = ToastProps & {
  id: string;
  title?: ReactNode;
  description?: ReactNode;
  action?: ToastActionElement;
};

export interface ToastContextValue {
  toasts: ToasterToast[];
  toast: (toast: Omit<ToasterToast, 'id'>) => {
    id: string;
    dismiss: () => void;
    update: (props: ToasterToast) => void;
  };
  dismiss: (toastId?: string) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined
);
