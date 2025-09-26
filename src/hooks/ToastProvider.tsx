import * as React from 'react';
import reducer, { TOAST_REMOVE_DELAY, genId } from './use-toast-reducer';
import {
  ToastContext,
  type ToastContextValue,
  type ToasterToast,
} from './toast-context';

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [state, dispatch] = React.useReducer(reducer, { toasts: [] });

  const toastTimeouts = React.useRef(
    new Map<string, ReturnType<typeof setTimeout>>()
  );

  const addToRemoveQueue = React.useCallback(
    (toastId: string) => {
      if (toastTimeouts.current.has(toastId)) {
        return;
      }

      const timeout = setTimeout(() => {
        toastTimeouts.current.delete(toastId);
        dispatch({
          type: 'REMOVE_TOAST',
          toastId: toastId,
        });
      }, TOAST_REMOVE_DELAY);

      toastTimeouts.current.set(toastId, timeout);
    },
    [dispatch]
  );

  const dismissToast = React.useCallback(
    (toastId?: string) => {
      dispatch({ type: 'DISMISS_TOAST', toastId });
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((t) => addToRemoveQueue(t.id));
      }
    },
    [addToRemoveQueue, dispatch, state.toasts]
  );

  const toast = React.useCallback(
    ({ ...props }: Omit<ToasterToast, 'id'>) => {
      const id = genId();

      const update = (props: ToasterToast) =>
        dispatch({
          type: 'UPDATE_TOAST',
          toast: { ...props, id },
        });
      const dismiss = () => dismissToast(id);

      dispatch({
        type: 'ADD_TOAST',
        toast: {
          ...props,
          id,
          open: true,
          onOpenChange: (open) => {
            if (!open) dismiss();
          },
        },
      });

      return {
        id: id,
        dismiss,
        update,
      };
    },
    [dispatch, dismissToast]
  );

  const value = React.useMemo<ToastContextValue>(
    () => ({
      ...state,
      toast,
      dismiss: dismissToast,
    }),
    [state, toast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export default ToastProvider;
