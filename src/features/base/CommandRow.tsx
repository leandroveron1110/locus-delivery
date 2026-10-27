"use client";

import {
  ArrowDownLeft,
  Check,
  Clock3,
  FileText,
  MapPin,
  Navigation,
  Pencil,
  Truck,
  UsersRound,
  PackageCheck,
  PackageX,
  CircleHelp,
  Copy,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  type BasePendingDispatch,
  type BaseUrgentQuote,
} from "@/mini-back/infrastructure/network/base-delivery-api";

import { formatARS } from "@/utils/currency";
import { getElapsedTime } from "@/utils/date";
import { cleanDeliveryAddress } from "@/utils/clean-delivery-address";

type QuoteCommand = BaseUrgentQuote | BasePendingDispatch;
type CopyTarget = "destination" | "notes" | "all";

interface CommandRowProps {
  command: QuoteCommand;
  isQuote: boolean;
  showOriginDetail?: boolean;
  accepting: boolean;
  onQuote: (command: QuoteCommand, mode: "create" | "edit") => void;
  onAcceptDispatch: (command: BasePendingDispatch) => void;
}

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

function getRequiredCouriers(command: QuoteCommand): number | null {
  if (!("requiredCouriers" in command)) return null;
  const count = command.requiredCouriers;
  return typeof count === "number" && Number.isFinite(count) && count > 0 ? count : null;
}

function getIsShareable(command: QuoteCommand): boolean | null {
  if (!("isShareable" in command)) return null;
  return typeof command.isShareable === "boolean" ? command.isShareable : null;
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
  const isShareable = getIsShareable(command);

  return [
    `RETIRO: ${getOrigin(command)} (${getOriginAddress(command)})`,
    `DESTINO: ${getDestination(command)}`,
    requiredCouriers !== null ? `CADETES REQUERIDOS: ${requiredCouriers}` : "",
    isShareable === true
      ? "CAJA COMPARTIBLE: Sí"
      : isShareable === false
        ? "CAJA COMPARTIBLE: No"
        : "CAJA COMPARTIBLE: No informado",
    notes ? `NOTA: ${notes}` : "",
    command.quotedCost != null ? `COSTO: ${formatARS(command.quotedCost)}` : "COSTO: Pendiente",
  ]
    .filter(Boolean)
    .join("\n");
}

