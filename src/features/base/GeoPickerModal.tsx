"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MapPin, Search, Check, X } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { EsriProvider } from "leaflet-geosearch";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
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

function MapRecenter({ center }: { center: { lat: number; lng: number } }) {
  const map = useMapEvents({});
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom(), {
      animate: true,
    });
  }, [center, map]);
  return null;
}

// Instanciamos el provider de Esri fuera del componente para evitar recrearlo
const esriProvider = new EsriProvider();

export function GeoPickerModal({
  isOpen,
  onClose,
  initialAddress,
  initialLat,
  initialLng,
  onSave,
}: GeoPickerModalProps) {
  const [mounted, setMounted] = useState(false);
  const [addressQuery, setAddressQuery] = useState(initialAddress);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const defaultCenter = { lat: -32.4823, lng: -58.2372 };

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setAddressQuery(initialAddress || "");
      if (initialLat && initialLng) {
        setCoords({ lat: initialLat, lng: initialLng });
      } else {
        setCoords(null);
      }
    }
  }, [isOpen, initialAddress, initialLat, initialLng]);

  if (!isOpen || !mounted) return null;

  // Búsqueda utilizando EsriProvider (ArcGIS) con acotación local
  const handleSearchCoords = async () => {
    if (!addressQuery.trim()) return;
    setIsSearching(true);

    try {
      // Forzamos el contexto local para que no busque en cualquier parte del mundo
      const queryWithContext = `${addressQuery}, Concepción del Uruguay, Entre Ríos, Argentina`;
      
      const results = await esriProvider.search({ query: queryWithContext });

      if (results && results.length > 0) {
        // Esri devuelve x (lng) e y (lat)
        setCoords({
          lat: results[0].y,
          lng: results[0].x,
        });
      } else {
        // Segundo intento solo con la calle por si la altura falla
        const streetOnly = addressQuery.replace(/\d+/g, "").trim();
        if (streetOnly.length > 2) {
          const fallbackResults = await esriProvider.search({
            query: `${streetOnly}, Concepción del Uruguay, Entre Ríos, Argentina`,
          });
          if (fallbackResults && fallbackResults.length > 0) {
            setCoords({
              lat: fallbackResults[0].y,
              lng: fallbackResults[0].x,
            });
            return;
          }
        }
        alert("Esri tampoco encontró la dirección exacta. Hacé clic en el mapa para ubicarla a mano.");
      }
    } catch (err) {
      console.error("Error en EsriProvider:", err);
      alert("Error al conectar con el servicio de mapas.");
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

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="flex w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <MapPin className="text-violet-600" size={18} />
            <h3 className="text-sm font-bold text-slate-900">
              Ajustar Ubicación en Mapa (Esri Geosearch)
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
                onKeyDown={(e) => e.key === "Enter" && handleSearchCoords()}
                placeholder="Ej: Galarza 750"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-violet-500 focus:outline-hidden shadow-xs"
              />
              <button
                type="button"
                onClick={handleSearchCoords}
                disabled={isSearching}
                className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-50 transition shadow-xs"
              >
                <Search size={13} />
                <span>{isSearching ? "Buscando..." : "Buscar con Esri"}</span>
              </button>
            </div>
          </div>

          {/* MAPA INTERACTIVO */}
          <div className="relative h-72 w-full overflow-hidden rounded-xl border border-slate-200 shadow-inner z-0">
            <MapContainer
              center={[currentCenter.lat, currentCenter.lng]}
              zoom={16}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapRecenter center={currentCenter} />
              <MapClickHandler position={coords} setPosition={setCoords} />
            </MapContainer>

            <div className="absolute bottom-2 left-2 right-2 z-[400] rounded-lg bg-slate-900/80 px-3 py-1.5 text-center text-[11px] font-medium text-white backdrop-blur-xs">
              💡 Hacé clic en el mapa si necesitás corregir la posición exacta del pin.
            </div>
          </div>

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
              ⚠️ Buscá la dirección o hacé clic directamente en el mapa para fijar el punto exacto.
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

  return createPortal(modalContent, document.body);
}