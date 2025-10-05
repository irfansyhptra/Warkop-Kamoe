"use client";

import { useState, useCallback, useEffect } from "react";
import { Order } from "../types";

const ORDER_STORAGE_KEY = "warkop-kamoe-orders";

export const useOrderTracking = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Load orders from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem(ORDER_STORAGE_KEY);
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (error) {
        console.error("Error loading orders from localStorage:", error);
      }
    }
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const createOrder = useCallback((order: Omit<Order, "id">) => {
    const newOrder: Order = {
      ...order,
      id: `order-${Date.now()}`,
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  }, []);

  const getOrder = useCallback(
    (orderId: string) => {
      return orders.find((order) => order.id === orderId);
    },
    [orders]
  );

  const getUserOrders = useCallback(
    (userId: string) => {
      return orders.filter((order) => order.userId === userId);
    },
    [orders]
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: Order["status"]) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );
    },
    []
  );

  const getAllOrders = useCallback(() => {
    return orders;
  }, [orders]);

  const getOrdersByStatus = useCallback(
    (status: Order["status"]) => {
      return orders.filter((order) => order.status === status);
    },
    [orders]
  );

  return {
    orders,
    loading,
    createOrder,
    getOrder,
    getUserOrders,
    updateOrderStatus,
    getAllOrders,
    getOrdersByStatus,
  };
};
