import { apiGet } from '@/lib/apiFetch';
import { OrderCommandListResponse } from '../types/delivery-command.types';

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