
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  Loader2,
  RefreshCw,
  Search,
  Truck,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import {
  baseAcceptDispatch,
  baseAssignedDispatch,
  baseCompletedDispatch,
  baseDestinationCoords,
  baseQuoteOrder,
  fetchBasePendingDispatches,
  fetchBaseUrgentQuotes,
  type BasePendingDispatch,
  type BaseUrgentQuote,
} from "@/mini-back/infrastructure/network/base-delivery-api";

import DeliveryLists from "./DeliveryLists";
import QuoteEditor, { QuoteEditorState } from "./QuoteEditor";
import { listenDeliveryCommands } from "./service/delivery-realtime.listener";
import { ConnectionStatus } from "@/lib/ConnectionStatus";

interface BaseDeliveryPanelV2Props {
  zoneId?: string;
}

type PanelTab = "quotes" | "dispatches";

type DeliveryCommandEvent = {
  eventId: string;
  eventType: string;
  occurredAt: string;
  payload: {
    id: string;
    businessId: string;
    orderId: string | null;

    originName: string | null;
    originAddress: string | null;
    originLatitude: number | null;
    originLongitude: number | null;

    destinationAddress: string | null;
    destinationLatitude: number | null;
    destinationLongitude: number | null;

    quotedCost: number | null;

    businessStatus: string;
    logisticsStatus: string;

    requiredCouriers: number;
    assignedCouriers: number;
    isShareable: boolean;

    notes: string | null;
    createdAt: string;
    updatedAt?: string;

    zoneId: string | null;
  };
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Ocurrió un error inesperado.";
}

function isToday(date: string): boolean {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return false;

  const now = new Date();

  return (
    parsedDate.getFullYear() === now.getFullYear() &&
    parsedDate.getMonth() === now.getMonth() &&
    parsedDate.getDate() === now.getDate()
  );
}

function isUrgentQuote(command: DeliveryCommandEvent["payload"]): boolean {
  return (
    command.businessStatus === "QUOTE_REQUESTED" &&
    command.logisticsStatus === "PENDING"
  );
}

function isPendingDispatch(command: DeliveryCommandEvent["payload"]): boolean {
  return (
    command.businessStatus === "DISPATCH_REQUESTED" &&
    command.logisticsStatus !== "COMPLETED" &&
    command.logisticsStatus !== "REJECTED"
  );
}

function toBaseUrgentQuote(
  command: DeliveryCommandEvent["payload"],
): BaseUrgentQuote {
  return {
    id: command.id,
    businessId: command.businessId,
    orderId: command.orderId ?? "",

    originName: command.originName,
    originAddress: command.originAddress,
    destinationAddress: command.destinationAddress,

    quotedCost: command.quotedCost,

    businessStatus: command.businessStatus as BaseUrgentQuote["businessStatus"],
    logisticsStatus: command.logisticsStatus as BaseUrgentQuote["logisticsStatus"],

    destinationLatitude:
      command.destinationLatitude == null
        ? null
        : String(command.destinationLatitude),

    destinationLongitude:
      command.destinationLongitude == null
        ? null
        : String(command.destinationLongitude),

    originLatitude:
      command.originLatitude == null
        ? null
        : String(command.originLatitude),

    originLongitude:
      command.originLongitude == null
        ? null
        : String(command.originLongitude),

    requiredCouriers: command.requiredCouriers,
    assignedCouriers: command.assignedCouriers,
    isShareable: command.isShareable,

    notes: command.notes ?? "",
    createdAt: command.createdAt,
    updatedAt: command.updatedAt,
  };
}

