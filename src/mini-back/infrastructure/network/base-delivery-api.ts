// src/mini-back/infrastructure/network/base-delivery-api.ts

import { apiGet, apiPatch } from "@/lib/apiFetch";

export enum BusinessCommandStatusV2 {
  PENDING = "PENDING",
  QUOTE_REQUESTED = "QUOTE_REQUESTED",
  REVIEWING_QUOTE = "REVIEWING_QUOTE",
  DISPATCH_REQUESTED = "DISPATCH_REQUESTED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum LogisticsCommandStatusV2 {
  PENDING = "PENDING",
  QUOTED = "QUOTED",
  ACCEPTED = "ACCEPTED",
  ASSIGNED = "ASSIGNED",
  IN_TRANSIT = "IN_TRANSIT",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
}

/**
 * Representación completa de DeliveryCommandV2.
 *
 * Los campos DateTime del servidor se reciben como strings JSON.
 */
export interface DeliveryCommandV2 {
  id: string;
  businessId: string;
  orderId: string;

  businessStatus: BusinessCommandStatusV2;
  logisticsStatus: LogisticsCommandStatusV2;

  originName: string | null;
  originAddress: string | null;
  originLatitude: number | null;
  originLongitude: number | null;

  destinationAddress: string | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;

  zoneId: string | null;
  notes: string | null;

  quotedCost: number | null;
  externalId: string | null;
  failureReason: string | null;

  requiredCouriers: number;
  isShareable: boolean;

  createdAt: string;
  updatedAt: string;
}

/**
 * Solicitud que espera una cotización de logística.
 *
 * Representa los campos que necesita el panel de la base.
 */
export interface BaseUrgentQuote {
  id: string;
  businessId: string;

  orderId: string;

  originName: string | null;
  originAddress: string | null;
  destinationAddress: string | null;

  quotedCost: number | null;

  businessStatus: BusinessCommandStatusV2;
  logisticsStatus: LogisticsCommandStatusV2;

  destinationLatitude: string | null;
  destinationLongitude: string | null;
  originLatitude: string | null;
  originLongitude: string | null;

  requiredCouriers: number;
  isShareable: boolean;
  notes: string;

  createdAt: string;
  updatedAt?: string;
}

/**
 * Despacho que está pendiente de gestión logística.
 */
export interface BasePendingDispatch {
  id: string;
  businessId: string;
  orderId: string;

  originName: string | null;
  originAddress: string | null;
  destinationAddress: string | null;
  destinationLatitude: string | null;
  destinationLongitude: string | null;
  originLatitude: string | null;
  originLongitude: string | null;

  quotedCost: number | null;

  requiredCouriers: number;
  isShareable: boolean;
  notes: string;
  businessStatus?: BusinessCommandStatusV2;
  logisticsStatus: LogisticsCommandStatusV2;

  createdAt: string;
  updatedAt?: string;
}

/**
 * Datos enviados al servidor para cotizar un pedido.
 */
export interface BaseQuoteOrderInput {
  quotedCost: number;
}

/**
 * Respuesta genérica de una operación que modifica un comando.
 *
 * Se utiliza cuando el servidor devuelve el comando actualizado.
 */
export type BaseDeliveryCommandResponse = DeliveryCommandV2;

/**
 * Obtiene las solicitudes pendientes de cotización.
 */
export async function fetchBaseUrgentQuotes(
  zoneId?: string,
): Promise<BaseUrgentQuote[]> {
  const params = new URLSearchParams();

  if (zoneId) {
    params.set("zoneId", zoneId);
  }

  const query = params.size > 0 ? `?${params.toString()}` : "";

  const result = await apiGet<BaseUrgentQuote[]>(
    `/delivery-commands-v2/panel/base/urgent-quotes${query}`,
  );

  return result ?? [];
}

/**
 * Obtiene los despachos pendientes de gestión logística.
 */
export async function fetchBasePendingDispatches(
  zoneId?: string,
): Promise<BasePendingDispatch[]> {
  const params = new URLSearchParams();

  if (zoneId) {
    params.set("zoneId", zoneId);
  }

  const query = params.size > 0 ? `?${params.toString()}` : "";

  const result = await apiGet<BasePendingDispatch[]>(
    `/delivery-commands-v2/panel/base/pending-dispatches${query}`,
  );

  return result ?? [];
}

/**
 * Registra o actualiza la cotización de un pedido.
 *
 * La posibilidad de modificar una cotización existente
 * depende de las reglas que aplique el backend.
 */
export async function baseQuoteOrder(
  id: string,
  quotedCost: number,
): Promise<BaseDeliveryCommandResponse | null> {
  const payload: BaseQuoteOrderInput = {
    quotedCost,
  };

  return apiPatch<BaseDeliveryCommandResponse>(
    `/delivery-commands-v2/${encodeURIComponent(id)}/base/quote`,
    payload,
  );
}

/**
 * Acepta un despacho.
 */
export async function baseAcceptDispatch(
  id: string,
): Promise<BaseDeliveryCommandResponse | null> {
  return apiPatch<BaseDeliveryCommandResponse>(
    `/delivery-commands-v2/${encodeURIComponent(id)}/base/accept`,
  );
}

/**
 * Acepta un despacho.
 */
export async function baseAssignedDispatch(
  id: string,
): Promise<BaseDeliveryCommandResponse | null> {
  return apiPatch<BaseDeliveryCommandResponse>(
    `/delivery-commands-v2/${encodeURIComponent(id)}/base/assigned`,
  );
}

export async function baseCompletedDispatch(
  id: string,
): Promise<BaseDeliveryCommandResponse | null> {
  return apiPatch<BaseDeliveryCommandResponse>(
    `/delivery-commands-v2/${encodeURIComponent(id)}/base/in-completed`,
  );
}

export async function baseDestinationCoords(
  id: string,
  dto: {
    destinationAddress: string;
    destinationLatitude: number;
    destinationLongitude: number;
  },
): Promise<BaseDeliveryCommandResponse | null> {
  return apiPatch<BaseDeliveryCommandResponse>(
    `/delivery-commands-v2/coords/${encodeURIComponent(id)}`,
    dto,
  );
}
