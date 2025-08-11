import axios from "@/lib/api";

export const fetchDeliveriesByOwner = async (
  ownerId: string | null | undefined
) => {
  const res = await axios.get(`/delivery/companies/owner/${ownerId}`); // tu endpoint que devuelve deliveries del dueño
  return res.data;
};

export const fetchDeliveryById = async (deliveryId: string) => {
  const res = await axios.get(`/orders/delivery/${deliveryId}`);
  return res.data;
};
