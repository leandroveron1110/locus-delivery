import React, { useState, useEffect } from "react";
import { OrderCommand } from "../types/delivery-command.types";
import { getElapsedTime } from "@/utils/date";
import { formatARS } from "@/utils/currency";
import { Navigation, Check, FileText, Lock } from "lucide-react";

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

  const isCritical = minutes >= 15;
  const isWarning = minutes >= 8 && minutes < 15;
  const isQuote = command.command === "QUOTE";

  const cleanOrigin =
    command.originName?.replace(/, Concepción Del Uruguay/i, "").trim() ||
    "Comercio";
  const cleanOriginAddress =
    command.originAddress?.replace(/, Concepción Del Uruguay/i, "").trim() ||
    "En local";
  const cleanDestinationAddress =
    command.destinationAddress?.replace(/, Concepción Del Uruguay/i, "").trim() ||
    "Sin destino";

  const handleCopy = (text: string, fieldKey: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isQuote || !text) return;

    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 1200);
  };

  const fullSummary = [
    `RETIRO: ${cleanOrigin} (${cleanOriginAddress})`,
    `DESTINO: ${cleanDestinationAddress}`,
    command.notes ? `NOTA: ${command.notes}` : "",
    command.quotedCost ? `COSTO: ${formatARS(command.quotedCost)}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

  const handleAcceptAndCopy = () => {
    handleCopy(fullSummary, "all");
    onAcceptDispatch(command.id);
  };

  return (
    <tr className="hover:bg-slate-50 transition-colors select-none text-xs">
      {/* 1. TIPO Y TIEMPO */}
      <td
        onClick={(e) => handleCopy(fullSummary, "all", e)}
        title={isQuote ? "Consulta de costo" : "Clic para copiar TODO el viaje"}
        className={`px-4 py-2.5 transition-all border-l-4 ${
          !isQuote ? "cursor-pointer" : "cursor-default"
        } ${copiedField === "all" ? "bg-emerald-100" : ""} ${
          isCritical
            ? "border-l-red-500"
            : isWarning
            ? "border-l-amber-400"
            : "border-l-emerald-500"
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border flex items-center gap-0.5 ${
              isQuote
                ? "bg-purple-100 text-purple-900 border-purple-200"
                : "bg-blue-100 text-blue-900 border-blue-200"
            }`}
          >
            {isQuote && <Lock className="w-2.5 h-2.5 text-purple-700" />}
            {isQuote ? "Cotizar" : "Despacho"}
          </span>

          <div className="flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${
                isCritical
                  ? "bg-red-600 animate-ping"
                  : isWarning
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
            />
            <span className="font-extrabold text-slate-800">{label}</span>
          </div>

          {copiedField === "all" && (
            <span className="text-[9px] font-black text-emerald-800 bg-emerald-200 px-1 rounded flex items-center gap-0.5">
              <Check className="w-2.5 h-2.5" /> ¡Copiado!
            </span>
          )}
        </div>
      </td>

      {/* 2. DESTINO Y NOTAS */}
      <td
        onClick={(e) => handleCopy(cleanDestinationAddress, "dest", e)}
        title={isQuote ? "Consulta de costo" : "Clic para copiar DESTINO"}
        className={`px-4 py-2.5 ${
          !isQuote ? "cursor-pointer hover:bg-purple-50/60" : "cursor-default"
        } ${copiedField === "dest" ? "bg-emerald-100 font-bold" : ""}`}
      >
        <div className="flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span className="font-extrabold text-slate-900 text-xs truncate">
            {cleanDestinationAddress}
          </span>
          {copiedField === "dest" && (
            <span className="text-[9px] font-black text-emerald-800 bg-emerald-200 px-1 rounded">
              Copiado
            </span>
          )}
        </div>

        {command.notes && (
          <div className="mt-0.5">
            <span
              onClick={(e) => handleCopy(command.notes!, "notes", e)}
              className={`text-[10px] font-bold rounded px-1.5 py-0.5 inline-flex items-center gap-1 border ${
                copiedField === "notes"
                  ? "bg-emerald-200 text-emerald-900 border-emerald-300"
                  : "bg-amber-100 text-amber-900 border-amber-200"
              }`}
            >
              <FileText className="w-2.5 h-2.5 text-amber-700 shrink-0" />
              {command.notes}
            </span>
          </div>
        )}
      </td>

      {/* 3. COSTO */}
      <td className="px-4 py-2.5 whitespace-nowrap">
        {command.quotedCost ? (
          <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
            {formatARS(command.quotedCost)}
          </span>
        ) : (
          <span className="text-xs text-slate-400 italic">Pendiente</span>
        )}
      </td>

      {/* 4. ACCIÓN */}
      <td className="px-4 py-2.5 text-right whitespace-nowrap">
        {isQuote ? (
          <button
            onClick={() => onOpenQuoteModal(command)}
            className="h-8 px-3 rounded-md bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-xs transition-all cursor-pointer"
          >
            Cotizar
          </button>
        ) : (
          <button
            onClick={handleAcceptAndCopy}
            className="h-8 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs transition-all cursor-pointer inline-flex items-center gap-1"
          >
            Aceptar Pedido
          </button>
        )}
      </td>
    </tr>
  );
};