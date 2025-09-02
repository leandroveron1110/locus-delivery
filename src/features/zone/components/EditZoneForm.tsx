"use client";

import { useForm } from "react-hook-form";
import { Clock } from "lucide-react";
import { DrawnFeature, IZone, EditZoneFormData } from "../types/zone";
import { useEffect } from "react";

interface EditZoneFormProps {
  drawnFeature: DrawnFeature;
  isLoading: boolean;
  onZoneEdited: (zone: Partial<IZone>) => void;
  onZoneDeleted: (zoneId: string) => void;
  onCancel: () => void;
  initialData: IZone;
}

export const EditZoneForm = ({
  drawnFeature,
  isLoading,
  onZoneEdited,
  onZoneDeleted,
  onCancel,
  initialData,
}: EditZoneFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty }, // isDirty para verificar si hay cambios
    reset,
    getValues,
  } = useForm<EditZoneFormData>({
    defaultValues: {
      ...initialData,
      price: Number(initialData.price),
      startTime: initialData.startTime || undefined,
      endTime: initialData.endTime || undefined,
    },
  });

  useEffect(() => {
    reset({
      ...initialData,
      price: Number(initialData.price),
      startTime: initialData.startTime || undefined,
      endTime: initialData.endTime || undefined,
    });
  }, [initialData, reset]);

  const hasTimeLimit = watch("hasTimeLimit", false);

  const onSubmit = (data: EditZoneFormData) => {
    if (!initialData.id) {
      console.error("No se puede editar una zona sin ID.");
      return;
    }

    // Objeto para almacenar solo los campos modificados
    const partialZoneData: Partial<IZone> = { id: initialData.id };

    // Compara cada campo con los datos iniciales
    if (data.name !== initialData.name) {
      partialZoneData.name = data.name;
    }

    // Convertimos el precio a string para comparar y enviar
    const newPriceAsString = data.price.toString();
    if (newPriceAsString !== initialData.price.toString()) {
      partialZoneData.price = newPriceAsString;
    }

    if (data.isActive !== initialData.isActive) {
      partialZoneData.isActive = data.isActive;
    }

    if (data.hasTimeLimit !== initialData.hasTimeLimit) {
      partialZoneData.hasTimeLimit = data.hasTimeLimit;
    }

    const newStartTime = data.hasTimeLimit ? data.startTime : null;
    if (newStartTime !== initialData.startTime) {
      partialZoneData.startTime = newStartTime;
    }

    const newEndTime = data.hasTimeLimit ? data.endTime : null;
    if (newEndTime !== initialData.endTime) {
      partialZoneData.endTime = newEndTime;
    }

    // No se incluye 'geometry' porque es inmutable en la edición
    onZoneEdited(partialZoneData);
  };

  const handleDelete = () => {
    if (!initialData.id) return;
    if (
      confirm(
        `¿Estás seguro que quieres eliminar la zona "${initialData.name}"?`
      )
    ) {
      onZoneDeleted(initialData.id);
    }
  };

  const vertexCount = drawnFeature.geometry.coordinates[0]?.length || 0;

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-xl border border-gray-200 p-6 w-full max-w-sm lg:max-w-none">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Editar Zona: {initialData.name}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 flex-1">
        <div className="flex flex-col">
          <label
            htmlFor="name"
            className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-1"
          >
            Nombre de la Zona
          </label>
          <input
            id="name"
            type="text"
            {...register("name", {
              required: "El nombre de la zona es requerido.",
            })}
            className="px-4 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800 shadow-sm transition duration-150"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="price"
            className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-1"
          >
            Precio (ARS)
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            {...register("price", {
              required: "El precio es requerido.",
              min: { value: 0, message: "El precio no puede ser negativo." },
              valueAsNumber: true,
            })}
            className="px-4 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800 shadow-sm transition duration-150"
            disabled={isLoading}
          />
          {errors.price && (
            <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            id="isActive"
            type="checkbox"
            {...register("isActive")}
            className="w-4 h-4 text-green-600 rounded"
            disabled={isLoading}
          />
          <label
            htmlFor="isActive"
            className="ml-2 text-sm text-gray-700 font-medium"
          >
            Zona activa
          </label>
        </div>

        <fieldset className="p-4 rounded-xl border border-dashed border-gray-300">
          <legend className="flex items-center text-sm font-medium text-gray-700 mb-3 px-2">
            <Clock className="w-4 h-4 mr-2 text-gray-500" />
            Horario de trabajo
          </legend>
          <div className="flex items-center mb-4">
            <input
              id="hasTimeLimit"
              type="checkbox"
              {...register("hasTimeLimit")}
              className="w-4 h-4 text-blue-600 rounded"
              disabled={isLoading}
            />
            <label
              htmlFor="hasTimeLimit"
              className="ml-2 text-sm text-gray-700 font-medium"
            >
              Horario limitado para esta zona
            </label>
          </div>
          {hasTimeLimit && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label
                  htmlFor="startTime"
                  className="text-xs font-medium text-gray-500"
                >
                  Hora de inicio
                </label>
                <input
                  id="startTime"
                  type="time"
                  {...register("startTime", {
                    required: hasTimeLimit
                      ? "Hora de inicio requerida."
                      : false,
                  })}
                  className="px-4 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800 shadow-sm transition duration-150"
                  disabled={isLoading}
                />
                {errors.startTime && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.startTime.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="endTime"
                  className="text-xs font-medium text-gray-500"
                >
                  Hora de fin
                </label>
                <input
                  id="endTime"
                  type="time"
                  {...register("endTime", {
                    required: hasTimeLimit ? "Hora de fin requerida." : false,
                  })}
                  className="px-4 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800 shadow-sm transition duration-150"
                  disabled={isLoading}
                />
                {errors.endTime && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </fieldset>
        <div className="flex justify-between gap-3 mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-2 px-5 rounded-xl shadow-md hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {isLoading ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-gray-300 py-2 px-5 rounded-xl hover:bg-gray-100 transition text-gray-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex-1 bg-red-600 text-white py-2 px-5 rounded-xl shadow-md hover:bg-red-700 transition"
          >
            Eliminar
          </button>
        </div>
      </form>
      <div className="mt-4 p-4 bg-gray-50 rounded-xl text-sm text-gray-600 shadow-inner">
        <p className="font-semibold mb-1">Detalles del polígono</p>
        <p>
          Número de vértices: <span className="font-mono">{vertexCount}</span>
        </p>
        <p className="mt-1 text-xs">
          Ajusta la forma del polígono directamente en el mapa para actualizar
          las coordenadas.
        </p>
      </div>
    </div>
  );
};
