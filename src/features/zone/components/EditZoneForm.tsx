"use client";

import { useForm } from "react-hook-form";
import { Clock, MapPin, Trash2, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { DrawnFeature, IZone, MatrixZone } from "../types/zone";
import { useEffect } from "react";

interface EditZoneFormData {
  name: string;
  isActive: boolean;
  hasTimeLimit: boolean;
  startTime: string | null;
  endTime: string | null;
  // Diccionario de precios indexado por macroZoneId: { [macroZoneId]: precio }
  prices: Record<string, number>;
}

interface EditZoneFormProps {
  drawnFeature: DrawnFeature;
  macroZones: { id: string; name: string }[]; 
  isLoading: boolean;
  onZoneEdited: (zone: Partial<IZone> & { priceMatrices?: any[] }) => void;
  onZoneDeleted: (zoneId: string) => void;
  onCancel: () => void;
  initialData: IZone;
}

export const EditZoneForm = ({
  drawnFeature,
  macroZones,
  isLoading,
  onZoneEdited,
  onZoneDeleted,
  onCancel,
  initialData,
}: EditZoneFormProps) => {
  
  // Función para transformar el array priceMatrices en un objeto { macroZoneId: price }
  const getInitialPrices = (matrices: MatrixZone[]) => {
    const pricesObj: Record<string, number> = {};
    matrices?.forEach((m) => {
      pricesObj[m.macroZoneId] = Number(m.price);
    });
    return pricesObj;
  };

  console.log("Datos iniciales en EditZoneForm:", initialData.priceMatrices);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<EditZoneFormData>({
    defaultValues: {
      name: initialData.name,
      isActive: initialData.isActive,
      hasTimeLimit: initialData.hasTimeLimit,
      prices: getInitialPrices(initialData.priceMatrices.map((m) => ({ ...m, price: Number(m.price) }))), // Convertimos el array a objeto
      startTime: initialData.startTime || undefined,
      endTime: initialData.endTime || undefined,
    },
  });

  // Resetear el formulario cuando cambian los datos iniciales (importante al cambiar de zona en el mapa)
  useEffect(() => {
    reset({
      name: initialData.name,
      isActive: initialData.isActive,
      hasTimeLimit: initialData.hasTimeLimit,
      prices: getInitialPrices(initialData.priceMatrices),
      startTime: initialData.startTime || undefined,
      endTime: initialData.endTime || undefined,
    });
  }, [initialData, reset]);

  const hasTimeLimit = watch("hasTimeLimit", false);
  const isActive = watch("isActive", initialData.isActive);

  const onSubmit = (data: EditZoneFormData) => {
    if (!initialData.id) return;

    // Construimos el objeto de actualización
    const updatedData: Partial<IZone> = {
      id: initialData.id,
      name: data.name,
      isActive: data.isActive,
      hasTimeLimit: data.hasTimeLimit,
      startTime: data.hasTimeLimit ? data.startTime : null,
      endTime: data.hasTimeLimit ? data.endTime : null,
      // Transformamos el objeto de precios de vuelta al formato de la matriz
      priceMatrices: Object.entries(data.prices).map(([macroZoneId, price]) => ({
        macroZoneId: macroZoneId,
        price: Number(price),
        deliveryZoneId: initialData.id,
        companyId: initialData.companyId
      }))
    };
    
    onZoneEdited(updatedData);
  };

  const handleDelete = () => {
    if (!initialData.id) return;
    if (confirm(`¿Estás seguro que quieres eliminar la zona "${initialData.name}"?`)) {
      onZoneDeleted(initialData.id);
    }
  };

  const vertexCount = drawnFeature.geometry.coordinates[0]?.length || 0;

return (
    <div className="flex flex-col h-full bg-gray-50 p-4 sm:p-6 overflow-y-auto">
      <div className="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              {initialData.name}
            </h2>
            <p className="text-sm text-gray-500">
              Editar zona de envío
            </p>
          </div>

          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {isActive ? "Activa" : "Inactiva"}
          </span>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* NOMBRE */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Nombre de la zona
            </label>
            <input
              {...register("name")}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              disabled={isLoading}
            />
          </div>

          {/* PRECIOS */}
          <div className="bg-gray-50 rounded-xl space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              Tarifas por macrozona
            </h3>

            <div className="space-y-2">
              {macroZones.map((macro) => (
                <div
                  key={macro.id}
                  className="flex items-center justify-between bg-white  rounded-lg px-3 py-2"
                >
                  <span className="text-sm text-gray-600">
                    {macro.name}
                  </span>

                  <div className="relative w-28">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
                      $
                    </span>
                    <input
                      type="text"
                      step="0.01"
                      {...register(`prices.${macro.id}`)}
                      className="w-full pl-6 pr-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-400"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ESTADO */}
          <div className="flex items-center justify-between bg-white border rounded-xl px-4 py-3">
            <span className="text-sm font-medium text-gray-700">
              Zona activa
            </span>
            <input
              type="checkbox"
              {...register("isActive")}
              className="w-5 h-5"
              disabled={isLoading}
            />
          </div>

          {/* HORARIOS */}
          <div className="border rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">
                Limitar horario
              </span>
              <input
                type="checkbox"
                {...register("hasTimeLimit")}
                disabled={isLoading}
              />
            </div>

            {hasTimeLimit && (
              <div className="flex gap-3">
                <input
                  type="time"
                  {...register("startTime")}
                  className="flex-1 border rounded-lg px-3 py-2"
                  disabled={isLoading}
                />
                <input
                  type="time"
                  {...register("endTime")}
                  className="flex-1 border rounded-lg px-3 py-2"
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          {/* BOTONES */}
          <div className="flex flex-col gap-3 pt-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 border rounded-xl py-2.5 text-gray-700 hover:bg-gray-100"
                disabled={isLoading}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 hover:bg-blue-700 shadow"
                disabled={isLoading}
              >
                {isLoading ? "Guardando..." : "Guardar"}
              </button>
            </div>

            <button
              type="button"
              onClick={handleDelete}
              className="text-red-600 text-sm hover:underline flex items-center justify-center"
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Eliminar zona
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};