"use client";

import { useState, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, Polygon, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import { IZone, DrawnFeature, Zone } from "../types/zone";
import { ZonePolygon } from "./ZonePolygonComponent";
import { MapControls } from "./MapControls";
import { useZones } from "../hooks/useZones";
import dynamic from "next/dynamic";

// Formularios dinámicos
const CreateZoneForm = dynamic(
  () => import("./CreateZoneForm").then((c) => c.CreateZoneForm),
  { ssr: false }
);
const EditZoneForm = dynamic(
  () => import("./EditZoneForm").then((e) => e.EditZoneForm),
  { ssr: false }
);

// Fix Leaflet icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

interface ZoneCreatorMapProps {
  zones: IZone[] | undefined;
  onZoneCreated: (zone: Zone) => void;
  onZoneEdited: (zone: Partial<IZone>) => void;
  onZoneDeleted: (zoneId: string) => void;
  isLoading: boolean;
  companyId: string;
}

const initialCenter: [number, number] = [-32.483, -58.233];

export const ZoneCreatorMap = ({
  zones,
  onZoneCreated,
  onZoneEdited,
  onZoneDeleted,
  isLoading,
  companyId,
}: ZoneCreatorMapProps) => {
  const [drawnFeature, setDrawnFeature] = useState<DrawnFeature | null>(null);
  const [editingZone, setEditingZone] = useState<IZone | null>(null);

  const processedZones = useZones(zones);

  const handleCancel = useCallback(() => {
    setDrawnFeature(null);
    setEditingZone(null);
  }, []);

  const handleZoneClick = useCallback((z: IZone) => {
    setEditingZone(z);
    setDrawnFeature({
      type: "Feature",
      properties: {},
      geometry: z.geometry,
    });
  }, []);

  const isCreating = !!drawnFeature && !editingZone;
  const isEditing = !!editingZone;

  const newZonePositions = useMemo(() => {
    if (!drawnFeature) return [];
    return drawnFeature.geometry.coordinates[0].map(
      (coord) => [coord[1], coord[0]] as [number, number]
    );
  }, [drawnFeature]);

  return (
    <div className="relative w-full h-screen flex">
      {/* Mapa */}
      <div
        className={`h-full ${
          isCreating || isEditing
            ? "absolute inset-0 md:relative md:w-2/3"
            : "w-full"
        }`}
      >
        <MapContainer
          center={initialCenter}
          zoom={14}
          scrollWheelZoom
          className="w-full h-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Zonas existentes */}
          {processedZones.map((zone) => (
            <ZonePolygon
              key={zone.id}
              zone={zone}
              isEditing={isEditing}
              editingZoneId={editingZone?.id}
              onClick={handleZoneClick}
            />
          ))}

          {/* Nueva zona */}
          {isCreating && drawnFeature && (
            <Polygon
              positions={newZonePositions}
              pathOptions={{
                color: "#dc2626",
                weight: 3,
                fillOpacity: 0.3,
                dashArray: "5, 5",
              }}
            >
              <Tooltip sticky>
                <div className="text-sm">
                  <p className="font-semibold">Nueva Zona</p>
                  <p>Ajusta los vértices si es necesario.</p>
                </div>
              </Tooltip>
            </Polygon>
          )}

          <MapControls
            setDrawnFeature={setDrawnFeature}
            setEditingZone={setEditingZone}
            editingZone={editingZone}
          />
        </MapContainer>
      </div>

      {/* Panel lateral */}
      {(isCreating || isEditing) && (
        <div className="absolute top-0 right-0 md:relative md:w-1/3 h-full bg-white border-l border-gray-200 p-3 shadow-lg z-30 overflow-auto">
          {isCreating && (
            <CreateZoneForm
              companyId={companyId}
              drawnFeature={drawnFeature}
              isLoading={isLoading}
              onZoneCreated={(zone) => {
                onZoneCreated(zone);
                handleCancel();
              }}
              onCancel={handleCancel}
            />
          )}
          {isEditing && editingZone && (
            <EditZoneForm
              drawnFeature={drawnFeature as DrawnFeature}
              isLoading={isLoading}
              onZoneDeleted={(id) => {
                onZoneDeleted(id);
                handleCancel();
              }}
              onZoneEdited={(zone) => {
                onZoneEdited(zone);
                handleCancel();
              }}
              onCancel={handleCancel}
              initialData={editingZone}
            />
          )}
        </div>
      )}
    </div>
  );
};
