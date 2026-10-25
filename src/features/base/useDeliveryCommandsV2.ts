import { apiGet } from '@/lib/apiFetch';
import { useState, useEffect, useCallback } from 'react';

export function useDeliveryCommandsV2() {
  const [commands, setCommands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommands = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Traemos tanto las cotizaciones como los despachos activos del día
      const [quotes, dispatches] = await Promise.all([
        apiGet<any[]>('/delivery-commands-v2/panel/base/urgent-quotes') || [],
        apiGet<any[]>('/delivery-commands-v2/panel/base/pending-dispatches') || [],
      ]);

      // Unificamos y adaptamos al formato unificado de la UI
      const mappedQuotes = (quotes || []).map((c: any) => ({ ...c, command: 'QUOTE', status: 'PENDING' }));
      const mappedDispatches = (dispatches || []).map((c: any) => ({
        ...c,
        command: 'DISPATCH',
        status: c.logisticsStatus === 'ACCEPTED' ? 'PROCESSING' : 'PENDING',
      }));

      setCommands([...mappedQuotes, ...mappedDispatches]);
    } catch (err) {
      setError('Error al sincronizar con la V2');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommands();
    const interval = setInterval(fetchCommands, 10000);
    return () => clearInterval(interval);
  }, [fetchCommands]);

  return { commands, isLoading, error, refetch: fetchCommands };
}