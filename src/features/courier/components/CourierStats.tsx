
import { Bike, CheckCircle2, Clock3, Users, UserX } from "lucide-react";
import { Courier, CourierStatus } from "@/mini-back/infrastructure/network/courier-api";

interface Props {
  couriers: Courier[];
}

export function CourierStats({ couriers }: Props) {
  const total = couriers.length;
  const active = couriers.filter(
    (courier) => courier.status === CourierStatus.ACTIVE,
  ).length;
  const working = couriers.filter(
    (courier) =>
      courier.status === CourierStatus.ACTIVE && courier.isAvailable,
  ).length;
  const inactive = couriers.filter(
    (courier) => courier.status === CourierStatus.INACTIVE,
  ).length;
  const restricted = couriers.filter(
    (courier) =>
      courier.status === CourierStatus.SUSPENDED ||
      courier.status === CourierStatus.BANNED,
  ).length;

  const stats = [
    {
      label: "Total de cadetes",
      value: total,
      detail: "Registrados en la flota",
      icon: Users,
      iconClass: "bg-slate-100 text-slate-600",
    },
    {
      label: "Activos",
      value: active,
      detail: "Habilitados para trabajar",
      icon: CheckCircle2,
      iconClass: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "En turno",
      value: working,
      detail: "Activos y disponibles en turno",
      icon: Bike,
      iconClass: "bg-sky-50 text-sky-600",
    },
    {
      label: "Inactivos",
      value: inactive,
      detail: "Deshabilitados",
      icon: UserX,
      iconClass: "bg-slate-100 text-slate-500",
    },
    {
      label: "Restringidos",
      value: restricted,
      detail: "Suspendidos o bloqueados",
      icon: Clock3,
      iconClass: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.iconClass}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <span className="text-2xl font-black tabular-nums text-slate-900">
                {stat.value}
              </span>
            </div>

            <p className="mt-3 text-sm font-bold text-slate-800">
              {stat.label}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {stat.detail}
            </p>
          </div>
        );
      })}
    </div>
  );
}
