"use client";

import React, { useEffect } from "react";
import {
  Check,
  DollarSign,
  Loader2,
  MapPin,
  X,
  History,
  RotateCcw,
  Plus,
} from "lucide-react";

import { cleanDeliveryAddress } from "@/utils/clean-delivery-address";

export interface QuoteEditorState {
  id: string;
  originName: string | null;
  originAddress: string | null;
  destinationAddress: string | null;
  currentCost: number | null;
  mode: "create" | "edit";
}

interface QuoteEditorProps {
  editor: QuoteEditorState;
  priceInput: string;
  isSaving: boolean;
  onPriceChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const QUICK_PRICES = [
  2000, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3500, 3800, 4000, 4500, 5000,
];

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "Sin cotizar";
  return currencyFormatter.format(value);
}

function getAddress(
  value: string | null | undefined,
  fallback: string,
): string {
  return cleanDeliveryAddress(value, fallback);
}

export default function QuoteEditor({
  editor,
  priceInput,
  isSaving,
  onPriceChange,
  onClose,
  onSubmit,
}: QuoteEditorProps) {
  const normalizedPrice = priceInput.trim().replace(",", ".");
  const parsedPrice = Number(normalizedPrice);

  const isValidPrice =
    normalizedPrice !== "" &&
    Number.isFinite(parsedPrice) &&
    Number.isSafeInteger(parsedPrice) &&
    parsedPrice > 0;

  const difference =
    editor.currentCost != null && isValidPrice
      ? parsedPrice - editor.currentCost
      : null;

  const origin = getAddress(editor.originAddress, "En local");
  const destination = getAddress(editor.destinationAddress, "Sin destino");

  // Suma acumulativa al valor actual del input
  const handleAddPrice = (amount: number) => {
    const current = Number(priceInput.trim().replace(",", ".")) || 0;
    onPriceChange(String(current + amount));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSaving, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-editor-title"
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl border border-slate-100"
      >
        {/* Encabezado ultrafino */}
        <header className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 bg-slate-50/50">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white">
              <DollarSign size={16} />
            </div>

            <h2 id="quote-editor-title" className="text-sm font-bold text-slate-900 truncate">
              {editor.mode === "edit" ? "Corregir precio" : "Cotizar envío"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Cerrar editor"
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={onSubmit} className="space-y-3.5 p-4">
          {/* Recorrido ultra compacto en una sola línea */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
            <span className="truncate max-w-[42%]" title={origin}>
              {origin}
            </span>
            <span className="text-violet-500 font-bold shrink-0">→</span>
            <span className="truncate max-w-[48%] text-slate-900 font-bold" title={destination}>
              {destination}
            </span>
          </div>

          {/* Input principal de Precio */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="quote-price"
                className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
              >
                {editor.mode === "edit" ? "Nuevo precio" : "Precio total (ARS)"}
              </label>

              <div className="flex items-center gap-2">
                {priceInput && (
                  <button
                    type="button"
                    onClick={() => onPriceChange("")}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 hover:text-red-700 transition"
                  >
                    <RotateCcw size={11} /> Limpiar
                  </button>
                )}

                {editor.currentCost != null && (
                  <button
                    type="button"
                    onClick={() => onPriceChange(String(editor.currentCost))}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-violet-800 transition"
                  >
                    <History size={11} /> Actual ({formatCurrency(editor.currentCost)})
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">
                $
              </span>

              <input
                id="quote-price"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                autoFocus
                required
                value={priceInput}
                onChange={(event) => onPriceChange(event.target.value)}
                placeholder="0"
                className="h-13 w-full rounded-2xl border-2 border-slate-200 bg-white pl-9 pr-4 text-2xl font-black tabular-nums text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-violet-600 focus:ring-4 focus:ring-violet-50"
              />
            </div>
          </div>

          {/* Tarifario rápido para SUMAR (+) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Sumar tarifa rápida
              </span>
              <span className="text-[10px] text-slate-400">
                Tocá para acumular montos
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-200/60">
              {QUICK_PRICES.map((price) => (
                <button
                  key={price}
                  type="button"
                  onClick={() => handleAddPrice(price)}
                  className="inline-flex items-center justify-center gap-0.5 h-8 rounded-lg border border-slate-200 bg-white text-xs font-bold tabular-nums text-slate-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 active:scale-95 transition"
                >
                  <Plus size={10} className="text-violet-500" />
                  {price}
                </button>
              ))}
            </div>
          </div>

          {/* Diferencia de precio al editar */}
          {difference != null && isValidPrice && (
            <div
              className={`rounded-xl px-3 py-2 text-xs font-medium ${
                difference === 0
                  ? "bg-slate-100 text-slate-600"
                  : difference > 0
                    ? "bg-amber-50 text-amber-800 border border-amber-200/60"
                    : "bg-blue-50 text-blue-800 border border-blue-200/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>Diferencia con el precio anterior:</span>
                <span className="font-bold tabular-nums">
                  {difference > 0 ? "+" : ""}
                  {formatCurrency(difference)}
                </span>
              </div>
            </div>
          )}

          {/* Acciones */}
          <footer className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving || !isValidPrice}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 text-xs font-bold text-white shadow-md shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check size={14} />
                  {editor.mode === "edit" ? "Guardar" : "Confirmar"}
                </>
              )}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}