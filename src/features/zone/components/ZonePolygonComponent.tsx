"use client";

import { memo } from "react";
import { Polygon, Tooltip } from "react-leaflet";
import { IZone } from "../types/zone";

interface ZonePolygonProps {
  zone: IZone & { latlngs: [number, number][] };
  isEditing: boolean;
  editingZoneId?: string;
  onClick: (zone: IZone) => void;
}

const ZonePolygonComponent = ({ zone, isEditing, editingZoneId, onClick }: ZonePolygonProps) => {
  // Determinar color según estado
  let color = "#2563eb"; // azul por defecto
  let weight = 2;
  let fillOpacity = 0.2;

  if (!zone.isActive) {
    color = "#616469ff"; // gris si está inactiva
    fillOpacity = 0.15;
    weight = 1;
  } else if (isEditing && editingZoneId === zone.id) {
    color = "#16a34a"; // verde si está editando
    weight = 4;
    fillOpacity = 0.4;
  }

  return (
    <Polygon
      positions={zone.latlngs}
      pathOptions={{ color, weight, fillOpacity }}
      eventHandlers={{ click: () => onClick(zone) }}
    >
      <Tooltip sticky>
        <div className="text-sm">
          <p><span className="font-medium">Nombre:</span> {zone.name}</p>
          <p><span className="font-medium">Precio:</span> ${zone.price}</p>
          <p><span className="font-medium">Disponible:</span> {zone.isActive ? "Sí" : "No"}</p>
        </div>
      </Tooltip>
    </Polygon>
  );
};

export const ZonePolygon = memo(
  ZonePolygonComponent,
  (prev, next) =>
    prev.zone.id === next.zone.id &&
    prev.zone.isActive === next.zone.isActive &&
    prev.editingZoneId === next.editingZoneId &&
    prev.isEditing === next.isEditing
);
