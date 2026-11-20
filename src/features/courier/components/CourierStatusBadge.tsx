
import { CourierStatus } from "@/mini-back/infrastructure/network/courier-api";

const STATUS_CONFIG: Record<
  CourierStatus,
  { label: string; className: string }
> = {
  [CourierStatus.ACTIVE]: {
    label: "Activo",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  },
  [CourierStatus.INACTIVE]: {
    label: "Inactivo",
    className: "bg-slate-100 text-slate-600 ring-slate-500/10",
  },
  [CourierStatus.SUSPENDED]: {
    label: "Suspendido",
    className: "bg-amber-50 text-amber-700 ring-amber-600/10",
  },
  [CourierStatus.BANNED]: {
    label: "Bloqueado",
    className: "bg-rose-50 text-rose-700 ring-rose-600/10",
  },
};

export function CourierStatusBadge({
  status,
}: {
  status: CourierStatus;
}) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export function CourierWorkingBadge({
  isAvailable,
}: {
  isAvailable: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isAvailable
          ? "bg-sky-50 text-sky-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isAvailable ? "bg-sky-500" : "bg-slate-400"
        }`}
      />
      {isAvailable ? "En turno" : "Fuera de turno"}
    </span>
  );
}

export function PasswordChangeBadge({
  mustChangePassword,
}: {
  mustChangePassword: boolean;
}) {
  if (!mustChangePassword) return null;

  return (
    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
      Debe cambiar contraseña
    </span>
  );
}
