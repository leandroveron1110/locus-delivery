import axios from "@/lib/api"
import { Order } from "../types/order";

export const fetchOrdersByDeliveryId = async (deliveryId: string) => {
  const res = await axios.get(`/delivery/orders/by-company/${deliveryId}`);
  return res.data;
};


export const fetchUpdateOrdersByOrderID = async (
  orderId: string,
  status: string
): Promise<Order> => {
  const res = await axios.patch(`/orders/order/stauts/${orderId}`, { status });
  return res.data;
};