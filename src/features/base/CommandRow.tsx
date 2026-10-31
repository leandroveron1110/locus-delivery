"use client";

import {
  ArrowDownLeft,
  Check,
  Clock3,
  FileText,
  Navigation,
  Pencil,
  Truck,
  UsersRound,
  PackageCheck,
  PackageX,
  Copy,
  CheckCheck,
  MapPinOff,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  LogisticsCommandStatusV2,
  type BasePendingDispatch,
  type BaseUrgentQuote,
} from "@/mini-back/infrastructure/network/base-delivery-api";

import { formatARS } from "@/utils/currency";
import { getElapsedTime } from "@/utils/date";
import { cleanDeliveryAddress } from "@/utils/clean-delivery-address";
import { GeoPickerModal } from "./GeoPickerModal"; // <--- Importamos el componente separado

type QuoteCommand = BaseUrgentQuote | BasePendingDispatch;
type CopyTarget = "destination" | "notes" | "all";

interface CommandRowProps {
  command: QuoteCommand;
  isQuote: boolean;
  showOriginDetail?: boolean;
  actionLoading?: boolean;
  onQuote: (command: QuoteCommand, mode: "create" | "edit") => void;
  onAcceptDispatch: (command: BasePendingDispatch) => void;
  onAssignDispatch: (command: BasePendingDispatch) => void;
  onCompleteDispatch?: (command: BasePendingDispatch) => void;
  onSaveDestinationCoords: (
    commandId: string,
    lat: number,
    lng: number,
    address: string
  ) => void;
}

type StatusPresentation = {
  label: string;
  className: string;
};

const LOGISTICS_STATUS_PRESENTATION: Record<
  LogisticsCommandStatusV2,
  StatusPresentation
> = {
  [LogisticsCommandStatusV2.PENDING]: {
    label: "Pendiente",
    className: "bg-slate-100 text-slate-700",
  },
  [LogisticsCommandStatusV2.QUOTED]: {
    label: "Cotizado",
    className: "bg-blue-100 text-blue-800",
  },
  [LogisticsCommandStatusV2.ACCEPTED]: {
    label: "Aceptado",
    className: "bg-indigo-100 text-indigo-800",
  },
  [LogisticsCommandStatusV2.ASSIGNED]: {
    label: "Cadete asignado",
    className: "bg-violet-100 text-violet-800",
  },
  [LogisticsCommandStatusV2.IN_TRANSIT]: {
    label: "En camino",
    className: "bg-amber-100 text-amber-800",
  },
  [LogisticsCommandStatusV2.COMPLETED]: {
    label: "Completado",
    className: "bg-emerald-100 text-emerald-800",
  },
  [LogisticsCommandStatusV2.REJECTED]: {
    label: "Rechazado",
    className: "bg-red-100 text-red-800",
  },
};

function cleanLocalText(
  value: string | null | undefined,
  fallback: string,
): string {
  if (!value?.trim()) return fallback;
  return value.replace(/,\s*Concepción del Uruguay/gi, "").trim() || fallback;
}

function getCommandNotes(command: QuoteCommand): string {
  if (!("notes" in command)) return "";
  return typeof command.notes === "string" ? command.notes.trim() : "";
}

function getOrigin(command: QuoteCommand): string {
  return cleanLocalText(command.originName, "Comercio");
}

function getOriginAddress(command: QuoteCommand): string {
  return cleanLocalText(command.originAddress, "En local");
}

function getDestination(command: QuoteCommand): string {
  return cleanLocalText(command.destinationAddress, "Sin destino");
}

function getRequiredCouriers(command: QuoteCommand): number {
  if (!("requiredCouriers" in command)) return 1;
  const count = command.requiredCouriers;
  return typeof count === "number" && Number.isFinite(count) && count > 0
    ? count
    : 1;
}

