import axios from "@/lib/api";
import { DeliveryCompany } from "../types/delivery";

export const fetchDeliveriesByOwner = async (ownerId?: string | null): Promise<DeliveryCompany[]> => {
  if (!ownerId) return [];
  const res = await axios.get<DeliveryCompany[]>(`/delivery/companies/owner/${ownerId}`);
  return res.data;
};


export const fetchDeliveriesByDeliveryId = async (deliveryId: string | null): Promise<DeliveryCompany> => {
  const res = await axios.get<DeliveryCompany>(`/delivery/companies/${deliveryId}`);
  return res.data;
};


export const fetchDeliveryOrderByDeliveryId = async (deliveryId: string) => {
  const res = await axios.get(`/orders/delivery/${deliveryId}`);
  return res.data;
};

export const updateDeliveryCompany = async (
  id: string,
  data: Partial<DeliveryCompany>
) => {
  const res = await axios.patch(`/delivery/companies/${id}`, data);
  return res.data;
};