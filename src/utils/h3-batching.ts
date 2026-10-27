import { gridDisk, gridDistance, latLngToCell } from "h3-js";
import {
  type BasePendingDispatch,
  type BaseUrgentQuote,
} from "@/mini-back/infrastructure/network/base-delivery-api";

type QuoteCommand = BaseUrgentQuote | BasePendingDispatch;

export type CommandWithCoordinates = QuoteCommand & {
  lat?: number | null;
  lng?: number | null;
};

export interface DeliveryBatch {
  id: string;
  primaryCommand: QuoteCommand;
  secondaryCommand?: QuoteCommand;
  isCombined: boolean;
}

interface Coordinates {
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
}

interface ProcessedOrder {
  command: QuoteCommand;
  coordinates: Coordinates | null;
  originCell: string | null;
  destCell: string | null;
  isShareable: boolean;
}

// H3 resolution 8: índice espacial.
// La dimensión de las celdas no equivale a un radio exacto en metros.
const H3_RESOLUTION = 8;

// Radio máximo entre negocios y entre destinos.
const MAX_ORIGIN_DISTANCE_METERS = 400;
const MAX_DESTINATION_DISTANCE_METERS = 400;

// Cantidad de saltos H3 examinados para generar candidatos.
// Es un margen conservador para esta resolución, no una garantía universal.
const ORIGIN_SEARCH_GRID_RADIUS = 3;

const EARTH_RADIUS_METERS = 6_371_000;

function getCoordinates(command: CommandWithCoordinates): Coordinates | null {
  const originLat = command.originLatitude ?? command.lat;
  const originLng = command.originLongitude ?? command.lng;

  const destinationLat = command.destinationLatitude;
  const destinationLng = command.destinationLongitude;

  if (
    typeof originLat !== "number" ||
    !Number.isFinite(originLat) ||
    originLat < -90 ||
    originLat > 90 ||
    typeof originLng !== "number" ||
    !Number.isFinite(originLng) ||
    originLng < -180 ||
    originLng > 180 ||
    typeof destinationLat !== "number" ||
    !Number.isFinite(destinationLat) ||
    destinationLat < -90 ||
    destinationLat > 90 ||
    typeof destinationLng !== "number" ||
    !Number.isFinite(destinationLng) ||
    destinationLng < -180 ||
    destinationLng > 180
  ) {
    return null;
  }

  return {
    originLat,
    originLng,
    destinationLat,
    destinationLng,
  };
}

/**
 * Calcula la distancia geográfica en línea recta entre dos coordenadas.
 * No representa la distancia real por calles.
 */
function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  // Protección frente a pequeños errores de precisión de coma flotante.
  const safeA = Math.max(0, Math.min(1, a));

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(safeA));
}

/**
 * Calcula las celdas candidatas alrededor de una celda de origen.
 *
 * gridDisk utiliza pasos de cuadrícula, no metros.
 * Si H3 no puede completar la operación, devolvemos null para permitir
 * una búsqueda de respaldo que no descarte candidatos silenciosamente.
 */
function getNearbyCells(cell: string): Set<string> | null {
  try {
    return new Set(gridDisk(cell, ORIGIN_SEARCH_GRID_RADIUS));
  } catch {
    return null;
  }
}

/**
 * Construye el índice espacial:
 *
 * celda H3 de origen -> pedidos cuyo negocio está en esa celda.
 *
 * Esto evita recorrer todos los pedidos para encontrar candidatos
 * geográficamente próximos.
 */
function buildOriginIndex(
  items: ProcessedOrder[],
): Map<string, ProcessedOrder[]> {
  const index = new Map<string, ProcessedOrder[]>();

  for (const item of items) {
    if (!item.originCell) continue;

    const bucket = index.get(item.originCell);

    if (bucket) {
      bucket.push(item);
    } else {
      index.set(item.originCell, [item]);
    }
  }

  return index;
}

/**
 * Devuelve los pedidos que están en las celdas candidatas.
 *
 * En el caso excepcional de que gridDisk falle, se utiliza gridDistance
 * sobre las celdas indexadas. Si tampoco puede calcularse una distancia
 * para alguna celda, se incluye como candidata para verificarla después
 * con las coordenadas reales.
 *
 * La búsqueda de respaldo prioriza no descartar candidatos por un fallo
 * del índice, aunque puede ser más costosa.
 */
