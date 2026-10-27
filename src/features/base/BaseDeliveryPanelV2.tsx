"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Loader2,
  RefreshCw,
  Search,
  Truck,
  X,
} from "lucide-react";

import {
  baseAcceptDispatch,
  baseQuoteOrder,
  fetchBasePendingDispatches,
  fetchBaseUrgentQuotes,
  type BasePendingDispatch,
  type BaseUrgentQuote,
} from "@/mini-back/infrastructure/network/base-delivery-api";
import { cleanDeliveryAddress } from "@/utils/clean-delivery-address";
import DeliveryLists from "./DeliveryLists";
import QuoteEditor, { QuoteEditorState } from "./QuoteEditor";


interface BaseDeliveryPanelV2Props {
  zoneId?: string;
}

type PanelTab = "quotes" | "dispatches";

const REFRESH_INTERVAL = 10_000;

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Ocurrió un error inesperado.";
}


export default function BaseDeliveryPanelV2({
  zoneId,
}: BaseDeliveryPanelV2Props) {
  const [activeTab, setActiveTab] = useState<PanelTab>("quotes");

  const [urgentQuotes, setUrgentQuotes] = useState<BaseUrgentQuote[]>([]);
  const [pendingDispatches, setPendingDispatches] = useState<
    BasePendingDispatch[]
  >([]);

  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const [editor, setEditor] = useState<QuoteEditorState | null>(null);
  const [priceInput, setPriceInput] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = useCallback(
    async (showLoading = false) => {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const [quotes, dispatches] = await Promise.all([
          fetchBaseUrgentQuotes(zoneId),
          fetchBasePendingDispatches(zoneId),
        ]);

        setUrgentQuotes(quotes);
        setPendingDispatches(dispatches);
        setError(null);
      } catch (loadError) {
        setError(
          `No se pudieron actualizar los pedidos: ${getErrorMessage(loadError)}`,
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [zoneId],
  );

  useEffect(() => {
    void loadData(true);

    const intervalId = window.setInterval(() => {
      void loadData(false);
    }, REFRESH_INTERVAL);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadData]);

  const openQuoteEditor = useCallback(
    (
      command: BaseUrgentQuote | BasePendingDispatch,
      mode: "create" | "edit",
    ) => {
      setEditor({
        id: command.id,
        originName: command.originName,
        originAddress: command.originAddress,
        destinationAddress: command.destinationAddress,
        currentCost: command.quotedCost,
        mode,
      });

      setPriceInput(
        command.quotedCost == null ? "" : String(command.quotedCost),
      );

      setError(null);
      setSuccessMessage(null);
    },
    [],
  );

  const closeQuoteEditor = useCallback(() => {
    if (isSaving) return;

    setEditor(null);
    setPriceInput("");
  }, [isSaving]);

  const handleSaveQuote = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!editor) return;

    const normalizedPrice = priceInput.trim().replace(",", ".");
    const price = Number(normalizedPrice);

    if (
      normalizedPrice === "" ||
      !Number.isFinite(price) ||
      !Number.isSafeInteger(price) ||
      price <= 0
    ) {
      setError("Ingresá un importe válido, expresado en pesos enteros.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await baseQuoteOrder(editor.id, price);

      setEditor(null);
      setPriceInput("");

      setSuccessMessage(
        editor.mode === "edit"
          ? "Cotización actualizada correctamente."
          : "Cotización registrada correctamente.",
      );

      // El servidor puede cambiar el estado después de cotizar.
      // Volvemos a consultar para mostrar el estado real.
      await loadData(false);
    } catch (saveError) {
      setError(
        `No se pudo guardar la cotización: ${getErrorMessage(saveError)}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAcceptDispatch = async (
    command: BasePendingDispatch,
  ) => {


    setAcceptingId(command.id);
    setError(null);
    setSuccessMessage(null);

    try {
      await baseAcceptDispatch(command.id);

      setSuccessMessage("Despacho aceptado correctamente.");

      await loadData(false);
    } catch (acceptError) {
      setError(
        `No se pudo aceptar el despacho: ${getErrorMessage(acceptError)}`,
      );
    } finally {
      setAcceptingId(null);
    }
  };

  const filteredQuotes = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es-AR");

    if (!query) return urgentQuotes;

    return urgentQuotes.filter((command) =>
      [
        command.id,
        command.businessId,
        command.originName,
        command.originAddress,
        command.destinationAddress,
        command.quotedCost,
      ].some((value) =>
        String(value ?? "")
          .toLocaleLowerCase("es-AR")
          .includes(query),
      ),
    );
  }, [urgentQuotes, search]);

  const filteredDispatches = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es-AR");

    if (!query) return pendingDispatches;

    return pendingDispatches.filter((command) =>
      [
        command.id,
        command.orderId,
        command.businessId,
        command.originName,
        command.originAddress,
        command.destinationAddress,
        command.quotedCost,
      ].some((value) =>
        String(value ?? "")
          .toLocaleLowerCase("es-AR")
          .includes(query),
      ),
    );
  }, [pendingDispatches, search]);

  const activeCount =
    activeTab === "quotes"
      ? filteredQuotes.length
      : filteredDispatches.length;

  return (
    <section className="min-h-full space-y-5 text-slate-900">
      {/* Encabezado */}
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Truck size={20} />
          </div>

          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-tight sm:text-xl">
              Logística
            </h1>

            <p className="text-sm text-slate-500">
              Cotizaciones y despachos
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void loadData(false)}
          disabled={isRefreshing || isLoading}
          aria-label="Actualizar pedidos"
          title="Actualizar pedidos"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-3"
        >
          <RefreshCw
            size={16}
            className={isRefreshing ? "animate-spin" : ""}
          />

          <span className="ml-2 hidden text-sm font-medium sm:inline">
            Actualizar
          </span>
        </button>
      </header>

      {/* Mensajes */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0" />

          <p className="min-w-0 flex-1">{error}</p>

          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Cerrar error"
            className="rounded-md p-1 hover:bg-red-100"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          <Check size={17} className="shrink-0" />

          <p className="min-w-0 flex-1">{successMessage}</p>

          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            aria-label="Cerrar mensaje"
            className="rounded-md p-1 hover:bg-emerald-100"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Panel */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* Pestañas y búsqueda */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-3 sm:p-4">
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("quotes")}
              className={`flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
                activeTab === "quotes"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Cotizaciones
              <span className="text-xs tabular-nums">
                {urgentQuotes.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("dispatches")}
              className={`flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
                activeTab === "dispatches"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Despachos
              <span className="text-xs tabular-nums">
                {pendingDispatches.length}
              </span>
            </button>
          </div>

          <div className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar comercio, dirección o pedido..."
              aria-label="Buscar pedidos"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />
          </div>
        </div>

        {/* Resultados */}
        <div className="p-3 sm:p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <Loader2
                size={25}
                className="animate-spin text-slate-400"
              />

              <p className="mt-3 text-sm text-slate-500">
                Cargando pedidos...
              </p>
            </div>
          ) : (
            <DeliveryLists
              activeTab={activeTab}
              quotes={filteredQuotes}
              dispatches={filteredDispatches}
              search={search}
              acceptingId={acceptingId}
              onQuote={(command, mode) =>
                openQuoteEditor(command, mode)
              }
              onAcceptDispatch={(command) =>
                void handleAcceptDispatch(command)
              }
            />
          )}

          <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-400">
            <span>
              {activeCount} {activeCount === 1 ? "resultado" : "resultados"}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Actualización automática
            </span>
          </footer>
        </div>
      </div>

      {/* Editor */}
      {editor && (
        <QuoteEditor
          editor={editor}
          priceInput={priceInput}
          isSaving={isSaving}
          onPriceChange={setPriceInput}
          onClose={closeQuoteEditor}
          onSubmit={handleSaveQuote}
        />
      )}
    </section>
  );
}