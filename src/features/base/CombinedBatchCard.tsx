"use client";

import React, { useState } from "react";
import {
  Check,
  Clock3,
  Copy,
  Layers,
  Navigation,
  Pencil,
  Store,
} from "lucide-react";

import {
  type BasePendingDispatch,
  type BaseUrgentQuote,
} from "@/mini-back/infrastructure/network/base-delivery-api";

import { formatARS } from "@/utils/currency";
import { getElapsedTime } from "@/utils/date";
import { cleanDeliveryAddress } from "@/utils/clean-delivery-address";

type QuoteCommand = BaseUrgentQuote | BasePendingDispatch;

interface CombinedBatchCardProps {
  primaryCommand: QuoteCommand;
  secondaryCommand: QuoteCommand;
  isQuote: boolean;
  acceptingId: string | null;
  onQuote: (command: QuoteCommand, mode: "create" | "edit") => void;
  // Modificamos para que acepte el lote completo o los dos comandos juntos
  onAcceptBatch?: (primary: BasePendingDispatch, secondary: BasePendingDispatch) => void;
  onAcceptDispatch: (command: BasePendingDispatch) => void;
}

function cleanLocalText(value: string | null | undefined, fallback: string): string {
  if (!value?.trim()) return fallback;
  return value.replace(/,\s*Concepción del Uruguay/gi, "").trim() || fallback;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function CombinedBatchCard({
  primaryCommand,
  secondaryCommand,
  isQuote,
  acceptingId,
  onQuote,
  onAcceptBatch,
  onAcceptDispatch,
}: CombinedBatchCardProps) {
  const [copied, setCopied] = useState(false);

  const primaryCost = primaryCommand.quotedCost ?? 0;
  const secondaryCost = secondaryCommand.quotedCost ?? 0;
  const totalCost = primaryCost + secondaryCost;
  const hasPrices = primaryCommand.quotedCost != null && secondaryCommand.quotedCost != null;

  const isAccepting =
    acceptingId === primaryCommand.id || acceptingId === secondaryCommand.id;

  const elapsedTime1 = getElapsedTime(primaryCommand.createdAt);
  const elapsedTime2 = getElapsedTime(secondaryCommand.createdAt);
  const maxElapsedMinutes = Math.max(elapsedTime1.minutes, elapsedTime2.minutes);
  const isCritical = maxElapsedMinutes >= 15;

  const handleCopyBatch = async () => {
    const summary = [
      "=== LOTE COMBINADO (2 PEDIDOS) ===",
      `1) Origen: ${cleanLocalText(primaryCommand.originName, "Comercio")} (${cleanLocalText(primaryCommand.originAddress, "Local")})`,
      `   Destino: ${cleanDeliveryAddress(primaryCommand.destinationAddress, "Sin destino")}`,
      `   Costo: ${primaryCommand.quotedCost != null ? formatARS(primaryCommand.quotedCost) : "Pendiente"}`,
      "",
      `2) Origen: ${cleanLocalText(secondaryCommand.originName, "Comercio")} (${cleanLocalText(secondaryCommand.originAddress, "Local")})`,
      `   Destino: ${cleanDeliveryAddress(secondaryCommand.destinationAddress, "Sin destino")}`,
      `   Costo: ${secondaryCommand.quotedCost != null ? formatARS(secondaryCommand.quotedCost) : "Pendiente"}`,
      "",
      `TOTAL VIAJE: ${formatARS(totalCost)}`,
    ].join("\n");

    const success = await copyText(summary);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleAcceptAll = () => {
    if (isQuote) return;
    if (onAcceptBatch) {
      onAcceptBatch(primaryCommand as BasePendingDispatch, secondaryCommand as BasePendingDispatch);
    } else {
      // Fallback por si manejan la aceptación individual secuencial
      onAcceptDispatch(primaryCommand as BasePendingDispatch);
      onAcceptDispatch(secondaryCommand as BasePendingDispatch);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-emerald-300 bg-white shadow-md transition-all">
      {/* Cabecera del Lote */}
      <div className="flex items-center justify-between bg-emerald-600 px-4 py-2.5 text-white">
        <div className="flex items-center gap-2">
          <Layers size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">
            Lote Sugerido para 1 Cadete (Proximidad H3 ~450m)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded bg-emerald-700/80 px-2 py-0.5 text-[11px] font-bold tabular-nums ${
              isCritical ? "text-amber-200" : "text-white"
            }`}
          >
            <Clock3 size={11} /> Máx. {Math.max(elapsedTime1.minutes, elapsedTime2.minutes)} min
          </span>
          <span className="rounded bg-emerald-800 px-2 py-0.5 text-[11px] font-bold">
            2 Pedidos
          </span>
        </div>
      </div>

      {/* Contenido de los 2 pedidos en filas limpias */}
      <div className="divide-y divide-slate-100 p-3 space-y-3">
        {/* Pedido 1 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
                <Store size={12} /> {cleanLocalText(primaryCommand.originName, "Comercio")}
              </span>
              <span className="text-slate-400 text-[11px]">({cleanLocalText(primaryCommand.originAddress, "Local")})</span>
            </div>
            <div className="flex items-start gap-1.5">
              <Navigation size={13} className="mt-0.5 shrink-0 text-violet-500" />
              <p className="text-sm font-semibold text-slate-800 truncate">
                {cleanDeliveryAddress(primaryCommand.destinationAddress, "Sin destino")}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <div className="text-right">
              <p className="text-sm font-bold tabular-nums text-slate-900">
                {primaryCommand.quotedCost != null ? formatARS(primaryCommand.quotedCost) : "Sin cotizar"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onQuote(primaryCommand, primaryCommand.quotedCost != null ? "edit" : "create")}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-bold text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition"
            >
              <Pencil size={12} />
              {primaryCommand.quotedCost != null ? "Corregir" : "Cotizar"}
            </button>
          </div>
        </div>

        {/* Pedido 2 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
                <Store size={12} /> {cleanLocalText(secondaryCommand.originName, "Comercio")}
              </span>
              <span className="text-slate-400 text-[11px]">({cleanLocalText(secondaryCommand.originAddress, "Local")})</span>
            </div>
            <div className="flex items-start gap-1.5">
              <Navigation size={13} className="mt-0.5 shrink-0 text-violet-500" />
              <p className="text-sm font-semibold text-slate-800 truncate">
                {cleanDeliveryAddress(secondaryCommand.destinationAddress, "Sin destino")}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <div className="text-right">
              <p className="text-sm font-bold tabular-nums text-slate-900">
                {secondaryCommand.quotedCost != null ? formatARS(secondaryCommand.quotedCost) : "Sin cotizar"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onQuote(secondaryCommand, secondaryCommand.quotedCost != null ? "edit" : "create")}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-bold text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition"
            >
              <Pencil size={12} />
              {secondaryCommand.quotedCost != null ? "Corregir" : "Cotizar"}
            </button>
          </div>
        </div>
      </div>

      {/* Pie unificado de la tarjeta con Total y Botón Único de Aceptar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border-t border-slate-200/80 px-4 py-3">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total del viaje combinado
            </span>
            <span className="text-base font-black text-slate-900 tabular-nums">
              {hasPrices ? formatARS(totalCost) : "Cotización incompleta"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyBatch}
            title="Copiar resumen completo del lote"
            className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition ${
              copied ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Copy size={14} />
            {copied ? "¡Copiado!" : "Copiar Lote"}
          </button>

          {!isQuote && (
            <button
              type="button"
              onClick={handleAcceptAll}
              disabled={isAccepting || !hasPrices}
              title={!hasPrices ? "Ambos pedidos deben estar cotizados para aceptar el lote" : "Aceptar ambos pedidos para un solo cadete"}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={15} />
              <span>{isAccepting ? "Aceptando..." : "Aceptar Lote Completo"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}