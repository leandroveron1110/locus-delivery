import { useState, useEffect, useCallback } from 'react';
import { OrderCommand, Pagination } from '../types/delivery-command.types';
import { fetchDeliveryCommands } from '../api/delivery-commands.api';

export const useDeliveryCommands = (initialPage = 1, limit = 50) => {
  const [commands, setCommands] = useState<OrderCommand[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCommands = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchDeliveryCommands(page, limit);
      console.log('API Response:', res); // Debugging line
      if (res.data) {
        setCommands(res.data);
        setPagination(res.pagination);
      } else {
        setError('Ocurrió un error inesperado');
      }
    } catch (err) {
      setError((err as Error).message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadCommands(initialPage);
  }, [loadCommands, initialPage]);

  return {
    commands,
    pagination,
    isLoading,
    error,
    refetch: loadCommands,
  };
};