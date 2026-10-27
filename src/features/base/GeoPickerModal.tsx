"use client";

import { useState, useEffect } from "react";
import { MapPin, Search, Check, X, Map as MapIcon } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Corrección para el icono por defecto de Leaflet en Next.js/React
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow-png.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface GeoPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAddress: string;
  initialLat?: number | null;
  initialLng?: number | null;
  onSave: (lat: number, lng: number, address: string) => Promise<void> | void;
}

// Componente auxiliar para manejar clics en el mapa y mover el marcador
function MapClickHandler({
  position,
  setPosition,
}: {
  position: { lat: number; lng: number } | null;
  setPosition: (pos: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return position === null ? null : (
    <Marker position={[position.lat, position.lng]} icon={defaultIcon} />
  );
}

// Componente para recentrar el mapa cuando cambian las coordenadas
function MapRecenter({ center }: { center: { lat: number; lng: number } }) {
  const map = useMapEvents({});
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom(), {
      animate: true,
    });
  }, [center, map]);
  return null;
}

export function GeoPickerModal({
  isOpen,
  onClose,
  initialAddress,
  initialLat,
  initialLng,
  onSave,
}: GeoPickerModalProps) {
  const [addressQuery, setAddressQuery] = useState(initialAddress);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Coordenadas por defecto (Centro aproximado de Concepción del Uruguay, Entre Ríos)
  const defaultCenter = { lat: -32.4823, lng: -58.2372 };
  
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  useEffect(() => {
    if (initialLat && initialLng) {
      setCoords({ lat: initialLat, lng: initialLng });
    }
  }, [initialLat, initialLng]);

  if (!isOpen) return null;

  // Buscar dirección por texto usando Nominatim (OpenStreetMap)
  const handleSearchCoords = async () => {
    if (!addressQuery.trim()) return;
    setIsSearching(true);
    try {
      const fullQuery = `${addressQuery}, Concepción del Uruguay, Entre Ríos`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          fullQuery
        )}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const newLat = parseFloat(data[0].lat);
        const newLng = parseFloat(data[0].lon);
        setCoords({ lat: newLat, lng: newLng });
      } else {
        alert("No se encontró la dirección exacta en el mapa.");
      }
    } catch (err) {
      console.error("Error obteniendo coordenadas:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!coords) return;
    setIsSaving(true);
    try {
      await onSave(coords.lat, coords.lng, addressQuery);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const currentCenter = coords || defaultCenter;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="flex w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <MapPin className="text-violet-600" size={18} />
            <h3 className="text-sm font-bold text-slate-900">
              Ajustar Ubicación de Destino en Mapa
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Dirección a buscar / corregir
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={addressQuery}
                onChange={(e) => setAddressQuery(e.target.value)}
                placeholder="Ej: Jordana 248"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-violet-500 focus:outline-hidden shadow-xs"
              />
              <button
                type="button"
                onClick={handleSearchCoords}
                disabled={isSearching}
                className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-50 transition shadow-xs"
              >
                <Search size={13} />
                <span>{isSearching ? "Buscando..." : "Buscar en Mapa"}</span>
              </button>
            </div>
          </div>

          {/* MAPA INTERACTIVO */}
          <div className="relative h-72 w-full overflow-hidden rounded-xl border border-slate-200 shadow-inner z-0">
            <MapContainer
              center={[currentCenter.lat, currentCenter.lng]}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapRecenter center={currentCenter} />
              <MapClickHandler position={coords} setPosition={setCoords} />
            </MapContainer>

            {/* Aviso flotante sobre el mapa */}
            <div className="absolute bottom-2 left-2 right-2 z-[400] rounded-lg bg-slate-900/80 px-3 py-1.5 text-center text-[11px] font-medium text-white backdrop-blur-xs">
              💡 Hacé clic en el mapa para ajustar la ubicación exacta del pin si es necesario.
            </div>
          </div>

          {/* Coordenadas actuales seleccionadas */}
          {coords ? (
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              <span className="font-bold flex items-center gap-1.5">
                <Check size={14} /> Coordenadas listas para guardar:
              </span>
              <span className="font-mono font-semibold text-[11px]">
                Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
              </span>
            </div>
          ) : (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
              ⚠️ Buscá la dirección o hacé clic directamente en el mapa para establecer el punto de entrega.
            </p>
          )}
        </div>

        {/* Pie */}
        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition shadow-xs"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmSave}
            disabled={!coords || isSaving}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-xs"
          >
            {isSaving ? "Guardando..." : "Guardar Ubicación"}
          </button>
        </div>

      </div>
    </div>
  );
}