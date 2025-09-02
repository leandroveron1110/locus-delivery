// CreateZoneForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { Clock } from "lucide-react";
import { DrawnFeature, CreateZoneFormData, Zone } from "../types/zone";

interface CreateZoneFormProps {
  drawnFeature: DrawnFeature;
  isLoading: boolean;
  onZoneCreated: (zone: Zone) => void;
  onCancel: () => void;
  companyId: string;
}

export const CreateZoneForm = ({
  drawnFeature,
  isLoading,
  onZoneCreated,
  onCancel,
  companyId,
}: CreateZoneFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateZoneFormData>({
    defaultValues: { isActive: true, hasTimeLimit: false },
  });

  const hasTimeLimit = watch("hasTimeLimit", false);

  const onSubmit = (data: CreateZoneFormData) => {
    if (!drawnFeature) return;

    const zoneData: Zone = {
      name: data.name,
      price: data.price,
      companyId: companyId,
      geometry: drawnFeature.geometry,
      hasTimeLimit: data.hasTimeLimit,
      startTime: data.hasTimeLimit && data.startTime ? data.startTime : null,
      endTime: data.hasTimeLimit && data.endTime ? data.endTime : null,
      isActive: data.isActive,
    };
    onZoneCreated(zoneData);
  };

  const vertexCount = drawnFeature.geometry.coordinates[0]?.length || 0;

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-xl border border-gray-200 p-6 w-full max-w-sm lg:max-w-none">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Nueva Zona de Envío
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
        </div>
      </form>
      <div className="mt-4 p-4 bg-gray-50 rounded-xl text-sm text-gray-600 shadow-inner">
        <p className="font-semibold mb-1">Detalles del polígono</p>
        <p>
          Número de vértices: <span className="font-mono">{vertexCount}</span>
        </p>
        <p className="mt-1 text-xs">
          Las coordenadas se guardarán en formato GeoJSON{" "}
          <code>[long, lat]</code>.
        </p>
      </div>
    </div>
  );
};
