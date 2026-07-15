// src/components/DraggableMarker.tsx
"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { Marker, Popup } from "react-leaflet"; // 🔹 Eliminamos useMap (no se usa)
import * as L from "leaflet";


interface DraggableMarkerProps {
  initialPosition: [number, number];
  onPositionChange: (newPosition: [number, number]) => void; // Nueva prop
  icon: L.Icon;
}

const DraggableMarker = ({ initialPosition, onPositionChange, icon }: DraggableMarkerProps) => {
  const [position, setPosition] = useState(initialPosition);
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos: [number, number] = [marker.getLatLng().lat, marker.getLatLng().lng];
          setPosition(newPos);
          onPositionChange(newPos); // Llama a la función de callback con la nueva posición
        }
      },
    }),
    [onPositionChange] // Asegura que el hook se actualice si la función cambia
  );

  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={icon}
    >
      <Popup>
        Tu ubicación. <br /> Arrastra el marcador para ajustar.
      </Popup>
    </Marker>
  );
};

export default DraggableMarker;