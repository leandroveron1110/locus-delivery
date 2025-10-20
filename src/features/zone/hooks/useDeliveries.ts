import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  fetchDeliveryZonesByDeliveryCompanyId, 
  fetchSaveDeliveryZoneByDeliveryCompanyId,
  fetchUpdateDeliveryZone,
  fetchDeleteDeliveryZone
} from "../api/delivery-zones-api";
import { IZone, Zone } from "../types/zone";
import { ApiResult } from "@/lib/apiFetch";
import { ApiError } from "@/types/api";

// --- Hooks de React Query ---

export const useDeliveryCompanyZones = (id: string) => {
  return useQuery<ApiResult<IZone[]>, ApiError>({
    queryKey: ["delivery", id],
    queryFn: () => fetchDeliveryZonesByDeliveryCompanyId(id),
    staleTime: 0, // 10 minutos
    refetchOnWindowFocus: true,
    refetchOnReconnect: false,
    enabled: !!id,
  });
};

export const useCreateZone = () => {
    const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Zone) => fetchSaveDeliveryZoneByDeliveryCompanyId(data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: ["delivery", variables.companyId] }),
  });
};

export const useUpdateZone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<IZone, "geometry">> }) => fetchUpdateDeliveryZone(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["delivery"] }),
  });
};

// Nuevo: hook para eliminar una zona
export const useDeleteZone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchDeleteDeliveryZone(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["delivery"] }),
  });
};
