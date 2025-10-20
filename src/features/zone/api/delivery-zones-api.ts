import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  ApiResult,
} from "@/lib/apiFetch";
import { IZone, Zone } from "../types/zone";
import { handleApiError } from "@/features/common/utils/handleApiError";

// --- Métodos de la API ---

export const fetchDeliveryZonesByDeliveryCompanyId = async (
  companyId: string | null | undefined
): Promise<ApiResult<IZone[]>> => {
  try {
    const res = await apiGet<IZone[]>(`/delivery-zones/zones/${companyId}`);
    return res;
  } catch (error: unknown) {
    throw handleApiError(error, "Error fetching delivery zones by company ID");
  }
};

export const fetchSaveDeliveryZoneByDeliveryCompanyId = async (zone: Zone) => {
  try {
    const res = await apiPost(`/delivery-zones`, zone);
    return res;
  } catch (error: unknown) {
    throw handleApiError(error, "Error creating delivery zone");
  }
};

// --- Actualizar una zona de entrega ---
export const fetchUpdateDeliveryZone = async (
  id: string,
  data: Partial<IZone>
) => {
  try {
    const res = await apiPatch(`/delivery-zones/${id}`, data);
    return res;
  } catch (error: unknown) {
    throw handleApiError(error, "Error updating delivery zone");
  }
};

// --- Eliminar una zona de entrega ---
export const fetchDeleteDeliveryZone = async (id: string) => {
  try {
    const res = await apiDelete(`/delivery-zones/${id}`);
    return res;
  } catch (error: unknown) {
    throw handleApiError(error, "Error deleting delivery zone");
  }
};
