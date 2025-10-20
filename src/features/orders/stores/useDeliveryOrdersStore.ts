import { create } from "zustand";
import { Order, OrderStatus } from "../types/order";

interface DeliveryOrdersState {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
}

export const useDeliveryOrdersStore = create<DeliveryOrdersState>((set) => ({
  orders: [],
  addOrder: (order) =>
    set((state) => {
      if (state.orders.some((o) => o.id === order.id)) return state;
      return { orders: [order, ...state.orders] }; // 
    }),
  
  // 🚨 FUNCIÓN CORREGIDA:
  updateOrderStatus: (orderId, status) =>
    set((state) => ({ 
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: status as OrderStatus,
            }
          : o
      ),
    })), 
}));