export function CommandRow({
  command,
  isQuote,
  showOriginDetail = false,
  accepting,
  onQuote,
  onAcceptDispatch,
}: CommandRowProps) {
  const [copiedTarget, setCopiedTarget] = useState<CopyTarget | null>(null);
  const [copyError, setCopyError] = useState(false);

  const notes = getCommandNotes(command);
  const destination = getDestination(command);
  const requiredCouriers = getRequiredCouriers(command);
  const isShareable = getIsShareable(command);
  const hasPrice = command.quotedCost != null;

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

  const handleCopy = async (text: string, target: CopyTarget): Promise<void> => {
    setCopyError(false);
    setCopiedTarget(null);
    const success = await copyText(text);
    setCopiedTarget(success ? target : null);
    setCopyError(!success);
  };

  const handleQuote = () => {
    onQuote(command, hasPrice ? "edit" : "create");
  };

  const handleAccept = () => {
    if (isQuote || accepting) return;
    onAcceptDispatch(command as BasePendingDispatch);
  };

  return (
    <tr className="group border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50/80">
      {/* Metadatos agrupados */}
      <td className="whitespace-nowrap px-3 py-2.5 align-middle">
        <div className="flex flex-col gap-1 items-start min-w-[130px]">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold tabular-nums rounded px-1.5 py-0.5 ${
                isCritical
                  ? "bg-red-50 text-red-700"
                  : isWarning
                    ? "bg-amber-50 text-amber-700"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              <Clock3 size={11} />
              {elapsedTime.label}
              {isCritical && <span className="text-[9px] uppercase">Urgente</span>}
            </span>

            <span
              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                isQuote
                  ? "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200"
                  : "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200"
              }`}
            >
              {isQuote ? <ArrowDownLeft size={10} /> : <Truck size={10} />}
              {isQuote ? "Cotización" : "Despacho"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <UsersRound size={12} className="text-slate-400" />
              {requiredCouriers !== null ? (
                <span>{requiredCouriers} {requiredCouriers === 1 ? "cadete" : "cadetes"}</span>
              ) : (
                <span className="text-slate-400">S/I</span>
              )}
            </span>

            <span>•</span>

            <span className="flex items-center gap-1">
              {isShareable === true ? (
                <span className="text-emerald-700 flex items-center gap-0.5" title="Caja compartible">
                  <PackageCheck size={12} /> Comp.
                </span>
              ) : isShareable === false ? (
                <span className="text-slate-500 flex items-center gap-0.5" title="No compartible">
                  <PackageX size={12} /> Excl.
                </span>
              ) : (
                <span className="text-slate-400" title="Caja no indicada">
                  <CircleHelp size={12} /> S/I
                </span>
              )}
            </span>
          </div>
        </div>
      </td>

      {/* Destino */}
      <td className="min-w-[200px] max-w-[280px] px-3 py-2.5 align-middle">
        <div
          onClick={() => void handleCopy(cleanDeliveryAddress(destination), "destination")}
          title="Hacer clic para copiar la dirección de destino"
          className="flex items-start gap-2 cursor-pointer rounded p-1 -m-1 transition hover:bg-violet-50/60 group/dest"
        >
          <Navigation size={14} className="mt-0.5 shrink-0 text-violet-500 group-hover/dest:scale-110 transition-transform" />
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 break-words text-sm font-semibold text-slate-800 group-hover/dest:text-violet-900">
              {cleanDeliveryAddress(destination)}
            </p>
            
            {showOriginDetail && (
              <p className="text-[11px] text-amber-800 flex items-center gap-1 mt-0.5">
                <MapPin size={10} /> Retiro: {getOriginAddress(command)}
              </p>
            )}

            {copiedTarget === "destination" && (
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                <Check size={10} /> ¡Destino copiado!
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Nota */}
      <td className="min-w-[130px] max-w-[180px] px-3 py-2.5 align-middle">
        {notes ? (
          <div
            onClick={() => void handleCopy(notes, "notes")}
            title="Hacer clic para copiar la nota"
            className="flex max-w-full items-start gap-1.5 rounded-md px-2 py-1 text-xs text-amber-900 bg-amber-50/80 cursor-pointer transition hover:bg-amber-100 group/note"
          >
            <FileText size={12} className="mt-0.5 shrink-0 text-amber-600 group-hover/note:scale-110 transition-transform" />
            <div className="min-w-0 flex-1">
              <span className="line-clamp-2 break-words">{notes}</span>
              {copiedTarget === "notes" && (
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <Check size={10} /> ¡Nota copiada!
                </span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-xs text-slate-300">—</span>
        )}
      </td>

      {/* Precio */}
      <td className="whitespace-nowrap px-3 py-2.5 align-middle">
        {hasPrice ? (
          <div>
            <p className="text-sm font-bold tabular-nums text-slate-900">
              {formatARS(command.quotedCost!)}
            </p>
            <span className="text-[10px] font-medium text-emerald-700">
              Cotizado
            </span>
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold text-amber-700">Pendiente</p>
            <span className="text-[10px] text-slate-400">Sin precio</span>
          </div>
        )}
      </td>

      {/* Acciones con botones mejorados */}
      <td className="sticky right-0 z-10 whitespace-nowrap border-l border-slate-100 bg-white px-3 py-2.5 align-middle shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.3)] group-hover:bg-slate-50">
        <div className="flex items-center justify-end gap-2">
          {/* Botón Copiar Todo */}
          <button
            type="button"
            onClick={() => void handleCopy(getTravelSummary(command), "all")}
            title="Copiar resumen completo del viaje"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition shadow-sm ${
              copiedTarget === "all"
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {copiedTarget === "all" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          </button>

          {/* Botón Cotizar / Corregir */}
          <button
            type="button"
            onClick={handleQuote}
            title={hasPrice ? "Corregir precio del viaje" : "Cotizar viaje"}
            className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-bold shadow-sm transition ${
              hasPrice
                ? "border border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                : "bg-violet-600 text-white hover:bg-violet-700"
            }`}
          >
            <Pencil size={13} />
            <span>{hasPrice ? "Corregir" : "Cotizar"}</span>
          </button>

          {/* Botón Aceptar Despacho */}
          {!isQuote && (
            <button
              type="button"
              onClick={handleAccept}
              disabled={accepting}
              title="Aceptar despacho"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={13} />
              <span>{accepting ? "Aceptando..." : "Aceptar"}</span>
            </button>
          )}
        </div>

        {copyError && (
          <p className="mt-1 text-right text-[10px] text-red-600">
            Error al copiar
          </p>
        )}
      </td>
    </tr>
  );
}