"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowDownUp,
  ChevronDown,
  ChevronUp,
  Layers,
  Search,
  Store,
  Truck,
  Sparkles,
} from "lucide-react";

import {
  LogisticsCommandStatusV2,
  type BasePendingDispatch,
  type BaseUrgentQuote,
} from "@/mini-back/infrastructure/network/base-delivery-api";

import { CommandRow } from "./CommandRow";
import { groupOrdersByH3Proximity, DeliveryBatch } from "@/utils/h3-batching";
import { CombinedBatchCard } from "./CombinedBatchCard";
import { cleanDeliveryAddress } from "@/utils/clean-delivery-address";

type PanelTab = "quotes" | "dispatches";
type ViewMode = "business" | "batches"; // Nueva vista para separar comercios vs agrupadores
type QuoteCommand = BaseUrgentQuote | BasePendingDispatch;
type SortOrder = "oldest" | "newest";

interface DeliveryListsProps {
  activeTab: PanelTab;
  quotes: BaseUrgentQuote[];
  dispatches: BasePendingDispatch[];
  search: string;
  acceptingId: string | null;
  onQuote: (command: QuoteCommand, mode: "create" | "edit") => void;
  onAcceptDispatch: (command: BasePendingDispatch) => void;
  onSetInTransit: (command: BasePendingDispatch) => void;
  onSaveDestinationCoords: (
    commandId: string,
    lat: number,
    lng: number,
    address: string,
  ) => Promise<void> | void;
}

interface GroupedBusiness {
  businessId: string;
  businessName: string;
  businessAddress: string;
  hasMultipleAddresses: boolean;
  commands: QuoteCommand[];
  totalCommands: number;
}

