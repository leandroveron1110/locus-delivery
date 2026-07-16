import { useState } from 'react';
import { updateDeliveryCommand } from '../api/delivery-commands.api';
import { UpdateDeliveryCommandDto } from '../types/delivery-command.types';

export const useUpdateDeliveryCommand = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const mutate = async (id: string, dto: UpdateDeliveryCommandDto) => {
    setIsUpdating(true);
    setUpdateError(null);

    try {
      const updatedCommand = await updateDeliveryCommand(id, dto);
      return updatedCommand;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado al actualizar';
      setUpdateError(message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    mutate,
    isUpdating,
    updateError,
  };
};