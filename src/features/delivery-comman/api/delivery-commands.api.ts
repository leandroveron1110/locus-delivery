// src/features/delivery-comman/api/delivery-commands.api.ts
import { apiGet, apiPatch } from '@/lib/apiFetch';
import { OrderCommand, OrderCommandListResponse, UpdateDeliveryCommandDto } from '../types/delivery-command.types';

export const fetchDeliveryCommands = async (
  page = 1,
  limit = 50
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