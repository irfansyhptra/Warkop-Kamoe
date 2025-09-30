"use client";

import { useState, useCallback } from "react";
import { Notification } from "../types";

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id">) => {
      const id = Date.now().toString();
      const newNotification: Notification = {
        ...notification,
        id,
      };

      setNotifications((prev) => [...prev, newNotification]);
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const showSuccess = useCallback(
    (title: string, message: string, duration?: number) => {
      addNotification({ type: "success", title, message, duration });
    },
    [addNotification]
  );

  const showError = useCallback(
    (title: string, message: string, duration?: number) => {
      addNotification({ type: "error", title, message, duration });
    },
    [addNotification]
  );

  const showWarning = useCallback(
    (title: string, message: string, duration?: number) => {
      addNotification({ type: "warning", title, message, duration });
    },
    [addNotification]
  );

  const showInfo = useCallback(
    (title: string, message: string, duration?: number) => {
      addNotification({ type: "info", title, message, duration });
    },
    [addNotification]
  );

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
