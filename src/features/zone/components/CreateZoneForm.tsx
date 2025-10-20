// CreateZoneForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { Clock, MapPin, CheckCircle, XCircle } from "lucide-react";
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
  const isActive = watch("isActive", true); // Observamos isActive para el indicador visual

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
    <div className="flex flex-col h-full bg-white p-4 sm:p-6 w-full overflow-y-auto">
      <div className="flex justify-between items-start mb-4 border-b pb-4">
        <h2 className="text-2xl font-extrabold text-gray-900 flex items-center">
          <MapPin className="w-6 h-6 mr-2 text-blue-600" />
          Nueva Zona
        </h2>
        {/* Indicador visual de estado */}
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
            isActive
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-gray-100 text-gray-600 border border-gray-300"
          }`}
        >
          {isActive ? "ACTIVA" : "INACTIVA"}
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-1">
        {/* Sección de Datos Principales */}
        <div className="space-y-5">
          {/* Nombre de la Zona */}
          <div className="flex flex-col">
            <label
              htmlFor="name"
              className="text-sm font-semibold text-gray-700 mb-1"
            >
              Nombre de la Zona
            </label>
            <input
              id="name"
              type="text"
              placeholder="Ej: Microcentro, Zona Sur C1"
              {...register("name", {
                required: "El nombre de la zona es requerido.",
              })}
              className="px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 transition duration-150 shadow-sm"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Precio (ARS) */}
          <div className="flex flex-col">
            <label
              htmlFor="price"
              className="text-sm font-semibold text-gray-700 mb-1"
            >
              Costo de Envío (ARS)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">
                $
              </span>
              <input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("price", {
                  required: "El precio es requerido.",
                  min: {
                    value: 0,
                    message: "El precio no puede ser negativo.",
                  },
                  valueAsNumber: true,
                })}
                className="pl-8 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 transition duration-150 shadow-sm w-full"
                disabled={isLoading}
              />
            </div>
            {errors.price && (
              <p className="text-red-500 text-xs mt-1">
                {errors.price.message}
              </p>
            )}
          </div>
        </div>

        {/* Agrupación de Opciones */}
        <div className="space-y-5">
          {/* Checkbox Activa */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-300 shadow-sm">
            <label
              htmlFor="isActive"
              className="text-sm font-semibold text-gray-700 flex items-center"
            >
              {isActive ? (
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 mr-2 text-gray-500" />
              )}
              Zona de envío activada
            </label>
            <input
              id="isActive"
              type="checkbox"
              {...register("isActive")}
              className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              disabled={isLoading}
            />
          </div>

          {/* Horario de trabajo (Fieldset mejorado) */}
          <fieldset className="p-4 rounded-lg border border-blue-400 border-opacity-50 bg-blue-50 shadow-inner space-y-4">
            <legend className="flex items-center text-base font-bold text-blue-700 px-2">
              <Clock className="w-5 h-5 mr-2" />
              Horario de Cobertura
            </legend>

            <div className="flex items-center justify-between">
              <label
                htmlFor="hasTimeLimit"
                className="text-sm font-semibold text-blue-900"
              >
                Limitar horario para esta zona
              </label>
              <input
                id="hasTimeLimit"
                type="checkbox"
                {...register("hasTimeLimit")}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            {hasTimeLimit && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-blue-200">
                {/* Hora de inicio */}
                <div className="flex flex-col">
                  <label
                    htmlFor="startTime"
                    className="text-xs font-semibold text-blue-800 mb-1"
                  >
                    Hora de Inicio
                  </label>
                  <input
                    id="startTime"
                    type="time"
                    {...register("startTime", {
                      required: hasTimeLimit
                        ? "Hora de inicio requerida."
                        : false,
                    })}
                    className="px-3 py-2 rounded-lg border border-blue-300 text-gray-800 shadow-sm"
                    disabled={isLoading}
                  />
                  {errors.startTime && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.startTime.message}
                    </p>
                  )}
                </div>
                {/* Hora de fin */}
                <div className="flex flex-col">
                  <label
                    htmlFor="endTime"
                    className="text-xs font-semibold text-blue-800 mb-1"
                  >
                    Hora de Fin
                  </label>
                  <input
                    id="endTime"
                    type="time"
                    {...register("endTime", {
                      required: hasTimeLimit
                        ? "Hora de fin requerida."
                        : false,
                    })}
                    className="px-3 py-2 rounded-lg border border-blue-300 text-gray-800 shadow-sm"
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
        </div>

        {/* Espacio para que el área de formulario ocupe el espacio disponible */}
        <div className="flex-grow"></div> 

        {/* Detalles del Polígono (Mejor integración) */}
        <div className="mt-auto p-3 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-200">
          <p className="font-semibold mb-1 flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
            Geometría de la Zona
          </p>
          <p className="text-sm">
            Vértices del polígono: <strong className="font-mono text-base text-gray-900">{vertexCount}</strong>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Los datos de la forma se guardan como **GeoJSON** <code>[long, lat]</code>.
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-between gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-gray-300 py-2.5 px-5 rounded-xl hover:bg-gray-100 transition text-gray-700 font-semibold"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-2.5 px-5 rounded-xl shadow-md hover:bg-blue-700 transition disabled:bg-gray-400 font-semibold"
          >
            {isLoading ? "Guardando..." : "Guardar Zona"}
          </button>
        </div>
      </form>
    </div>
  );
};