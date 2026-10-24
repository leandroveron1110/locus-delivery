// src/features/delivery-comman/api/delivery-commands.api.ts
import { apiGet, apiPatch, apiPost } from '@/lib/apiFetch';
import { OrderCommand, OrderCommandListResponse, UpdateDeliveryCommandDto } from '../types/delivery-command.types';

export const fetchDeliveryCommands = async (
  page = 1,
  limit = 100
) => {
  const response = await apiGet<OrderCommandListResponse>(`/delivery-commands?page=${page}&limit=${limit}`);
  
  if (!response) {
    throw new Error('Error al obtener los comandos de envío');
  }

  return response;
};



export const updateDeliveryCommand = async (
  id: string,
  data: UpdateDeliveryCommandDto
) => {
  const response = await apiPatch<OrderCommand>(`/delivery-commands/${id}`, data);

  if (!response) {
    throw new Error('Error al actualizar el comando de envío');
  }

  return response;
};




export interface RequestDeliveryQuotationInput {
  businessId: string;

  orderId: string;

  originName: string;
  originAddress: string;
  originLatitude?: number;
  originLongitude?: number;

  quotedCost?: number;

  customerAddress: string;

  latitude?: number;

  longitude?: number;

  zoneId?: string | null;

  notes?: string;
}
export async function requestDeliveryDispatch(
  input: RequestDeliveryQuotationInput,
): Promise<boolean> {
  try {
    await apiPost<void>(
      "/delivery-commands",
      {
        businessId: input.businessId,

        orderId: input.orderId,

        command: "DISPATCH",
        originName: input.originName,
        originAddress: input.originAddress,
        originLatitude: input.originLatitude,
        originLongitude: input.originLongitude,

        quotedCost: input.quotedCost,

        destinationAddress: input.customerAddress,

        destinationLatitude: input.latitude,

        destinationLongitude: input.longitude,

        zoneId: input.zoneId,

        notes: input.notes,
      },
    );

    return true;
  } catch (error) {
    return false;
  }
}