export default function DeliveryLists({
  activeTab,
  quotes,
  dispatches,
  search,
  acceptingId,
  onQuote,
  onAcceptDispatch,
  onSetInTransit,
  onSaveDestinationCoords,
}: DeliveryListsProps) {
  const isQuotes = activeTab === "quotes";
  const commands: QuoteCommand[] = isQuotes ? quotes : dispatches;

  const [sortOrder, setSortOrder] = useState<SortOrder>("oldest");
  const [viewMode, setViewMode] = useState<ViewMode>("business"); // "business" o "batches"
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});

  const toggleGroup = (id: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 1. Vista Agrupada por Comercios
  const groupedBusinesses = useMemo(() => {
    const sorted = [...commands].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortOrder === "oldest" ? aTime - bTime : bTime - aTime;
    });

    const map = new Map<
      string,
      {
        businessName: string;
        businessAddress: string;
        hasMultipleAddresses: boolean;
        commands: QuoteCommand[];
      }
    >();

    for (const command of sorted) {
      const key = command.businessId || command.originName || "unnamed";
      const address = cleanDeliveryAddress(command.originAddress, "");

      if (!map.has(key)) {
        map.set(key, {
          businessName: cleanDeliveryAddress(command.originName, "Comercio"),
          businessAddress: address,
          hasMultipleAddresses: false,
          commands: [],
        });
      }

      const entry = map.get(key)!;
      if (
        entry.businessAddress &&
        address &&
        entry.businessAddress !== address
      ) {
        entry.hasMultipleAddresses = true;
      }
      entry.commands.push(command);
    }

    const result: GroupedBusiness[] = [];
    for (const [businessId, group] of map.entries()) {
      result.push({
        businessId,
        businessName: group.businessName,
        businessAddress: group.businessAddress,
        hasMultipleAddresses: group.hasMultipleAddresses,
        commands: group.commands,
        totalCommands: group.commands.length,
      });
    }

    return result;
  }, [commands, sortOrder]);

  // 2. Vista Exclusiva de Lotes Sugeridos (H3 Proximity Across City)
  const allCityBatches = useMemo(() => {
    return groupOrdersByH3Proximity(
      commands.filter(
        (c) => c.logisticsStatus === LogisticsCommandStatusV2.PENDING,
      ),
    );
  }, [commands]);

  // Filtramos solo los lotes que realmente combinaron 2 pedidos para el apartado de lotes
  const combinedBatches = useMemo(() => {
    return allCityBatches.filter(
      (batch) => batch.isCombined && batch.secondaryCommand,
    );
  }, [allCityBatches]);

  if (commands.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <Truck className="mx-auto text-slate-400 mb-2" size={28} />
        <p className="text-sm font-bold text-slate-700">
          No hay pedidos disponibles
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controles superiores y Selector de Vista */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                {isQuotes ? "Cotizaciones" : "Despachos"}
              </h3>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold tabular-nums text-slate-600">
                {commands.length}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Gestión logística inteligente de la ciudad.
            </p>
          </div>

          {/* Selector de Modos de Vista */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode("business")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                viewMode === "business"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Store size={13} /> Por Comercios
            </button>
            <button
              type="button"
              onClick={() => setViewMode("batches")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                viewMode === "batches"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sparkles size={13} /> Lotes Sugeridos ({combinedBatches.length})
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setSortOrder((current) =>
              current === "oldest" ? "newest" : "oldest",
            )
          }
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowDownUp size={14} />
          {sortOrder === "oldest"
            ? "Más antiguos primero"
            : "Más recientes primero"}
        </button>
      </div>

      {/* Selector móvil de vista */}
      <div className="flex sm:hidden items-center gap-1 bg-slate-100 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => setViewMode("business")}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold transition ${
            viewMode === "business"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500"
          }`}
        >
          <Store size={13} /> Por Comercios
        </button>
        <button
          type="button"
          onClick={() => setViewMode("batches")}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold transition ${
            viewMode === "batches"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-500"
          }`}
        >
          <Sparkles size={13} /> Lotes Sugeridos ({combinedBatches.length})
        </button>
      </div>

      {/* ==================================================== */}
      {/* VISTA 1: POR COMERCIOS */}
      {/* ==================================================== */}
      {viewMode === "business" && (
        <div className="space-y-3">
          {groupedBusinesses.map((group) => {
            const isCollapsed = Boolean(collapsedGroups[group.businessId]);

            return (
              <div
                key={`group-${group.businessId}`}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(group.businessId)}
                  className="flex w-full items-center justify-between bg-slate-50/80 px-4 py-3 text-left transition hover:bg-slate-100/80 border-b border-slate-200"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                      <Store size={15} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {group.businessName}
                        </span>
                        {group.businessAddress &&
                          !group.hasMultipleAddresses && (
                            <span className="text-slate-500 text-xs font-normal truncate hidden sm:inline">
                              ({group.businessAddress})
                            </span>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="rounded-full bg-slate-200/70 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                      {group.totalCommands}{" "}
                      {group.totalCommands === 1 ? "pedido" : "pedidos"}
                    </span>
                    {isCollapsed ? (
                      <ChevronDown size={16} className="text-slate-500" />
                    ) : (
                      <ChevronUp size={16} className="text-slate-500" />
                    )}
                  </div>
                </button>

                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[750px] border-separate border-spacing-0 text-left">
                      <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                          <th className="whitespace-nowrap px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Estado / Info
                          </th>
                          <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Destino
                          </th>
                          <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Nota
                          </th>
                          <th className="whitespace-nowrap px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Precio
                          </th>
                          <th className="sticky right-0 bg-slate-50/50 px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.commands.map((command) => (
                          <CommandRow
                            key={command.id}
                            command={command}
                            isQuote={isQuotes}
                            showOriginDetail={group.hasMultipleAddresses}
                            onQuote={onQuote}
                            onAcceptDispatch={onAcceptDispatch}
                            onCompleteDispatch={onSetInTransit}
                            onSaveDestinationCoords={onSaveDestinationCoords}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ==================================================== */}
      {/* VISTA 2: LOTES SUGERIDOS (AGRUPADOS H3) */}
      {/* ==================================================== */}
      {viewMode === "batches" && (
        <div className="space-y-4">
          {combinedBatches.length === 0 ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <Sparkles className="mx-auto text-amber-400 mb-2" size={28} />
              <p className="text-sm font-bold text-slate-800">
                No hay lotes combinados disponibles
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Los pedidos deben estar a menos de ~450m (H3 Res 8) y permitir
                caja compartible.
              </p>
            </div>
          ) : (
            combinedBatches.map((batch) => (
              <CombinedBatchCard
                key={batch.id}
                primaryCommand={batch.primaryCommand}
                secondaryCommand={batch.secondaryCommand!}
                isQuote={isQuotes}
                acceptingId={acceptingId}
                onQuote={onQuote}
                onAcceptDispatch={onAcceptDispatch}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
