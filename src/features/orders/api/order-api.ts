import axios from "@/lib/api"

export const fetchOrdersByDeliveryId = async (deliveryId: string) => {
  const res = await axios.get(`/delivery/orders/by-company/${deliveryId}`);
  return res.data;
};
