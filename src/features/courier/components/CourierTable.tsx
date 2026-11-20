
import {
  Bike,
  Car,
  Footprints,
  Pencil,
  KeyRound,
  Loader2,
  UserRound,
  Users,
  Check,
  X,
} from "lucide-react";

import {
  Courier,
  CourierStatus,
  VehicleType,
} from "@/mini-back/infrastructure/network/courier-api";

import {
  CourierStatusBadge,
  CourierWorkingBadge,
  PasswordChangeBadge,
} from "./CourierStatusBadge";

interface Props {
  couriers: Courier[];
  isLoading: boolean;
  updatingId: string | null;
  onToggleEnabled: (courier: Courier) => void;
  onEdit: (courier: Courier) => void;
  onResetPassword: (courier: Courier) => void;
}

const VEHICLE_CONFIG: Record<
  VehicleType,
  { label: string; icon: typeof Bike }
> = {
  [VehicleType.MOTORCYCLE]: { label: "Motocicleta", icon: Bike },
  [VehicleType.BICYCLE]: { label: "Bicicleta", icon: Bike },
  [VehicleType.CAR]: { label: "Automóvil", icon: Car },
  [VehicleType.ON_FOOT]: { label: "A pie", icon: Footprints },
};

function VehicleLabel({ type }: { type: VehicleType }) {
  const config = VEHICLE_CONFIG[type];
  const Icon = config.icon;

  return (
    <span className="inline-flex items-center gap-2 text-sm text-slate-600">
      <Icon className="h-4 w-4 text-slate-400" />
      {config.label}
    </span>
  );
}

function CourierActions({
  courier,
  updating,
  onToggleEnabled,
  onEdit,
  onResetPassword,
}: {
  courier: Courier;
  updating: boolean;
  onToggleEnabled: (courier: Courier) => void;
  onEdit: (courier: Courier) => void;
  onResetPassword: (courier: Courier) => void;
}) {
  const canToggle =
    courier.status === CourierStatus.ACTIVE ||
    courier.status === CourierStatus.INACTIVE;

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={() => onEdit(courier)}
        title="Editar datos"
        aria-label={`Editar datos de ${courier.fullName}`}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
      >
        <Pencil className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => onResetPassword(courier)}
        title="Restablecer contraseña"
        aria-label={`Restablecer contraseña de ${courier.fullName}`}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
      >
        <KeyRound className="h-4 w-4" />
      </button>

      {canToggle && (
        <button
          type="button"
          onClick={() => onToggleEnabled(courier)}
          disabled={updating}
          title={courier.status === CourierStatus.ACTIVE ? "Deshabilitar" : "Habilitar"}
          aria-label={
            courier.status === CourierStatus.ACTIVE
              ? `Deshabilitar a ${courier.fullName}`
              : `Habilitar a ${courier.fullName}`
          }
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:opacity-50 ${
            courier.status === CourierStatus.ACTIVE
              ? "border-slate-200 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          }`}
        >
          {updating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : courier.status === CourierStatus.ACTIVE ? (
            <X className="h-4 w-4" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}

function EmptyState({ isLoading }: { isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Loader2 className="h-7 w-7 animate-spin text-sky-600" />
        <p className="text-sm text-slate-500">Cargando cadetes...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Users className="h-6 w-6" />
      </div>
      <p className="mt-3 text-sm font-bold text-slate-800">
        No se encontraron cadetes
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Probá cambiar los filtros o la búsqueda.
      </p>
    </div>
  );
}

export function CourierTable({
  couriers,
  isLoading,
  updatingId,
  onToggleEnabled,
  onEdit,
  onResetPassword,
}: Props) {
  if (couriers.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <EmptyState isLoading={isLoading} />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Escritorio */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[900px] text-left">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3">Cadete</th>
              <th className="px-5 py-3">Contacto</th>
              <th className="px-5 py-3">Vehículo</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3">Turno</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {couriers.map((courier) => (
              <tr key={courier.id} className="transition hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900">
                        {courier.fullName}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        #{courier.courierNumber} · DNI {courier.dni}
                      </p>
                      {courier.mustChangePassword && (
                        <div className="mt-1">
                          <PasswordChangeBadge mustChangePassword />
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm text-slate-700">
                    {courier.phone || "Sin teléfono"}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <VehicleLabel type={courier.vehicleType} />
                </td>

                <td className="px-5 py-4">
                  <CourierStatusBadge status={courier.status} />
                </td>

                <td className="px-5 py-4">
                  <CourierWorkingBadge isAvailable={courier.isAvailable} />
                </td>

                <td className="px-5 py-4">
                  <CourierActions
                    courier={courier}
                    updating={updatingId === courier.id}
                    onToggleEnabled={onToggleEnabled}
                    onEdit={onEdit}
                    onResetPassword={onResetPassword}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Móvil */}
      <div className="divide-y divide-slate-100 md:hidden">
        {couriers.map((courier) => (
          <article key={courier.id} className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <UserRound className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {courier.fullName}
                  </p>
                  <p className="text-xs text-slate-500">
                    #{courier.courierNumber} · DNI {courier.dni}
                  </p>
                </div>
              </div>
              <CourierStatusBadge status={courier.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
              <div>
                <p className="text-[11px] font-semibold uppercase text-slate-400">
                  Teléfono
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {courier.phone || "Sin teléfono"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase text-slate-400">
                  Vehículo
                </p>
                <div className="mt-1">
                  <VehicleLabel type={courier.vehicleType} />
                </div>
              </div>
              <div className="col-span-2">
                <p className="mb-1 text-[11px] font-semibold uppercase text-slate-400">
                  Turno
                </p>
                <CourierWorkingBadge isAvailable={courier.isAvailable} />
              </div>
            </div>

            {courier.mustChangePassword && (
              <PasswordChangeBadge mustChangePassword />
            )}

            <div className="flex justify-end border-t border-slate-100 pt-3">
              <CourierActions
                courier={courier}
                updating={updatingId === courier.id}
                onToggleEnabled={onToggleEnabled}
                onEdit={onEdit}
                onResetPassword={onResetPassword}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
