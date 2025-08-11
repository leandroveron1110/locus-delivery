import { create } from "zustand";
import { Order } from "../types/order";

interface DeliveryOrdersState {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
}

export const useDeliveryOrdersStore = create<DeliveryOrdersState>((set) => ({
  orders: [],
  addOrder: (order) =>
    set((state) => {
      // evitar duplicados
      if (state.orders.some((o) => o.id === order.id)) return state;
      return { orders: [order, ...state.orders] };
    }),
  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      ),
    })),
}));