function toBasePendingDispatch(
  command: DeliveryCommandEvent["payload"],
): BasePendingDispatch {
  return {
    id: command.id,
    businessId: command.businessId,
    orderId: command.orderId ?? undefined,

    originName: command.originName,
    originAddress: command.originAddress,
    destinationAddress: command.destinationAddress,

    destinationLatitude:
      command.destinationLatitude == null
        ? null
        : String(command.destinationLatitude),

    destinationLongitude:
      command.destinationLongitude == null
        ? null
        : String(command.destinationLongitude),

    originLatitude:
      command.originLatitude == null
        ? null
        : String(command.originLatitude),

    originLongitude:
      command.originLongitude == null
        ? null
        : String(command.originLongitude),

    quotedCost: command.quotedCost,

    requiredCouriers: command.requiredCouriers,
    assignedCouriers: command.assignedCouriers,
    isShareable: command.isShareable,

    businessStatus: command.businessStatus as BasePendingDispatch["businessStatus"],
    logisticsStatus: command.logisticsStatus as BasePendingDispatch["logisticsStatus"],

    notes: command.notes ?? "",
    createdAt: command.createdAt,
    updatedAt: command.updatedAt,
  };
}

function playNotificationTones(frequencies: number[]) {
  if (typeof window === "undefined") return;

  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
    }).webkitAudioContext;

  if (!AudioContextClass) return;

  const audioContext = new AudioContextClass();

  void audioContext.resume().then(async () => {
    for (const frequency of frequencies) {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;

      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.15,
        audioContext.currentTime + 0.03,
      );
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + 0.22,
      );

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.23);

      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    await audioContext.close();
  }).catch(() => {
    void audioContext.close();
  });
}

