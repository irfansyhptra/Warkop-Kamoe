"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { useNotification } from "@/hooks/useNotification";
import { ToastContainer } from "@/components/ui/Toast";
import { Notification } from "@/types";

type NotificationContextType = {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  showSuccess: (title: string, message: string, duration?: number) => void;
  showError: (title: string, message: string, duration?: number) => void;
  showWarning: (title: string, message: string, duration?: number) => void;
  showInfo: (title: string, message: string, duration?: number) => void;
};

const noop = () => {};

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: noop,
  removeNotification: noop,
  showSuccess: noop,
  showError: noop,
  showWarning: noop,
  showInfo: noop,
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  } = useNotification();

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      <ToastContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => useContext(NotificationContext);

export default NotificationContext;
