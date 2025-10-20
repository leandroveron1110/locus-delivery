import { apiGet, apiPatch, ApiResult } from "@/lib/apiFetch";
import { Order } from "../types/order";
import { handleApiError } from "@/features/common/utils/handleApiError";

// --- Obtener órdenes por empresa de delivery ---
export const fetchOrdersByDeliveryId = async (deliveryId: string) => {
  try {
    const res = await apiGet(`/delivery/orders/by-company/${deliveryId}`);
    return res;
  } catch (error: unknown) {
    throw handleApiError(error, "Error fetching orders by delivery company ID");
  }
};

// --- Actualizar el estado de una orden ---
export const fetchUpdateOrdersByOrderID = async (
  orderId: string,
  status: string
): Promise<ApiResult<Order>> => {
  try {
    const res = await apiPatch<Order>(`/orders/order/status/${orderId}`, {
      status,
    });
    return res;
  } catch (error: unknown) {
    throw handleApiError(error, "Error updating order status");
  }
};