function findOriginCandidates(
  current: ProcessedOrder,
  originIndex: Map<string, ProcessedOrder[]>,
): ProcessedOrder[] {
  if (!current.originCell) return [];

  const nearbyCells = getNearbyCells(current.originCell);

  if (nearbyCells) {
    const candidates: ProcessedOrder[] = [];

    for (const cell of nearbyCells) {
      const bucket = originIndex.get(cell);

      if (bucket) {
        candidates.push(...bucket);
      }
    }

    return candidates;
  }

  const fallbackCandidates: ProcessedOrder[] = [];

  for (const [cell, bucket] of originIndex) {
    try {
      if (gridDistance(current.originCell, cell) <= ORIGIN_SEARCH_GRID_RADIUS) {
        fallbackCandidates.push(...bucket);
      }
    } catch {
      // No descartamos la celda si H3 no puede calcular la distancia.
      fallbackCandidates.push(...bucket);
    }
  }

  return fallbackCandidates;
}

/**
 * Comprueba las distancias reales entre dos pedidos.
 *
 * Las celdas H3 solo generan candidatos. La decisión final utiliza
 * las coordenadas originales.
 */
function evaluatePair(
  first: ProcessedOrder,
  second: ProcessedOrder,
): { compatible: boolean; score: number } {
  if (
    !first.isShareable ||
    !second.isShareable ||
    !first.coordinates ||
    !second.coordinates
  ) {
    return { compatible: false, score: Infinity };
  }

  const a = first.coordinates;
  const b = second.coordinates;

  const originDistance = distanceMeters(
    a.originLat,
    a.originLng,
    b.originLat,
    b.originLng,
  );

  if (originDistance > MAX_ORIGIN_DISTANCE_METERS) {
    return { compatible: false, score: Infinity };
  }

  const destinationDistance = distanceMeters(
    a.destinationLat,
    a.destinationLng,
    b.destinationLat,
    b.destinationLng,
  );

  if (destinationDistance > MAX_DESTINATION_DISTANCE_METERS) {
    return { compatible: false, score: Infinity };
  }

  // Prioriza parejas con menor suma de distancias geográficas.
  // No representa el costo real del recorrido por calles.
  return {
    compatible: true,
    score: originDistance + destinationDistance,
  };
}

export function groupOrdersByH3Proximity(
  commands: QuoteCommand[],
): DeliveryBatch[] {
  if (commands.length === 0) return [];

  // 1. Procesar cada pedido y calcular sus celdas una sola vez.
  const items: ProcessedOrder[] = commands.map((command) => {
    const coordinates = getCoordinates(command as CommandWithCoordinates);

    const isShareable = Boolean(command.isShareable);

    if (!coordinates) {
      return {
        command,
        coordinates: null,
        originCell: null,
        destCell: null,
        isShareable: false,
      };
    }

    return {
      command,
      coordinates,
      originCell: latLngToCell(
        coordinates.originLat,
        coordinates.originLng,
        H3_RESOLUTION,
      ),
      destCell: latLngToCell(
        coordinates.destinationLat,
        coordinates.destinationLng,
        H3_RESOLUTION,
      ),
      isShareable,
    };
  });

  // 2. Crear un índice de pedidos por celda de origen.
  const originIndex = buildOriginIndex(items);

  // Set conserva la identidad de cada elemento procesado.
  const unassigned = new Set(items);
  const batches: DeliveryBatch[] = [];

  // 3. Emparejamiento voraz:
  // para cada pedido, buscamos su mejor pareja disponible.
  for (const current of items) {
    if (!unassigned.has(current)) continue;

    unassigned.delete(current);

    if (!current.isShareable || !current.coordinates || !current.originCell) {
      batches.push({
        id: `single-${current.command.id}`,
        primaryCommand: current.command,
        isCombined: false,
      });

      continue;
    }

    const candidates = findOriginCandidates(current, originIndex);

    let bestCandidate: ProcessedOrder | null = null;
    let bestScore = Infinity;

    for (const candidate of candidates) {
      if (candidate === current || !unassigned.has(candidate)) {
        continue;
      }

      const result = evaluatePair(current, candidate);

      if (result.compatible && result.score < bestScore) {
        bestCandidate = candidate;
        bestScore = result.score;
      }
    }

    if (bestCandidate) {
      unassigned.delete(bestCandidate);

      batches.push({
        id: `batch-${current.command.id}-${bestCandidate.command.id}`,
        primaryCommand: current.command,
        secondaryCommand: bestCandidate.command,
        isCombined: true,
      });
    } else {
      batches.push({
        id: `single-${current.command.id}`,
        primaryCommand: current.command,
        isCombined: false,
      });
    }
  }

  return batches;
}
