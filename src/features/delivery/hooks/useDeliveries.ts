import { useQuery } from "@tanstack/react-query";
import {
  fetchDeliveriesByDeliveryId,
  fetchDeliveriesByOwner,
  fetchDeliveryOrderByDeliveryId,
} from "../api/delivery-api";

export const useDeliveries = (ownerId?: string | null) => {
  return useQuery({
    queryKey: ["deliveries", ownerId],
    queryFn: () => fetchDeliveriesByOwner(ownerId),
    staleTime: 0, // siempre considerar obsoletos para traer fresh data
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: !!ownerId, // solo corre si hay ownerId
  });
};

export const useDelivery = (deliveryId: string) => {
  return useQuery({
    queryKey: ["delivery", deliveryId],
    queryFn: () => fetchDeliveriesByDeliveryId(deliveryId!),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: !!deliveryId,
  });
};

export const useDeliveryOrder = (id: string) => {
  return useQuery({
    queryKey: ["delivery-orders", id],
    queryFn: () => fetchDeliveryOrderByDeliveryId(id!),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: !!id,
  });
};
