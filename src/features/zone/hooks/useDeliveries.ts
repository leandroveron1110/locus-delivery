import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchDeliveryZonesByDeliveryCompanyId,
  fetchSaveDeliveryZoneByDeliveryCompanyId,
  fetchUpdateDeliveryZone,
  fetchDeleteDeliveryZone,
  fetchMacroZonesIds,
} from "../api/delivery-zones-api";
import { IZone, MacroZone, MatrixZone, Zone } from "../types/zone";
import { ApiResult } from "@/lib/apiFetch";
import { ApiError } from "@/types/api";

// --- Hooks de React Query ---

export const useDeliveryCompanyZones = (id: string) => {
  return useQuery<ApiResult<IZone[]>, ApiError>({
    queryKey: ["delivery", id],
    queryFn: () => fetchDeliveryZonesByDeliveryCompanyId(id),
    // Mantiene la data como "fresca" por 30 minutos. No pedirá nada al volver a la pestaña.
    staleTime: 1000 * 60 * 30,
    // Evita que se dispare la carga pesada solo por cambiar de ventana
    refetchOnWindowFocus: false,
    refetchOnReconnect: true, // Esto sí es útil por si se corta internet
    enabled: !!id,
  });
};

export const useMacroZoneId = () => {
  return useQuery<ApiResult<MacroZone[]>, ApiError>({
    queryKey: ["macro-zones"],
    queryFn: () => fetchMacroZonesIds(),
    // Las macrozonas casi nunca cambian (Plaza/Cementerio), podemos darle 1 hora
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: true,
  });
};

export const useCreateZone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Zone) => fetchSaveDeliveryZoneByDeliveryCompanyId(data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: ["delivery", variables.companyId],
      }),
  });
};

export const useUpdateZone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<IZone, "geometry">>;
    }) => fetchUpdateDeliveryZone(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["delivery"] }),
  });
};


// Nuevo: hook para eliminar una zona
export const useDeleteZone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchDeleteDeliveryZone(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["delivery"] }),
  });
};