function getAssignedCouriers(command: QuoteCommand): number {
  if (!("requiredCouriers" in command)) return 1;
  const count = command.assignedCouriers;
  return typeof count === "number" && Number.isFinite(count) && count > 0
    ? count
    : 1;
}

function getIsShareable(command: QuoteCommand): boolean {
  if (!("isShareable" in command)) return false;
  return typeof command.isShareable === "boolean" ? command.isShareable : false;
}

function hasValidCoords(command: QuoteCommand): boolean {
  const lat = (command as any).destinationLatitude;
  const lng = (command as any).destinationLongitude;
  return lat != null && lng != null && String(lat) !== "" && String(lng) !== "";
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function getTravelSummary(command: QuoteCommand): string {
  const notes = getCommandNotes(command);
  const requiredCouriers = getRequiredCouriers(command);
  const assignedCouriers =  getAssignedCouriers(command);
  const isShareable = getIsShareable(command);

  return [
    `RETIRO: ${getOrigin(command)} (${getOriginAddress(command)})`,
    `DESTINO: ${getDestination(command)}`,
    `CADETES REQUERIDOS: ${requiredCouriers}`,
    `CAJA COMPARTIBLE: ${isShareable ? "Sí" : "No"}`,
    notes ? `NOTA: ${notes}` : "",
    command.quotedCost != null
      ? `COSTO: ${formatARS(command.quotedCost)}`
      : "COSTO: Pendiente",
  ]
    .filter(Boolean)
    .join("\n");
}

export function CommandRow({
  command,
  isQuote,
  showOriginDetail = false,
  actionLoading = false,
  onQuote,
  onAcceptDispatch,
  onAssignDispatch,
  onCompleteDispatch,
  onSaveDestinationCoords,
}: CommandRowProps) {
  const [copiedTarget, setCopiedTarget] = useState<CopyTarget | null>(null);
  const [copyError, setCopyError] = useState(false);
  const [isGeoModalOpen, setIsGeoModalOpen] = useState(false);

  const notes = getCommandNotes(command);
  const destination = getDestination(command);
  const requiredCouriers = getRequiredCouriers(command);
  const assignedCouriers =  getAssignedCouriers(command);
  const isShareable = getIsShareable(command);
  const hasPrice = command.quotedCost != null;
  const hasCoords = hasValidCoords(command);

  const logisticsStatus =
    command.logisticsStatus ?? LogisticsCommandStatusV2.PENDING;
  const statusInfo =
    LOGISTICS_STATUS_PRESENTATION[logisticsStatus] ||
    LOGISTICS_STATUS_PRESENTATION[LogisticsCommandStatusV2.PENDING];

  const elapsedTime = getElapsedTime(command.createdAt);
  const isCritical = elapsedTime.minutes >= 15;
  const isWarning = elapsedTime.minutes >= 8 && elapsedTime.minutes < 15;

  useEffect(() => {
    if (!copiedTarget && !copyError) return;
    const timeoutId = window.setTimeout(() => {
      setCopiedTarget(null);
      setCopyError(false);
    }, 1800);
    return () => window.clearTimeout(timeoutId);
  }, [copiedTarget, copyError]);

  const handleCopy = async (text: string, target: CopyTarget) => {
    setCopyError(false);
    setCopiedTarget(null);
    const success = await copyText(text);
    setCopiedTarget(success ? target : null);
    setCopyError(!success);
  };

  const handleQuote = () => {
    onQuote(command, hasPrice ? "edit" : "create");
  };

  return (
    <>
      <tr className="group border-b border-slate-100 transition-colors hover:bg-slate-50/90">
        {/* 1. ESTADO, TIEMPO, CADETES Y CAJA */}
        <td className="whitespace-nowrap px-3 py-2 align-middle">
          <div className="flex flex-col gap-1 min-w-[130px]">
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-bold tabular-nums ${
                  isCritical
                    ? "bg-red-100 text-red-800 animate-pulse"
                    : isWarning
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-700"
                }`}
              >
                <Clock3 size={12} />
                {elapsedTime.label}
              </span>

              <span
                className={`p-1 rounded ${
                  isQuote
                    ? "text-violet-700 bg-violet-50"
                    : "text-blue-700 bg-blue-50"
                }`}
                title={isQuote ? "Cotización" : "Despacho"}
              >
                {isQuote ? <ArrowDownLeft size={12} /> : <Truck size={12} />}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
              <span
                className="flex items-center gap-1"
                title={`${requiredCouriers} cadete(s)`}
              >
                <UsersRound size={12} className="text-slate-400" />
                <span className="font-bold text-slate-800">
                  {requiredCouriers} / {assignedCouriers}
                </span>
                <span className="text-[10px] text-slate-500">
                  {requiredCouriers === 1 ? "cad." : "cads."} / {assignedCouriers}
                </span>
              </span>

              <span className="text-slate-300">•</span>

              <span>
                {isShareable ? (
                  <span
                    className="text-emerald-700 font-bold flex items-center gap-0.5 bg-emerald-50 px-1 rounded"
                    title="Caja compartible"
                  >
                    <PackageCheck size={12} /> Comp.
                  </span>
                ) : (
                  <span
                    className="text-slate-500 flex items-center gap-0.5"
                    title="No compartible (Exclusivo)"
                  >
                    <PackageX size={12} /> Excl.
                  </span>
                )}
              </span>
            </div>
          </div>
        </td>

        {/* 2. DESTINO + ACCESO AL MAPA */}
        <td className="max-w-[260px] px-3 py-2 align-middle">
          <div className="flex items-start gap-1.5">
            <button
              type="button"
              onClick={() => setIsGeoModalOpen(true)}
              title={
                hasCoords
                  ? "Ubicación en mapa OK (Clic para ver/corregir)"
                  : "⚠️ Sin geolocalización. Clic para buscar en mapa"
              }
              className={`mt-0.5 shrink-0 rounded p-0.5 transition ${
                hasCoords
                  ? "text-violet-600 hover:bg-violet-50"
                  : "bg-amber-100 text-amber-700 hover:bg-amber-200 animate-bounce"
              }`}
            >
              {hasCoords ? <Navigation size={13} /> : <MapPinOff size={13} />}
            </button>

            <div className="min-w-0 flex-1">
              <div
                onClick={() =>
                  void handleCopy(
                    cleanDeliveryAddress(destination),
                    "destination",
                  )
                }
                title="Clic para copiar destino"
                className="cursor-pointer group/dest"
              >
                <div className="flex items-center gap-1">
                  <span className="truncate text-xs font-bold text-slate-900 group-hover/dest:text-violet-700">
                    {cleanDeliveryAddress(destination)}
                  </span>

                  {!hasCoords && (
                    <span className="shrink-0 rounded bg-amber-100 px-1 py-0.2 text-[9px] font-bold text-amber-800">
                      Sin mapa
                    </span>
                  )}
                </div>

                {showOriginDetail && (
                  <p className="mt-0.5 truncate text-[10px] text-amber-700">
                    Retiro: {getOriginAddress(command)}
                  </p>
                )}

                {copiedTarget === "destination" && (
                  <span className="block text-[10px] font-bold text-emerald-600">
                    ¡Copiado!
                  </span>
                )}
              </div>
            </div>
          </div>
        </td>

        {/* 3. NOTA */}
        <td className="max-w-[150px] px-3 py-2 align-middle">
          {notes ? (
            <div
              onClick={() => void handleCopy(notes, "notes")}
              title={notes}
              className="cursor-pointer truncate rounded border border-amber-200/50 bg-amber-50/70 px-2 py-0.5 text-xs text-amber-900 hover:bg-amber-100"
            >
              <span className="truncate">{notes}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-300">—</span>
          )}
        </td>

        {/* 4. PRECIO Y ESTADO LOGÍSTICO */}
        <td className="whitespace-nowrap px-3 py-2 align-middle">
          <div className="flex flex-col gap-1">
            {hasPrice ? (
              <span className="text-xs font-black tabular-nums text-slate-900">
                {formatARS(command.quotedCost!)}
              </span>
            ) : (
              <span className="w-fit rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-bold text-amber-700">
                Pendiente
              </span>
            )}

            <span
              className={`inline-flex w-fit items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${statusInfo.className}`}
            >
              {statusInfo.label}
            </span>
          </div>
        </td>

        {/* 5. ACCIONES RÁPIDAS */}
        <td className="sticky right-0 z-10 whitespace-nowrap bg-white px-3 py-2 align-middle shadow-[-6px_0_8px_-8px_rgba(0,0,0,0.1)] group-hover:bg-slate-50">
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => void handleCopy(getTravelSummary(command), "all")}
              title="Copiar resumen"
              className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
            >
              {copiedTarget === "all" ? (
                <Check size={13} className="text-emerald-600" />
              ) : (
                <Copy size={13} />
              )}
            </button>

            <button
              type="button"
              onClick={handleQuote}
              className="inline-flex h-7 items-center gap-1 rounded border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:border-violet-300 hover:bg-violet-50"
            >
              <Pencil size={11} />
              <span>{hasPrice ? "Editar" : "Cotizar"}</span>
            </button>

            {!isQuote && (
              <>
                {logisticsStatus === LogisticsCommandStatusV2.PENDING ||
                logisticsStatus === LogisticsCommandStatusV2.QUOTED ? (
                  <button
                    type="button"
                    onClick={() =>
                      onAcceptDispatch(command as BasePendingDispatch)
                    }
                    disabled={actionLoading}
                    className="inline-flex h-7 items-center gap-1 rounded bg-emerald-600 px-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                    title="Aceptar el despacho"
                  >
                    <Check size={11} />
                    <span>Aceptar</span>
                  </button>
                ) : logisticsStatus === LogisticsCommandStatusV2.ACCEPTED ? (
                  <button
                    type="button"
                    onClick={() =>
                      onAssignDispatch(command as BasePendingDispatch)
                    }
                    disabled={actionLoading}
                    className="inline-flex h-7 items-center gap-1 rounded bg-violet-600 px-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50"
                    title="Marcar que el despacho ya tiene un cadete asignado"
                  >
                    <UsersRound size={12} />
                    <span>Asignar</span>
                  </button>
                ) : logisticsStatus === LogisticsCommandStatusV2.ASSIGNED ? (
                  <span className="px-1 text-[11px] font-medium italic text-violet-700">
                    Esperando retiro
                  </span>
                ) : logisticsStatus === LogisticsCommandStatusV2.IN_TRANSIT ? (
                  <button
                    type="button"
                    onClick={() =>
                      onCompleteDispatch?.(command as BasePendingDispatch)
                    }
                    disabled={actionLoading}
                    className="inline-flex h-7 items-center gap-1 rounded bg-blue-600 px-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                    title="Confirmar que el pedido fue entregado"
                  >
                    <CheckCheck size={12} />
                    <span>Completar</span>
                  </button>
                ) : (
                  <span className="px-1 text-[11px] font-medium italic text-slate-400">
                    Finalizado
                  </span>
                )}
              </>
            )}
          </div>
        </td>
      </tr>

      {/* MODAL CON MAPA */}
      <GeoPickerModal
        isOpen={isGeoModalOpen}
        onClose={() => setIsGeoModalOpen(false)}
        initialAddress={cleanDeliveryAddress(destination)}
        initialLat={Number((command as any).destinationLatitude) || null}
        initialLng={Number((command as any).destinationLongitude) || null}
        onSave={(lat, lng, address) => onSaveDestinationCoords(command.id, lat, lng, address)}
      />
    </>
  );
}
