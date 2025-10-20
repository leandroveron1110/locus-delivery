import { apiGet, apiPatch, ApiResult } from "@/lib/apiFetch";
import { DeliveryCompany } from "../types/delivery";
import { handleApiError } from "@/features/common/utils/handleApiError";

// --- Obtener todas las empresas de delivery por dueño ---
export const fetchDeliveriesByOwner = async (
  ownerId?: string | null
): Promise<ApiResult<DeliveryCompany[]>> => {
  try {
    if (!ownerId) return [];
    const res = await apiGet<DeliveryCompany[]>(
      `/delivery/companies/owner/${ownerId}`
    );
    return res;
  } catch (error: unknown) {
    throw handleApiError(error, "Error fetching delivery companies by owner ID");
  }
};

// --- Obtener una empresa de delivery por su ID ---
export const fetchDeliveriesByDeliveryId = async (
  deliveryId: string | null
): Promise<ApiResult<DeliveryCompany>> => {
  try {
    const res = await apiGet<DeliveryCompany>(
      `/delivery/companies/${deliveryId}`
    );
    return res;
  } catch (error: unknown) {
    throw handleApiError(error, "Error fetching delivery company by ID");
  }
};

// --- Obtener órdenes asociadas a una empresa de delivery ---
export const fetchDeliveryOrderByDeliveryId = async (deliveryId: string) => {
  try {
    const res = await apiGet(`/orders/delivery/${deliveryId}`);
    return res;
  } catch (error: unknown) {
    throw handleApiError(error, "Error fetching orders for delivery company");
  }
};

// --- Actualizar una empresa de delivery ---
export const updateDeliveryCompany = async (
  id: string,
  data: Partial<DeliveryCompany>
) => {
  try {
    const res = await apiPatch(`/delivery/companies/${id}`, data);
    return res;
  } catch (error: unknown) {
    throw handleApiError(error, "Error updating delivery company");
  }
};
