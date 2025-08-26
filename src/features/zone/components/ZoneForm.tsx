'use client';
import { useForm } from "react-hook-form";

type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: number[][][];
};

interface ZoneFormProps {
  drawnFeature: any;
  isLoading: boolean;
  onZoneCreated: (zone: { name: string; price: number; geometry: GeoJsonPolygon }) => void;
  onCancel?: () => void;
}

export const ZoneForm = ({ drawnFeature, isLoading, onZoneCreated, onCancel }: ZoneFormProps) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<{ name: string; price: number }>();

  const onSubmit = (data: { name: string; price: number }) => {
    if (!drawnFeature) return;

    onZoneCreated({
      name: data.name,
      price: data.price,
      geometry: drawnFeature.geometry as GeoJsonPolygon,
    });

    reset();
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md border w-full max-w-sm">
      <h2 className="text-lg font-bold mb-4 text-gray-900">Nueva Zona de Envío</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
            Nombre de la Zona
          </label>
          <input
            type="text"
            {...register("name", { required: true })}
            className="mt-1 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm shadow-sm"
            disabled={isLoading}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">El nombre es requerido</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
            Precio (ARS)
          </label>
          <input
            type="number"
            step="0.01"
            {...register("price", { required: true, valueAsNumber: true })}
            className="mt-1 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm shadow-sm"
            disabled={isLoading}
          />
          {errors.price && <p className="text-red-500 text-xs mt-1">El precio es requerido</p>}
        </div>

        <div className="flex justify-between items-center">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
          >
            {isLoading ? "Guardando..." : "Guardar Zona"}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-500 text-sm hover:underline"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="mt-4 text-xs text-gray-500 bg-gray-100 p-2 rounded-lg">
        <p>Vértices del polígono: {drawnFeature?.geometry.coordinates[0].length}</p>
      </div>
    </div>
  );
};
