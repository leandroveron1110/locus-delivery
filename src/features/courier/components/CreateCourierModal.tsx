
import { FormEvent, useEffect, useState } from "react";
import { Loader2, UserPlus, X } from "lucide-react";

import {
  Courier,
  CreateCourierInput,
  createCourier,
  VehicleType,
} from "@/mini-back/infrastructure/network/courier-api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (courier: Courier) => void;
}

const VEHICLES = [
  { value: VehicleType.MOTORCYCLE, label: "Motocicleta" },
  { value: VehicleType.BICYCLE, label: "Bicicleta" },
  { value: VehicleType.CAR, label: "Automóvil" },
  { value: VehicleType.ON_FOOT, label: "A pie" },
];

export function CreateCourierModal({
  isOpen,
  onClose,
  onCreated,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>(
    VehicleType.MOTORCYCLE,
  );
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setFullName("");
    setDni("");
    setPhone("");
    setPassword("");
    setVehicleType(VehicleType.MOTORCYCLE);
    setError("");
    setIsSaving(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;

    const normalizedName = fullName.trim();
    const normalizedDni = dni.trim();
    const normalizedPhone = phone.trim();

    if (!normalizedName || !normalizedDni || !password) {
      setError("Completá el nombre, DNI y contraseña.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const payload: CreateCourierInput = {
        fullName: normalizedName,
        dni: normalizedDni,
        password,
        vehicleType,
        ...(normalizedPhone ? { phone: normalizedPhone } : {}),
      };

      const created = await createCourier(payload);

      if (!created) {
        throw new Error("No se pudo crear el cadete.");
      }

      onCreated(created);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error al crear el cadete.",
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
        aria-labelledby="create-courier-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 id="create-courier-title" className="text-base font-black text-slate-900">
                Nuevo cadete
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Registrá un integrante de la flota.
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
              placeholder="Ej. Fernando Veron"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                DNI
              </label>
              <input
                value={dni}
                onChange={(event) => setDni(event.target.value)}
                required
                inputMode="numeric"
                placeholder="Número de DNI"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Teléfono
              </label>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                inputMode="tel"
                placeholder="343..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>
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

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Contraseña inicial
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="new-password"
              placeholder="Contraseña inicial del cadete"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              El cadete podrá cambiarla desde su acceso si el backend lo requiere.
            </p>
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
              Crear cadete
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