export default function BaseDeliveryPanelV2({
  zoneId,
}: BaseDeliveryPanelV2Props) {
  const [activeTab, setActiveTab] = useState<PanelTab>("dispatches");

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

  const [soundEnabled, setSoundEnabled] = useState(false);

  const audioEnabledRef = useRef(false);

  useEffect(() => {
    audioEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // --------------------------------------------------
  // CARGA REST INICIAL Y ACTUALIZACIÓN MANUAL
  // --------------------------------------------------

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
  }, [loadData]);

  // --------------------------------------------------
  // ACTUALIZACIÓN CENTRALIZADA DE ÓRDENES
  // --------------------------------------------------

  const handleCommandEvent = useCallback(
    (event: DeliveryCommandEvent) => {
      const command = event.payload;

      if (!command?.id) return;

      const belongsToZone = !zoneId || command.zoneId === zoneId;
      const belongsToToday = isToday(command.createdAt);

      const shouldShow = belongsToZone && belongsToToday;

      const shouldBeQuote =
        shouldShow && isUrgentQuote(command);

      const shouldBeDispatch =
        shouldShow && isPendingDispatch(command);

      // Actualizar o quitar de cotizaciones.
      setUrgentQuotes((current) => {
        const withoutCommand = current.filter(
          (item) => item.id !== command.id,
        );

        if (!shouldBeQuote) return withoutCommand;

        return [...withoutCommand, toBaseUrgentQuote(command)];
      });

      // Actualizar o quitar de despachos.
      setPendingDispatches((current) => {
        const withoutCommand = current.filter(
          (item) => item.id !== command.id,
        );

        if (!shouldBeDispatch) return withoutCommand;

        return [...withoutCommand, toBasePendingDispatch(command)];
      });
    },
    [zoneId],
  );

  // --------------------------------------------------
  // EVENTOS WEBSOCKET
  // --------------------------------------------------

  useEffect(() => {
    const unsubscribe = listenDeliveryCommands(
      (event: DeliveryCommandEvent) => {
        handleCommandEvent(event);

        const command = event.payload;

        if (!audioEnabledRef.current) return;
        if (!command?.createdAt || !isToday(command.createdAt)) return;
        if (zoneId && command.zoneId !== zoneId) return;

        if (isPendingDispatch(command)) {
          playNotificationTones([660, 880]);
        } else if (isUrgentQuote(command)) {
          playNotificationTones([1046, 1318]);
        }
      },
      (event: DeliveryCommandEvent) => {
        handleCommandEvent(event);
      },
    );

    return unsubscribe;
  }, [handleCommandEvent, zoneId]);

  // --------------------------------------------------
  // SONIDO
  // --------------------------------------------------

  const enableNotificationAudio = useCallback(() => {
    playNotificationTones([523]);
    setSoundEnabled(true);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((current) => !current);
  }, []);

  // --------------------------------------------------
  // EDITOR DE COTIZACIONES
  // --------------------------------------------------

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

      // La lista se actualiza mediante delivery.command.updated.
    } catch (saveError) {
      setError(
        `No se pudo guardar la cotización: ${getErrorMessage(saveError)}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  // --------------------------------------------------
  // ACCIONES DE DESPACHOS
  // --------------------------------------------------

  const handleAcceptDispatch = async (
    command: BasePendingDispatch,
  ) => {
    setAcceptingId(command.id);
    setError(null);
    setSuccessMessage(null);

    try {
      await baseAcceptDispatch(command.id);

      setSuccessMessage("Despacho aceptado correctamente.");

      // La lista se actualiza mediante delivery.command.updated.
    } catch (acceptError) {
      setError(
        `No se pudo aceptar el despacho: ${getErrorMessage(acceptError)}`,
      );
    } finally {
      setAcceptingId(null);
    }
  };

  const onAssignDispatch = async (
    command: BasePendingDispatch,
  ) => {
    setAcceptingId(command.id);
    setError(null);
    setSuccessMessage(null);

    try {
      await baseAssignedDispatch(command.id);

      setSuccessMessage("Asignación registrada correctamente.");
    } catch (assignError) {
      setError(
        `No se pudo asignar el despacho: ${getErrorMessage(assignError)}`,
      );
    } finally {
      setAcceptingId(null);
    }
  };

  const onSaveDestinationCoords = async (
    commandId: string,
    lat: number,
    lng: number,
    address: string,
  ) => {
    setAcceptingId(commandId);
    setError(null);
    setSuccessMessage(null);

    try {
      await baseDestinationCoords(commandId, {
        destinationAddress: address,
        destinationLatitude: lat,
        destinationLongitude: lng,
      });

      setSuccessMessage("Dirección actualizada correctamente.");
    } catch (coordsError) {
      setError(
        `No se pudo actualizar la dirección: ${getErrorMessage(coordsError)}`,
      );
    } finally {
      setAcceptingId(null);
    }
  };

  const handleCompletedDispatch = async (
    command: BasePendingDispatch,
  ) => {
    setAcceptingId(command.id);
    setError(null);
    setSuccessMessage(null);

    try {
      await baseCompletedDispatch(command.id);

      setSuccessMessage("Despacho completado correctamente.");
    } catch (completeError) {
      setError(
        `No se pudo completar el despacho: ${getErrorMessage(completeError)}`,
      );
    } finally {
      setAcceptingId(null);
    }
  };

  // --------------------------------------------------
  // BÚSQUEDA
  // --------------------------------------------------

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

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <section className="min-h-full space-y-5 text-slate-900">
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

            <ConnectionStatus />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSound}
            title={
              soundEnabled
                ? "Desactivar sonidos"
                : "Activar sonidos"
            }
            aria-label={
              soundEnabled
                ? "Desactivar sonidos"
                : "Activar sonidos"
            }
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50"
          >
            {soundEnabled ? (
              <Volume2 size={17} />
            ) : (
              <VolumeX size={17} />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (!soundEnabled) {
                enableNotificationAudio();
              } else {
                toggleSound();
              }

              loadData(true)

            }}
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
        </div>
      </header>

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

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
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
              onSetInTransit={(command) =>
                handleCompletedDispatch(command)
              }
              onQuote={(command, mode) =>
                openQuoteEditor(command, mode)
              }
              onAcceptDispatch={(command) =>
                void handleAcceptDispatch(command)
              }
              onSaveDestinationCoords={onSaveDestinationCoords}
              onAssignDispatch={onAssignDispatch}
            />
          )}

          <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-400">
            <span>
              {activeCount}{" "}
              {activeCount === 1 ? "resultado" : "resultados"}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Actualización en tiempo real
            </span>
          </footer>
        </div>
      </div>

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
