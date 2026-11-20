
import { FormEvent, useEffect, useState } from "react";
import { Loader2, Pencil, X } from "lucide-react";

import {
  Courier,
  UpdateCourierInput,
  updateCourier,
  VehicleType,
} from "@/mini-back/infrastructure/network/courier-api";

interface Props {
  courier: Courier | null;
  onClose: () => void;
  onUpdated: (courier: Courier) => void;
}

const VEHICLES = [
  { value: VehicleType.MOTORCYCLE, label: "Motocicleta" },
  { value: VehicleType.BICYCLE, label: "Bicicleta" },
  { value: VehicleType.CAR, label: "Automóvil" },
  { value: VehicleType.ON_FOOT, label: "A pie" },
];

export function EditCourierModal({
  courier,
  onClose,
  onUpdated,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>(
    VehicleType.MOTORCYCLE,
  );
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!courier) return;

    setFullName(courier.fullName);
    setPhone(courier.phone ?? "");
    setVehicleType(courier.vehicleType);
    setError("");
    setIsSaving(false);
  }, [courier]);

  if (!courier) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;

    const normalizedName = fullName.trim();

    if (!normalizedName) {
      setError("El nombre completo es obligatorio.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const payload: UpdateCourierInput = {
        fullName: normalizedName,
        phone: phone.trim(),
        vehicleType,
      };

      const updated = await updateCourier(courier.id, payload);

      if (!updated) {
        throw new Error("No se pudieron actualizar los datos del cadete.");
      }

      onUpdated(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al actualizar el cadete.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-courier-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <h2 id="edit-courier-title" className="text-base font-black text-slate-900">
                Editar cadete
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Actualizá los datos de #{courier.courierNumber}.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Cerrar"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {error && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Nombre completo
            </label>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoFocus
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              DNI
            </label>
            <input
              value={courier.dni}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500"
            />
            <p className="mt-1 text-xs text-slate-400">
              El DNI no se puede modificar desde este formulario.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Teléfono
            </label>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              inputMode="tel"
              placeholder="Sin teléfono"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Vehículo
            </label>
            <select
              value={vehicleType}
              onChange={(event) => setVehicleType(event.target.value as VehicleType)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              {VEHICLES.map((vehicle) => (
                <option key={vehicle.value} value={vehicle.value}>
                  {vehicle.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-500 disabled:opacity-60"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar cambios
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
