"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import { ZoneForm } from "./ZoneForm";

// Fix de íconos de Leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: number[][][];
};

interface ZoneCreatorMapProps {
  onZoneCreated: (zone: {
    name: string;
    price: number;
    geometry: GeoJsonPolygon;
  }) => void;
  isLoading: boolean;
}
const initialCenter: [number, number] = [-32.483, -58.233];

// Control de dibujo
const DrawControl = ({ setDrawnFeature }: any) => {
  const map = useMap();

  useState(() => {
    map.pm.addControls({
      position: "topleft",
      drawPolygon: true, // Solo permitir polígonos
      editMode: true, // Permitir edición de polígonos
      dragMode: false,
      cutPolygon: false,
      rotateMode: false,
      drawMarker: false,
      drawCircle: false,
      drawCircleMarker: false,
      drawRectangle: true,
      drawPolyline: false,
      drawText: false,
    });

    map.on("pm:create", (e: any) => setDrawnFeature(e.layer.toGeoJSON()));
    map.on("pm:update", (e: any) => setDrawnFeature(e.layer.toGeoJSON()));
    map.on("pm:remove", () => setDrawnFeature(null));

    return () => {
      map.pm.removeControls();
      map.off("pm:create");
      map.off("pm:update");
      map.off("pm:remove");
    };
  });

  return null;
};

export const ZoneCreatorMap = ({
  onZoneCreated,
  isLoading,
}: ZoneCreatorMapProps) => {
  const [drawnFeature, setDrawnFeature] = useState<any>(null);

  return (
    <div className="flex flex-col lg:flex-row h-[750px] w-full rounded-2xl overflow-hidden shadow-2xl bg-gray-50">
      {/* Formulario solo aparece si hay polígono dibujado */}
      {drawnFeature && (
        <div className="lg:w-1/3 p-8">
          <ZoneForm
            drawnFeature={drawnFeature}
            isLoading={isLoading}
            onZoneCreated={onZoneCreated}
            onCancel={() => setDrawnFeature(null)}
          />
        </div>
      )}

      {/* Mapa */}
      <div
        className={`flex-1 ${drawnFeature ? "lg:w-2/3" : "w-full"} h-[750px]`}
      >
        <MapContainer
          center={initialCenter}
          zoom={12}
          scrollWheelZoom={true}
          className="h-full w-full rounded-r-2xl"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DrawControl setDrawnFeature={setDrawnFeature} />
        </MapContainer>
      </div>
    </div>
  );
};
