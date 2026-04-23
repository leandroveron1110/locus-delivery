"use client";

import { useForm } from "react-hook-form";
import { Clock, MapPin, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { DrawnFeature, Zone } from "../types/zone";

// Definimos la interfaz para capturar múltiples precios
interface CreateZoneFormData {
  name: string;
  isActive: boolean;
  hasTimeLimit: boolean;
  startTime?: string | null;
  endTime?: string | null;
  // Diccionario de precios: { [macroZoneId]: precio }
  priceMatrix: Record<string, number>;
}

interface CreateZoneFormProps {
  drawnFeature: DrawnFeature;
  macroZones: { id: string; name: string }[]; // Ahora es obligatorio
  isLoading: boolean;
  onZoneCreated: (zone: any) => void; // Cambiado a any para soportar la nueva estructura de envío
  onCancel: () => void;
  companyId: string;
}

export const CreateZoneForm = ({
  drawnFeature,
  macroZones,
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
    defaultValues: { 
      isActive: true, 
      hasTimeLimit: false,
      priceMatrix: {} // Inicializamos el objeto de precios
    },
  });

  const hasTimeLimit = watch("hasTimeLimit", false);
  const isActive = watch("isActive", true);

  const onSubmit = (data: CreateZoneFormData) => {
    if (!drawnFeature) return;

    // Estructuramos la data para que el backend reciba la zona y su matriz
    const zonePayload = {
      name: data.name,
      companyId: companyId,
      geometry: drawnFeature.geometry,
      hasTimeLimit: data.hasTimeLimit,
      startTime: data.hasTimeLimit && data.startTime ? data.startTime : null,
      endTime: data.hasTimeLimit && data.endTime ? data.endTime : null,
      isActive: data.isActive,
      // Enviamos la matriz de precios capturada
      priceMatrix: Object.entries(data.priceMatrix).map(([macroZoneId, price]) => ({
        macroZoneId: macroZoneId,
        price: Number(price)
      }))
    };
    
    onZoneCreated(zonePayload);
  };

  const vertexCount = drawnFeature.geometry.coordinates[0]?.length || 0;

  return (
    <div className="flex flex-col h-full bg-white p-4 sm:p-6 w-full overflow-y-auto">
      <div className="flex justify-between items-start mb-4 border-b pb-4">
        <h2 className="text-2xl font-extrabold text-gray-900 flex items-center">
          <MapPin className="w-6 h-6 mr-2 text-blue-600" />
          Nueva Zona
        </h2>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
            isActive ? "bg-green-100 text-green-700 border border-green-300" : "bg-gray-100 text-gray-600 border border-gray-300"
          }`}>
          {isActive ? "ACTIVA" : "INACTIVA"}
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-1">
        <div className="space-y-5">
          <div className="flex flex-col">
            <label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-1">
              Nombre de la Zona (Barrio)
            </label>
            <input
              id="name"
              type="text"
              placeholder="Ej: San Isidro, Zona 10"
              {...register("name", { required: "El nombre es requerido." })}
              className="px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 shadow-sm"
              disabled={isLoading}
            />
          </div>

          {/* SECCIÓN DINÁMICA DE PRECIOS POR MACROZONA */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider flex items-center">
              <DollarSign className="w-4 h-4 mr-1" /> Tarifas por Origen
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              {macroZones.map((macro) => (
                <div key={macro.id} className="flex flex-col">
                  <label className="text-xs font-bold text-gray-500 mb-1 ml-1">
                    Precio desde {macro.name}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input
                      type="text"
                      step="0.01"
                      placeholder="0.00"
                      {...register(`priceMatrix.${macro.id}` as any, {
                        required: "Precio requerido",
                        min: { value: 0, message: "No puede ser negativo" }
                      })}
                      className="pl-7 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 text-gray-800"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resto de opciones (Horarios e isActive) igual que antes... */}
        <div className="space-y-5">
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-300 shadow-sm">
            <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 flex items-center">
              {isActive ? <CheckCircle className="w-5 h-5 mr-2 text-green-600" /> : <XCircle className="w-5 h-5 mr-2 text-gray-500" />}
              Zona de envío activada
            </label>
            <input id="isActive" type="checkbox" {...register("isActive")} className="w-5 h-5 text-green-600 rounded" disabled={isLoading} />
          </div>

          <fieldset className="p-4 rounded-lg border border-blue-400 border-opacity-50 bg-blue-50 shadow-inner space-y-4">
            <legend className="flex items-center text-base font-bold text-blue-700 px-2">
              <Clock className="w-5 h-5 mr-2" /> Horario de Cobertura
            </legend>
            <div className="flex items-center justify-between">
              <label htmlFor="hasTimeLimit" className="text-sm font-semibold text-blue-900">Limitar horario para esta zona</label>
              <input id="hasTimeLimit" type="checkbox" {...register("hasTimeLimit")} className="w-5 h-5 text-blue-600 rounded" disabled={isLoading} />
            </div>

            {hasTimeLimit && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-blue-200">
                <div className="flex flex-col">
                  <label htmlFor="startTime" className="text-xs font-semibold text-blue-800 mb-1">Inicio</label>
                  <input id="startTime" type="time" {...register("startTime", { required: hasTimeLimit })} className="px-3 py-2 rounded-lg border border-blue-300 shadow-sm" disabled={isLoading} />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="endTime" className="text-xs font-semibold text-blue-800 mb-1">Fin</label>
                  <input id="endTime" type="time" {...register("endTime", { required: hasTimeLimit })} className="px-3 py-2 rounded-lg border border-blue-300 shadow-sm" disabled={isLoading} />
                </div>
              </div>
            )}
          </fieldset>
        </div>

        <div className="flex justify-between gap-3 pt-4 border-t border-gray-200">
          <button type="button" onClick={onCancel} className="flex-1 border border-gray-300 py-2.5 rounded-xl hover:bg-gray-100 text-gray-700 font-semibold" disabled={isLoading}>
            Cancelar
          </button>
          <button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl shadow-md hover:bg-blue-700 font-semibold">
            {isLoading ? "Guardando..." : "Guardar Zona"}
          </button>
        </div>
      </form>
    </div>
  );
};