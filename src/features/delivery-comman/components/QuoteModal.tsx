import React, { useState } from "react";
import { Store, MapPin, Navigation, FileText, X } from "lucide-react";
import { OrderCommand } from "../types/delivery-command.types";
import { getElapsedTime } from "@/utils/date";

interface Props {
  command: OrderCommand;
  onClose: () => void;
  onSubmit: (commandId: string, cost: number) => Promise<void>;
}

const QUICK_PRICES = [
  2000, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3500, 3800, 4000, 4500, 5000,
];

export const QuoteModal: React.FC<Props> = ({ command, onClose, onSubmit }) => {
  const [cost, setCost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { label } = getElapsedTime(command.createdAt);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericCost = Number(cost.replace(",", "."));

    if (!numericCost || numericCost <= 0) {
      setError("Monto inválido");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(command.id, numericCost);
      onClose();
    } catch (err) {
      setError((err as Error).message ?? "Error al guardar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        {/* HEADER COMPACTO */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-wider uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
              Cotizar
            </span>
            <span className="text-xs font-bold text-slate-500">
              Espera: <strong className="text-slate-900">{label}</strong>
            </span>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* RESUMEN DE RUTA EN LÍNEA (Ahorra espacio vertical) */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-2">
            {/* Comercio */}
            <div className="flex items-center gap-1.5 font-extrabold text-slate-900 border-b border-slate-200 pb-1.5 truncate">
              <Store className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="truncate">
                {command.originName || "Comercio sin nombre"}
              </span>
            </div>

            {/* Retiro -> Entrega en layout paralelo o compacto */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-tight">
                  Retiro
                </span>
                <p className="font-medium text-slate-700 truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {command.originAddress
                      ?.replace(/, Concepción Del Uruguay/i, "")
                      .trim() || "Comercio sin dirección"}
                  </span>
                </p>
              </div>

              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-tight">
                  Entrega
                </span>
                <p className="font-extrabold text-slate-900 truncate flex items-center gap-1 mt-0.5">
                  <Navigation className="w-3 h-3 text-purple-600 shrink-0" />
                  <span className="truncate">
                    {command.destinationAddress || "Sin destino"}
                  </span>
                </p>
              </div>
            </div>

            {/* Nota resumida si existe */}
            {command.notes && (
              <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-200 text-[11px] text-amber-900 font-medium">
                <FileText className="w-3 h-3 text-amber-600 shrink-0" />
                <span className="truncate">{command.notes}</span>
              </div>
            )}
          </div>

          {/* FORMULARIO DE MONTO */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            {/* PRECIOS RÁPIDOS */}
            <div className="grid grid-cols-5 gap-1.5">
              {QUICK_PRICES.map((price) => (
                <button
                  key={price}
                  type="button"
                  onClick={() => {
                    setCost(price.toString());
                    if (error) setError(null);
                  }}
                  className={`py-1.5 rounded-md text-xs font-extrabold border transition-all ${
                    cost === price.toString()
                      ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  ${price}
                </button>
              ))}
            </div>

            {/* INPUT DE COSTO */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-lg text-slate-400">
                $
              </span>
              <input
                autoFocus
                type="text"
                inputMode="decimal"
                value={cost}
                onChange={(e) => {
                  setCost(e.target.value.replace(/[^0-9.,]/g, ""));
                  if (error) setError(null);
                }}
                placeholder="Monto personalizado"
                className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-slate-300 text-lg font-black text-slate-900 outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all"
              />
            </div>

            {error && <p className="text-xs font-bold text-red-600">{error}</p>}

            {/* ACCIONES */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 h-10 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-10 rounded-lg text-xs font-black text-white bg-purple-600 hover:bg-purple-700 active:scale-95 transition-all shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : "Confirmar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
