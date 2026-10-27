import { gridDistance, latLngToCell } from "h3-js";
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

// 🎯 RESOLUCIÓN H3 = 8 (Celdas hexagonales de ~450m a 460m)
const H3_RESOLUTION = 8;

interface ProcessedOrder {
  command: QuoteCommand;
  originCell: string | null;
  destCell: string | null;
  isShareable: boolean;
}

function getCoordinates(command: CommandWithCoordinates) {
  const oLat = command.originLatitude ?? command.lat;
  const oLng = command.originLongitude ?? command.lng;
  const dLat = command.destinationLatitude;
  const dLng = command.destinationLongitude;

  if (
    typeof oLat === "number" && Number.isFinite(oLat) &&
    typeof oLng === "number" && Number.isFinite(oLng) &&
    typeof dLat === "number" && Number.isFinite(dLat) &&
    typeof dLng === "number" && Number.isFinite(dLng)
  ) {
    return {
      originLat: oLat,
      originLng: oLng,
      destinationLat: dLat,
      destinationLng: dLng,
    };
  }

  return null;
}

function areCellsAdjacentOrSame(cellA: string, cellB: string): boolean {
  if (cellA === cellB) return true;
  try {
    return gridDistance(cellA, cellB) <= 1;
  } catch {
    return false;
  }
}

export function groupOrdersByH3Proximity(
  commands: QuoteCommand[],
): DeliveryBatch[] {
  // 1. Precalculamos las celdas H3 en resolución 8 (450m) en una sola pasada
  const items: ProcessedOrder[] = commands.map((cmd) => {
    const coords = getCoordinates(cmd as CommandWithCoordinates);
    const isShareable = Boolean(cmd.isShareable);

    if (!coords || !isShareable) {
      return { command: cmd, originCell: null, destCell: null, isShareable: false };
    }

    return {
      command: cmd,
      originCell: latLngToCell(coords.originLat, coords.originLng, H3_RESOLUTION),
      destCell: latLngToCell(coords.destinationLat, coords.destinationLng, H3_RESOLUTION),
      isShareable: true,
    };
  });

  const unassigned = [...items];
  const batches: DeliveryBatch[] = [];

  // 2. Emparejamiento por celdas idénticas o vecinas (gridDistance <= 1)
  while (unassigned.length > 0) {
    const current = unassigned.shift()!;

    if (!current.isShareable || !current.originCell || !current.destCell) {
      batches.push({
        id: `single-${current.command.id}`,
        primaryCommand: current.command,
        isCombined: false,
      });
      continue;
    }

    const matchIndex = unassigned.findIndex((candidate) => {
      if (!candidate.isShareable || !candidate.originCell || !candidate.destCell) {
        return false;
      }

      const originsCompatible = areCellsAdjacentOrSame(
        current.originCell!,
        candidate.originCell!,
      );
      const destinationsCompatible = areCellsAdjacentOrSame(
        current.destCell!,
        candidate.destCell!,
      );

      return originsCompatible && destinationsCompatible;
    });

    if (matchIndex !== -1) {
      const partner = unassigned.splice(matchIndex, 1)[0];
      batches.push({
        id: `batch-${current.command.id}-${partner.command.id}`,
        primaryCommand: current.command,
        secondaryCommand: partner.command,
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