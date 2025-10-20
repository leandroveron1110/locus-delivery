"use client";

import { memo } from "react";
import { Polygon, Tooltip } from "react-leaflet";
import { IZone } from "../types/zone";
import L from "leaflet"; // Necesario para evitar la propagación de eventos

interface ZonePolygonProps {
  zone: IZone & { latlngs: [number, number][] };
  isEditing: boolean;
  editingZoneId?: string;
  onDblClick: (zone: IZone) => void; 
}

const ZonePolygonComponent = ({ 
  zone, 
  isEditing, 
  editingZoneId, 
  onDblClick 
}: ZonePolygonProps) => {
  
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

  // Handler para el doble clic
  const handleDblClick = () => {
    onDblClick(zone);
  };
  
  // Handler para el clic simple para detener la propagación si estamos dibujando
  const handleClick = (e: L.LeafletMouseEvent) => {
      // Detiene la propagación para evitar que el clic interfiera con otras acciones
      // como la finalización de un dibujo, que es lo que buscabas.
      L.DomEvent.stopPropagation(e);
  };

  return (
    <Polygon
      positions={zone.latlngs}
      pathOptions={{ color, weight, fillOpacity }}
      eventHandlers={{ 
        // ⚠️ CAMBIO CLAVE: Escuchamos el evento de doble clic
        dblclick: handleDblClick,
        click: handleClick, // Evitamos interferencia con clics
      }}
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