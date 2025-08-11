import { useQuery } from "@tanstack/react-query";
import { fetchDeliveriesByOwner, fetchDeliveryById } from "../api/delivery-api";
import { useAuthStore } from "@/features/auth/store/authStore";

export const useDeliveries = () => {
  const user = useAuthStore((state) => state.user);
  console.log(user);
  const ownerId = user ? user.id : ""
  return useQuery({
    queryKey: ["deliveries"],
    queryFn: () => fetchDeliveriesByOwner(ownerId),
    staleTime: 1000 * 60 * 10, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useDelivery = (id: string) => {
  return useQuery({
    queryKey: ["delivery", id],
    queryFn: () => fetchDeliveryById(id),
    staleTime: 1000 * 60 * 10, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !!id,
  });
};
