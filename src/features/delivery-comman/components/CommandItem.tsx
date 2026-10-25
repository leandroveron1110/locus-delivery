"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  Check,
  Clock3,
  Copy,
  FileText,
  Loader2,
  MapPin,
  Navigation,
  Pencil,
  Truck,
} from "lucide-react";

import {
  type BasePendingDispatch,
  type BaseUrgentQuote,
} from "@/mini-back/infrastructure/network/base-delivery-api";

import { cleanDeliveryAddress } from "@/utils/clean-delivery-address";
import { getElapsedTime } from "@/utils/date";
import { formatARS } from "@/utils/currency";

type PanelTab = "quotes" | "dispatches";

type QuoteCommand = BaseUrgentQuote | BasePendingDispatch;

interface DeliveryListsProps {
  activeTab: PanelTab;
  quotes: BaseUrgentQuote[];
  dispatches: BasePendingDispatch[];
  search: string;
  acceptingId: string | null;

  onQuote: (
    command: QuoteCommand,
    mode: "create" | "edit",
  ) => void;

  onAcceptDispatch: (command: BasePendingDispatch) => void;
}

type CopyField = "destination" | "notes" | "all";

interface CommandRowProps {
  command: QuoteCommand;
  isQuote: boolean;
  accepting: boolean;
  onQuote: (
    command: QuoteCommand,
    mode: "create" | "edit",
  ) => void;
  onAcceptDispatch: (command: BasePendingDispatch) => void;
}

function cleanLocalText(
  value: string | null | undefined,
  fallback: string,
): string {
  if (!value?.trim()) return fallback;

  return value
    .replace(/,\s*Concepción del Uruguay/gi, "")
    .trim() || fallback;
}

function getCommandNotes(command: QuoteCommand): string {
  if (!("notes" in command)) return "";

  return typeof command.notes === "string"
    ? command.notes.trim()
    : "";
}

function getCommandTypeLabel(isQuote: boolean): string {
  return isQuote ? "Cotización" : "Despacho";
}

