import React, { useState } from "react";
import { OrderCommand } from "../types/delivery-command.types";
import { CommandItem } from "./CommandItem";
import {
  Store,
  ChevronDown,
  ChevronRight,
  Package,
} from "lucide-react";

export interface CommandGroup {
  originName: string;
  originAddress?: string;
  commands: OrderCommand[];
}

interface Props {
  groupedCommands: CommandGroup[];
  onOpenQuoteModal: (command: OrderCommand) => void;
  onAcceptDispatch: (commandId: string) => void;
  onEditPrice: (command: OrderCommand) => void;
}

export const CommandTable: React.FC<Props> = ({
  groupedCommands,
  onOpenQuoteModal,
  onAcceptDispatch,
  onEditPrice,
}) => {
  if (groupedCommands.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
        <div className="text-3xl mb-2">🎉</div>

        <h3 className="text-gray-800 font-bold text-base">
          Sin operaciones pendientes
        </h3>

        <p className="text-gray-400 text-xs mt-1">
          Todos los despachos y cotizaciones se encuentran al día.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groupedCommands.map((group) => (
        <StoreGroupAccordion
          key={group.originName}
          group={group}
          onOpenQuoteModal={onOpenQuoteModal}
          onAcceptDispatch={onAcceptDispatch}
          onEditPrice={onEditPrice}
        />
      ))}
    </div>
  );
};

const StoreGroupAccordion: React.FC<{
  group: CommandGroup;
  onOpenQuoteModal: (command: OrderCommand) => void;
  onAcceptDispatch: (commandId: string) => void;
  onEditPrice: (command: OrderCommand) => void;
}> = ({
  group,
  onOpenQuoteModal,
  onAcceptDispatch,
  onEditPrice,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const cleanAddress =
    group.originAddress
      ?.replace(/, Concepción Del Uruguay/i, "")
      .trim() || "En local";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all">
      {/* CABECERA DEL COMERCIO */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-700 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <button className="text-slate-400 hover:text-white">
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-purple-400" />

            <h2 className="font-extrabold text-sm tracking-wide">
              {group.originName}
            </h2>

            <span className="text-xs text-slate-400 font-medium">
              ({cleanAddress})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-purple-500/20 text-purple-200 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-purple-400/30 flex items-center gap-1">
            <Package className="w-3 h-3" />

            {group.commands.length}{" "}
            {group.commands.length === 1 ? "pedido" : "pedidos"}
          </span>
        </div>
      </div>

      {/* TABLA DE PEDIDOS */}
      {isOpen && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="px-4 py-2">
                  Tipo / Tiempo
                </th>

                <th className="px-4 py-2">
                  Destino / Notas
                </th>

                <th className="px-4 py-2">
                  Monto
                </th>

                <th className="px-4 py-2 text-right">
                  Acción Operativa
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {group.commands.map((command) => (
                <CommandItem
                  key={command.id}
                  command={command}
                  onOpenQuoteModal={onOpenQuoteModal}
                  onAcceptDispatch={onAcceptDispatch}
                  onEditPrice={onEditPrice}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
