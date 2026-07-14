import React from "react";
import { OrderCommand } from "../types/delivery-command.types";
import { CommandItem } from "./CommandItem";

interface Props {
  commands: OrderCommand[];
  onOpenQuoteModal: (command: OrderCommand) => void;
  onAcceptDispatch: (commandId: string) => void;
}

export const CommandTable: React.FC<Props> = ({
  commands,
  onOpenQuoteModal,
  onAcceptDispatch,
}) => {
  if (commands.length === 0) {
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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3">Tipo / Espera</th>
              <th className="px-4 py-3">Origen (Comercio)</th>
              <th className="px-4 py-3">Destino / Entrega</th>
              <th className="px-4 py-3">Monto</th>
              <th className="px-4 py-3 text-right">Acción Operativa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {commands.map((command) => (
              <CommandItem
                key={command.id}
                command={command}
                onOpenQuoteModal={onOpenQuoteModal}
                onAcceptDispatch={onAcceptDispatch}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};