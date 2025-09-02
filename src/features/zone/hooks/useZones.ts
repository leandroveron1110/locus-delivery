import { useMemo } from "react";
import { IZone } from "../types/zone";

export const useZones = (zones?: IZone[]) => {
  return useMemo(() => {
    if (!Array.isArray(zones)) return [];

    return zones
      .filter(zone => zone?.geometry?.coordinates && Array.isArray(zone.geometry.coordinates[0]))
      .map((zone) => ({
        ...zone,
        latlngs: zone.geometry.coordinates[0].map(
          (coord) => [coord[1], coord[0]] as [number, number]
        ),
      }));
  }, [zones]);
};
