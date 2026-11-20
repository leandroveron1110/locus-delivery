
import { Search, SlidersHorizontal, X } from "lucide-react";
import { CourierStatus } from "@/mini-back/infrastructure/network/courier-api";

export type StatusFilter = "ALL" | CourierStatus;

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  resultCount: number;
}

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: CourierStatus.ACTIVE, label: "Activos" },
  { value: CourierStatus.INACTIVE, label: "Inactivos" },
  { value: CourierStatus.SUSPENDED, label: "Suspendidos" },
  { value: CourierStatus.BANNED, label: "Bloqueados" },
];

export function CourierFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  resultCount,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por nombre, DNI, teléfono o número..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
          />

          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Estado
          </span>

          {FILTERS.map((filter) => {
            const selected = statusFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => onStatusChange(filter.value)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  selected
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-500">
        {resultCount} {resultCount === 1 ? "resultado" : "resultados"}
      </div>
    </div>
  );
}
