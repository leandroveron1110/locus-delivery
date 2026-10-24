import React, { useMemo, useState } from "react";
import { useDeliveryCommands } from "./hooks/useDeliveryCommands";
import { CommandTable, CommandGroup } from "./components/CommandTable";
import { QuoteModal } from "./components/QuoteModal";
import { CommandFilters, Filter } from "./components/CommandFilters";
import { OrderCommand } from "./types/delivery-command.types";
import { useUpdateDeliveryCommand } from "./hooks/useUpdateDeliveryCommand";
import { requestDeliveryDispatch } from "./api/delivery-commands.api";

export const DeliveryCommandsPage: React.FC = () => {
  const { commands, isLoading, error, refetch } = useDeliveryCommands();

  const { mutate: updateCommand, isUpdating } = useUpdateDeliveryCommand();

  const [activeFilter, setActiveFilter] = useState<Filter>("PENDING");

  // Comando que se está cotizando por primera vez
  const [selectedQuoteCommand, setSelectedQuoteCommand] =
    useState<OrderCommand | null>(null);

  // Comando cuyo precio existente queremos editar
  const [selectedPriceCommand, setSelectedPriceCommand] =
    useState<OrderCommand | null>(null);

  // ==========================================================================
  // CONTEO POR ESTADO
  // ==========================================================================

  const filterCounts = useMemo(() => {
    const counts: Record<Filter, number> = {
      PENDING: 0,
      PROCESSING: 0,
      COMPLETED: 0,
      FAILED: 0,
      ALL: commands.length,
    };

    commands.forEach((cmd) => {
      if (cmd.status in counts) {
        counts[cmd.status as Filter]++;
      }
    });

    return counts;
  }, [commands]);

  // ==========================================================================
  // FILTRADO Y ORDEN
  // ==========================================================================

  const filteredCommands = useMemo(() => {
    return [...commands]
      .filter((cmd) => {
        if (activeFilter === "ALL") {
          return true;
        }

        return cmd.status === activeFilter;
      })
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  }, [commands, activeFilter]);

  // ==========================================================================
  // AGRUPAR POR COMERCIO
  // ==========================================================================

  const groupedCommands = useMemo<CommandGroup[]>(() => {
    const groups: Record<string, CommandGroup> = {};

    filteredCommands.forEach((cmd) => {
      const storeKey =
        cmd.originName?.replace(/, Concepción Del Uruguay/i, "").trim() ||
        "Comercio General";

      if (!groups[storeKey]) {
        groups[storeKey] = {
          originName: storeKey,
          originAddress: cmd.originAddress || undefined,
          commands: [],
        };
      }

      groups[storeKey].commands.push(cmd);
    });

    return Object.values(groups);
  }, [filteredCommands]);

  // ==========================================================================
  // MÉTRICA DE URGENCIA
  // ==========================================================================

  const criticalCount = useMemo(() => {
    const now = new Date().getTime();

    return commands.filter((cmd) => {
      if (cmd.status !== "PENDING") {
        return false;
      }

      const diffMins = (now - new Date(cmd.createdAt).getTime()) / 60000;

      return diffMins >= 15;
    }).length;
  }, [commands]);

  // ==========================================================================
  // ACEPTAR DESPACHO
  // ==========================================================================

  const handleAcceptDispatch = async (commandId: string) => {
    try {
      await updateCommand(commandId, {
        status: "PROCESSING",
      });

      await refetch(1);
    } catch (err) {
      console.error("No se pudo aceptar el despacho:", err);
    }
  };

  // ==========================================================================
  // COTIZAR
  // ==========================================================================
  //
  // Esta operación es la cotización inicial.
  // Por eso cambia PENDING → COMPLETED.
  //

  const handleSaveQuote = async (commandId: string, cost: number) => {
    try {
      const comm = commands.find((c) => c.id == commandId);
      if (comm) {
        console.log(comm)
        if (comm.command === "DISPATCH") {
          
          await updateCommand(commandId, {
            quotedCost: cost,
          });
        
        } else {
          await updateCommand(commandId, {
            status: "COMPLETED",
            quotedCost: cost,
          });
        }

        setSelectedQuoteCommand(null);

        await refetch(1);
      }
    } catch (err) {
      console.error("No se pudo guardar la cotización:", err);
    }
  };

  // ==========================================================================
  // EDITAR PRECIO
  // ==========================================================================
  //
  // Acá NO cambiamos el estado.
  // Solamente reemplazamos quotedCost.
  //

  const handleSavePrice = async (commandId: string, cost: number) => {
    try {
      const comm = commands.find((c) => c.id == commandId);
      if (comm) {
        console.log(comm)
        if (comm.command === "DISPATCH") {
          await updateCommand(commandId, {
            quotedCost: cost,
          });
        } else {
          await updateCommand(commandId, {
            status: "COMPLETED",
            quotedCost: cost,
          });
        }

        setSelectedQuoteCommand(null);

        await refetch(1);
      }
    } catch (err) {
      console.error("No se pudo guardar la cotización:", err);
    }
  };

  // ==========================================================================
  // LOADING INICIAL
  // ==========================================================================

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm font-bold text-gray-500">
        Cargando operaciones en tiempo real...
      </div>
    );
  }

  // ==========================================================================
  // ERROR
  // ==========================================================================

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
        Error al conectar con la central de comandos.
      </div>
    );
  }

  // ==========================================================================
  // UI
  // ==========================================================================

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-4">
      {/* HEADER DE COMANDO */}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              Central de Despacho
            </h1>

            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />

              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>

          <p className="text-xs text-gray-500 mt-0.5">
            Monitoreo activo de solicitudes y asignaciones consolidadas por
            comercio.
          </p>
        </div>

        {/* MÉTRICAS Y ACTUALIZACIÓN */}

        <div className="flex items-center gap-3">
          {criticalCount > 0 && (
            <div className="px-3.5 py-1.5 rounded-xl bg-red-100 text-red-800 border border-red-200 font-extrabold text-xs flex items-center gap-1.5 animate-pulse">
              <span>{criticalCount} Críticos (&gt;15 min)</span>
            </div>
          )}

          <button
            onClick={() => refetch(1)}
            disabled={isUpdating}
            className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 text-xs font-bold transition-all cursor-pointer"
          >
            🔄 Actualizar
          </button>
        </div>
      </header>

      {/* FILTROS */}

      <div className="flex items-center justify-between gap-4">
        <CommandFilters
          value={activeFilter}
          onChange={setActiveFilter}
          counts={filterCounts}
        />
      </div>

      {/* TABLA */}

      <CommandTable
        groupedCommands={groupedCommands}
        onOpenQuoteModal={setSelectedQuoteCommand}
        onAcceptDispatch={handleAcceptDispatch}
        onEditPrice={setSelectedPriceCommand}
      />

      {/* ================================================================== */}
      {/* MODAL: COTIZACIÓN INICIAL */}
      {/* ================================================================== */}

      {selectedQuoteCommand && (
        <QuoteModal
          command={selectedQuoteCommand}
          onClose={() => setSelectedQuoteCommand(null)}
          onSubmit={handleSaveQuote}
        />
      )}

      {/* ================================================================== */}
      {/* MODAL: EDITAR PRECIO */}
      {/* ================================================================== */}

      {selectedPriceCommand && (
        <QuoteModal
          command={selectedPriceCommand}
          onClose={() => setSelectedPriceCommand(null)}
          onSubmit={handleSavePrice}
        />
      )}
    </main>
  );
};
