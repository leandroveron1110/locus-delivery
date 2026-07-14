import React, { useState, useEffect } from "react";
import { OrderCommand } from "../types/delivery-command.types";
import { getElapsedTime } from "@/utils/date";
import { formatARS } from "@/utils/currency";
import { Store, MapPin, Navigation, Check, FileText, Lock } from "lucide-react";

interface Props {
  command: OrderCommand;
  onOpenQuoteModal: (command: OrderCommand) => void;
  onAcceptDispatch: (commandId: string) => void;
}

export const CommandItem: React.FC<Props> = ({
  command,
  onOpenQuoteModal,
  onAcceptDispatch,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Re-render dinámico del tiempo transcurrido
  const [elapsedTime, setElapsedTime] = useState(() =>
    getElapsedTime(command.createdAt)
  );

  useEffect(() => {
    setElapsedTime(getElapsedTime(command.createdAt));
    const intervalId = setInterval(() => {
      setElapsedTime(getElapsedTime(command.createdAt));
    }, 30000);

    return () => clearInterval(intervalId);
  }, [command.createdAt]);

  const { label, minutes } = elapsedTime;

  const isCritical = minutes >= 35;
  const isWarning = minutes >= 8 && minutes < 15;
  const isQuote = command.command === "QUOTE";

  // Sanitizado de datos
  const cleanOrigin = command.originName?.replace(/, Concepción Del Uruguay/i, "").trim() || "Comercio";
  const cleanOriginAddress = command.originAddress?.replace(/, Concepción Del Uruguay/i, "").trim() || "En local";
  const cleanDestinationAddress = command.destinationAddress?.replace(/, Concepción Del Uruguay/i, "").trim() || "Sin destino";

  // Copia rápida (BLOQUEADA si es Cotización)
  const handleCopy = (text: string, fieldKey: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isQuote || !text) return; // Si es cotización, no copia nada

    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 1200);
  };

  // Resumen completo formateado
  const fullSummary = [
    `RETIRO: ${cleanOrigin} (${cleanOriginAddress})`,
    `DESTINO: ${cleanDestinationAddress}`,
    command.notes ? `NOTA: ${command.notes}` : "",
    command.quotedCost ? `COSTO: ${formatARS(command.quotedCost)}` : ""
  ].filter(Boolean).join(" | ");

  const handleAcceptAndCopy = () => {
    handleCopy(fullSummary, "all");
    onAcceptDispatch(command.id);
  };

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors select-none">
      
      {/* 1. TIPO, SLA Y RESUMEN COMPLETO (Solo clickable si es Despacho) */}
      <td 
        onClick={(e) => handleCopy(fullSummary, "all", e)}
        title={isQuote ? "Consulta de costo (No copiable)" : "Clic para copiar TODO el viaje"}
        className={`px-4 py-3 transition-all border-l-4 relative ${
          !isQuote ? "cursor-pointer" : "cursor-default"
        } ${
          copiedField === "all" ? "bg-emerald-100/80" : ""
        } ${
          isCritical ? "border-l-red-500" : isWarning ? "border-l-amber-400" : "border-l-emerald-500"
        }`}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase border flex items-center gap-1 ${
                isQuote ? "bg-purple-100 text-purple-900 border-purple-200" : "bg-blue-100 text-blue-900 border-blue-200"
              }`}
            >
              {isQuote && <Lock className="w-2.5 h-2.5 text-purple-700" />}
              {isQuote ? "Cotización" : "Despacho"}
            </span>

            {copiedField === "all" && (
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Check className="w-3 h-3" /> ¡Todo Copiado!
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-2 h-2 rounded-full ${isCritical ? "bg-red-600 animate-ping" : isWarning ? "bg-amber-500" : "bg-emerald-500"}`} />
            <span className="text-xs font-black text-slate-800">{label}</span>
          </div>
        </div>
      </td>

      {/* 2. ORIGEN / RETIRO */}
      <td
        onClick={(e) => handleCopy(cleanOriginAddress, "originAddress", e)}
        title={isQuote ? "Consulta de costo (No copiable)" : "Clic para copiar DIRECCIÓN DE RETIRO"}
        className={`px-4 py-3 transition-all border-r border-slate-100 ${
          !isQuote ? "cursor-pointer hover:bg-purple-50/60 active:bg-purple-100" : "cursor-default"
        } ${
          copiedField === "originAddress" ? "bg-emerald-100/90 font-bold" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <div 
            onClick={(e) => handleCopy(cleanOrigin, "originName", e)}
            title={isQuote ? "Consulta de costo" : "Clic para copiar NOMBRE DEL COMERCIO"}
            className={`font-extrabold text-slate-900 text-sm truncate flex items-center gap-1.5 transition-colors ${
              !isQuote ? "hover:text-purple-700" : ""
            }`}
          >
            <Store className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span className="truncate">{cleanOrigin}</span>
          </div>

          {copiedField === "originName" && (
            <span className="text-[10px] font-black text-emerald-800 bg-emerald-200 px-1 rounded">Local Copiado</span>
          )}
          {copiedField === "originAddress" && (
            <span className="text-[10px] font-black text-emerald-800 bg-emerald-200 px-1 rounded">Dirección Copiada</span>
          )}
        </div>

        <div className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">{cleanOriginAddress}</span>
        </div>
      </td>

      {/* 3. DESTINO & NOTA INDEPENDIENTE */}
      <td
        onClick={(e) => handleCopy(cleanDestinationAddress, "dest", e)}
        title={isQuote ? "Consulta de costo (No copiable)" : "Clic para copiar DIRECCIÓN DE DESTINO"}
        className={`px-4 py-3 transition-all ${
          !isQuote ? "cursor-pointer hover:bg-purple-50/60 active:bg-purple-100" : "cursor-default"
        } ${
          copiedField === "dest" ? "bg-emerald-100/90 font-bold" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="font-extrabold text-slate-900 text-sm truncate flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span className="truncate">{cleanDestinationAddress}</span>
          </div>
          {copiedField === "dest" && (
            <span className="text-[10px] font-black text-emerald-800 bg-emerald-200 px-1 rounded">Destino Copiado</span>
          )}
        </div>

        {/* NOTA */}
        {command.notes && (
          <div className="mt-1 flex items-center gap-1">
            <div
              onClick={(e) => handleCopy(command.notes!, "notes", e)}
              title={isQuote ? "Consulta de costo" : "Clic para copiar ÚNICAMENTE LA NOTA"}
              className={`text-[11px] font-bold rounded px-2 py-0.5 inline-flex items-center gap-1 truncate max-w-full border transition-all ${
                !isQuote ? "cursor-pointer" : "cursor-default"
              } ${
                copiedField === "notes"
                  ? "bg-emerald-200 text-emerald-900 border-emerald-300"
                  : "bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-200"
              }`}
            >
              <FileText className="w-3 h-3 text-amber-700 shrink-0" />
              <span className="truncate">{command.notes}</span>
              {copiedField === "notes" && (
                <span className="text-[9px] uppercase font-black ml-1 text-emerald-800">¡Nota Copiada!</span>
              )}
            </div>
          </div>
        )}
      </td>

      {/* 4. COSTO */}
      <td className="px-4 py-3 whitespace-nowrap">
        {command.quotedCost ? (
          <span className="text-sm font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {formatARS(command.quotedCost)}
          </span>
        ) : (
          <span className="text-xs text-slate-400 font-medium italic">Pendiente</span>
        )}
      </td>

      {/* 5. ACCIÓN DIRECTA */}
      <td className="px-4 py-3 text-right whitespace-nowrap">
        {isQuote ? (
          <button
            onClick={() => onOpenQuoteModal(command)}
            className="h-10 px-5 rounded-lg bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-xs shadow-xs transition-all cursor-pointer"
          >
            Cotizar
          </button>
        ) : (
          <button
            onClick={handleAcceptAndCopy}
            className="h-10 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1 ml-auto"
          >
            Aceptar Pedido
          </button>
        )}
      </td>
    </tr>
  );
};