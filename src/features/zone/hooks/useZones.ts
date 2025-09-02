// useZones.ts
import { useMemo } from "react";
import { IZone } from "../types/zone";

export const useZones = (zones: IZone[] | undefined) => {
  // Preprocesa coordenadas y memoriza
  return useMemo(() => {
    if (!zones) return [];

    return zones.map((zone) => ({
      ...zone,
      latlngs: zone.geometry.coordinates[0].map(
        (coord) => [coord[1], coord[0]] as [number, number]
      ),
    }));
  }, [zones]);
};