function CommandRow({
  command,
  isQuote,
  accepting,
  onQuote,
  onAcceptDispatch,
}: CommandRowProps) {
  const [copiedField, setCopiedField] = useState<CopyField | null>(
    null,
  );

  const [copyError, setCopyError] = useState(false);

  const [elapsedTime, setElapsedTime] = useState(() =>
    getElapsedTime(command.createdAt),
  );

  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    setElapsedTime(getElapsedTime(command.createdAt));

    const intervalId = window.setInterval(() => {
      setElapsedTime(getElapsedTime(command.createdAt));
    }, 30_000);

    return () => window.clearInterval(intervalId);
  }, [command.createdAt]);

  useEffect(() => {
    if (!copiedField && !copyError) return;

    const timeoutId = window.setTimeout(() => {
      setCopiedField(null);
      setCopyError(false);
    }, 1600);

    return () => window.clearTimeout(timeoutId);
  }, [copiedField, copyError]);

  const { label, minutes } = elapsedTime;

  const isCritical = minutes >= 15;
  const isWarning = minutes >= 8 && minutes < 15;

  const cleanOrigin = cleanLocalText(
    command.originName,
    "Comercio",
  );

  const cleanOriginAddress = cleanLocalText(
    command.originAddress,
    "En local",
  );

  const cleanDestinationAddress = cleanLocalText(
    command.destinationAddress,
    "Sin destino",
  );

  const notes = getCommandNotes(command);

  const summary = [
    `RETIRO: ${cleanOrigin} (${cleanOriginAddress})`,
    `DESTINO: ${cleanDestinationAddress}`,
    notes ? `NOTA: ${notes}` : "",
    command.quotedCost != null
      ? `COSTO: ${formatARS(command.quotedCost)}`
      : "",
  ]
    .filter(Boolean)
    .join(" | ");

  const copyText = async (
    text: string,
    field: CopyField,
  ): Promise<boolean> => {
    if (!text.trim()) return false;

    setCopyError(false);

    try {
      await navigator.clipboard.writeText(text);

      setCopiedField(field);

      return true;
    } catch {
      setCopiedField(null);
      setCopyError(true);

      return false;
    }
  };

  const handleCopyDestination = () => {
    void copyText(cleanDestinationAddress, "destination");
  };

  const handleCopyNotes = () => {
    if (notes) {
      void copyText(notes, "notes");
    }
  };

  const handleCopyAll = () => {
    void copyText(summary, "all");
  };

  const handleAccept = () => {
    if (isQuote || accepting) return;

    // La copia no debe impedir la aceptación si falla el portapapeles.
    void copyText(summary, "all");

    onAcceptDispatch(command as BasePendingDispatch);
  };

  return (
    <article
      className={`relative border-b border-slate-100 transition-colors last:border-b-0 ${
        copiedField === "all" ? "bg-emerald-50/70" : "bg-white"
      }`}
    >
      {/* Indicador de urgencia */}
      <div
        className={`absolute inset-y-0 left-0 w-1 ${
          isCritical
            ? "bg-red-500"
            : isWarning
              ? "bg-amber-400"
              : "bg-emerald-500"
        }`}
      />

      <div className="grid grid-cols-1 gap-3 py-3 pl-3 pr-1 sm:px-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        {/* Información del pedido */}
        <div className="min-w-0 space-y-2">
          {/* Tipo, tiempo y estado de copia */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                isQuote
                  ? "bg-violet-50 text-violet-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {isQuote ? (
                <ArrowDownLeft size={11} />
              ) : (
                <Truck size={11} />
              )}

              {getCommandTypeLabel(isQuote)}
            </span>

            <span
              className={`inline-flex items-center gap-1 text-xs font-bold tabular-nums ${
                isCritical
                  ? "text-red-600"
                  : isWarning
                    ? "text-amber-600"
                    : "text-slate-600"
              }`}
              title="Tiempo transcurrido desde la creación"
            >
              <Clock3 size={13} />

              {label}

              {isCritical && (
                <span className="rounded bg-red-50 px-1 py-0.5 text-[9px] uppercase">
                  Urgente
                </span>
              )}
            </span>

            {copiedField && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                <Check size={12} />

                {copiedField === "destination"
                  ? "Destino copiado"
                  : copiedField === "notes"
                    ? "Nota copiada"
                    : "Viaje copiado"}
              </span>
            )}

            {copyError && (
              <span className="text-[10px] font-medium text-red-600">
                No se pudo copiar
              </span>
            )}
          </div>

          {/* Origen */}
          <div className="flex min-w-0 items-start gap-2">
            <MapPin
              size={14}
              className="mt-0.5 shrink-0 text-slate-400"
            />

            <div className="min-w-0">
              <span className="mr-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Retiro
              </span>

              <span className="break-words text-sm font-semibold text-slate-800">
                {cleanOrigin}
              </span>

              <p className="break-words text-xs text-slate-500">
                {cleanOriginAddress}
              </p>
            </div>
          </div>

          {/* Destino con copia rápida */}
          <div className="flex min-w-0 items-start gap-2">
            <Navigation
              size={14}
              className="mt-0.5 shrink-0 text-violet-500"
            />

            <div className="min-w-0 flex-1">
              <span className="mr-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Destino
              </span>

              <p className="break-words text-sm font-bold text-slate-900">
                {cleanDestinationAddress}
              </p>
            </div>

            {!isQuote && (
              <button
                type="button"
                onClick={handleCopyDestination}
                title="Copiar dirección de destino"
                aria-label="Copiar dirección de destino"
                className={`inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border px-2 text-xs font-semibold transition ${
                  copiedField === "destination"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {copiedField === "destination" ? (
                  <Check size={13} />
                ) : (
                  <Copy size={13} />
                )}

                <span className="hidden xs:inline">Copiar</span>
              </button>
            )}
          </div>

          {/* Nota */}
          {notes && (
            <button
              type="button"
              onClick={handleCopyNotes}
              title="Copiar nota"
              className={`flex max-w-full items-start gap-1.5 rounded-md border px-2 py-1 text-left text-xs transition ${
                copiedField === "notes"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
              }`}
            >
              {copiedField === "notes" ? (
                <Check size={12} className="mt-0.5 shrink-0" />
              ) : (
                <FileText
                  size={12}
                  className="mt-0.5 shrink-0"
                />
              )}

              <span className="break-words">{notes}</span>
            </button>
          )}

          {/* Precio e identificador */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span>
              {command.quotedCost != null ? (
                <>
                  <span className="mr-1">Costo:</span>

                  <span className="font-bold text-slate-900">
                    {formatARS(command.quotedCost)}
                  </span>
                </>
              ) : (
                <span className="font-medium text-amber-700">
                  Precio pendiente
                </span>
              )}
            </span>

            {!isQuote && (
              <span className="text-slate-400">
                Pedido #{command.orderId.slice(0, 8)}
              </span>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 lg:justify-end lg:border-0 lg:pt-0">
          {!isQuote && (
            <button
              type="button"
              onClick={handleCopyAll}
              disabled={isCopying}
              title="Copiar retiro, destino, nota y costo"
              className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition ${
                copiedField === "all"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {isCopying ? (
                <Loader2 size={14} className="animate-spin" />
              ) : copiedField === "all" ? (
                <Check size={14} />
              ) : (
                <Copy size={14} />
              )}

              Copiar viaje
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              onQuote(
                command,
                command.quotedCost == null ? "create" : "edit",
              )
            }
            className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-bold transition ${
              isQuote
                ? "bg-violet-600 text-white hover:bg-violet-700"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Pencil size={13} />

            {isQuote
              ? command.quotedCost == null
                ? "Cotizar"
                : "Corregir precio"
              : "Editar precio"}
          </button>

          {!isQuote && (
            <button
              type="button"
              onClick={handleAccept}
              disabled={accepting}
              className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              {accepting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}

              {accepting ? "Aceptando..." : "Aceptar"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function EmptyState({
  activeTab,
  search,
}: {
  activeTab: PanelTab;
  search: string;
}) {
  const hasSearch = Boolean(search.trim());

  return (
    <div className="px-4 py-10 text-center">
      <p className="text-sm font-semibold text-slate-700">
        {hasSearch
          ? "No hay resultados"
          : activeTab === "quotes"
            ? "No hay cotizaciones pendientes"
            : "No hay despachos pendientes"}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {hasSearch
          ? "Probá con otro comercio, dirección o pedido."
          : "Los nuevos pedidos van a aparecer acá."}
      </p>
    </div>
  );
}

export default function DeliveryLists({
  activeTab,
  quotes,
  dispatches,
  search,
  acceptingId,
  onQuote,
  onAcceptDispatch,
}: DeliveryListsProps) {
  const isQuotes = activeTab === "quotes";
  const commands: QuoteCommand[] = isQuotes
    ? quotes
    : dispatches;

  if (commands.length === 0) {
    return (
      <EmptyState
        activeTab={activeTab}
        search={search}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg">
      {commands.map((command) => {
        const isAccepting =
          !isQuotes && acceptingId === command.id;

        return (
          <CommandRow
            key={command.id}
            command={command}
            isQuote={isQuotes}
            accepting={isAccepting}
            onQuote={onQuote}
            onAcceptDispatch={onAcceptDispatch}
          />
        );
      })}
    </div>
  );
}