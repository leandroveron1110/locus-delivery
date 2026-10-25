"use client";

import React, { useEffect } from "react";
import {
  ArrowDown,
  Check,
  DollarSign,
  Loader2,
  MapPin,
  X,
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

const QUICK_PRICES = [1500, 2000, 2500, 3000, 3500, 4000];

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

function AddressItem({
  label,
  address,
  secondary,
}: {
  label: string;
  address: string;
  secondary?: string | null;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <MapPin
        size={16}
        className="mt-0.5 shrink-0 text-slate-400"
      />

      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>

        <p className="break-words text-sm font-medium text-slate-800">
          {address}
        </p>

        {secondary && (
          <p className="mt-0.5 text-xs text-slate-500">
            {secondary}
          </p>
        )}
      </div>
    </div>
  );
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

  const destination = getAddress(
    editor.destinationAddress,
    "Sin destino",
  );

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
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !isSaving
        ) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-editor-title"
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        {/* Encabezado */}
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
              <DollarSign size={18} />
            </div>

            <div className="min-w-0">
              <h2
                id="quote-editor-title"
                className="font-bold text-slate-900"
              >
                {editor.mode === "edit"
                  ? "Corregir precio"
                  : "Cotizar envío"}
              </h2>

              <p className="text-xs text-slate-500">
                Ingresá el importe en pesos argentinos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Cerrar editor"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </header>

        <form onSubmit={onSubmit} className="space-y-5 p-4 sm:p-5">
          {/* Recorrido */}
          <div className="space-y-3">
            <AddressItem
              label="Origen"
              address={origin}
              secondary={editor.originName}
            />

            <div className="ml-1.5">
              <ArrowDown
                size={15}
                className="text-slate-300"
              />
            </div>

            <AddressItem
              label="Destino"
              address={destination}
            />
          </div>

          {/* Precio actual */}
          {editor.currentCost != null && (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
              <span className="text-sm text-slate-500">
                Precio actual
              </span>

              <span className="font-semibold text-slate-800">
                {formatCurrency(editor.currentCost)}
              </span>
            </div>
          )}

          {/* Importe */}
          <div>
            <label
              htmlFor="quote-price"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              {editor.mode === "edit"
                ? "Nuevo precio"
                : "Precio del envío"}
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">
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
                onChange={(event) =>
                  onPriceChange(event.target.value)
                }
                placeholder="2500"
                className="h-14 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-xl font-bold tabular-nums outline-none transition placeholder:text-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>

          {/* Precios rápidos */}
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500">
              Precios rápidos
            </p>

            <div className="grid grid-cols-3 gap-2">
              {QUICK_PRICES.map((price) => {
                const selected = parsedPrice === price;

                return (
                  <button
                    key={price}
                    type="button"
                    onClick={() => onPriceChange(String(price))}
                    className={`min-h-10 rounded-lg border px-2 py-2 text-sm font-semibold transition ${
                      selected
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    {formatCurrency(price)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Diferencia respecto al precio anterior */}
          {difference != null && isValidPrice && (
            <div
              className={`rounded-lg px-3 py-2.5 text-sm ${
                difference === 0
                  ? "bg-slate-50 text-slate-600"
                  : difference > 0
                    ? "bg-amber-50 text-amber-800"
                    : "bg-blue-50 text-blue-800"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs">
                  Diferencia con el precio actual
                </span>

                <span className="font-bold tabular-nums">
                  {difference > 0 ? "+" : ""}
                  {formatCurrency(difference)}
                </span>
              </div>
            </div>
          )}

          {/* Acciones */}
          <footer className="flex gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="min-h-11 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving || !isValidPrice}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Guardando
                </>
              ) : (
                <>
                  <Check size={16} />
                  {editor.mode === "edit" ? "Guardar" : "Cotizar"}
                </>
              )}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}