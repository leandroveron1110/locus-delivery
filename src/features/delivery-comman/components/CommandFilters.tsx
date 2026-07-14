import React from "react";

export type Filter = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "ALL";

interface Props {
  value: Filter;
  onChange: (value: Filter) => void;
  counts?: Record<Filter, number>;
}

const filters: { value: Filter; label: string }[] = [
  { value: "PENDING", label: "Pendientes" },
  { value: "PROCESSING", label: "En Proceso" },
  { value: "COMPLETED", label: "Completados" },
  { value: "FAILED", label: "Fallidos" },
  { value: "ALL", label: "Todos" },
];

export const CommandFilters: React.FC<Props> = ({
  value,
  onChange,
  counts,
}) => {
  return (
    <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl w-fit">
      {filters.map((filter) => {
        const isActive = value === filter.value;
        const count = counts ? counts[filter.value] ?? 0 : null;

        return (
          <button
            key={filter.value}
            onClick={() => onChange(filter.value)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isActive
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
            }`}
          >
            <span>{filter.label}</span>
            {count !== null && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive
                    ? filter.value === "PENDING" && count > 0
                      ? "bg-red-500 text-white"
                      : "bg-gray-900 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};