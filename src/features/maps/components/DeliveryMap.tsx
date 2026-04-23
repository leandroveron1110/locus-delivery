"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { getFullRoute } from "../services/routing";
import { calculatePrice } from "../services/priceCalculator";
import InfoPrice from "./InfoPrice";
import LocationSearch from "./LocationSearch";
import DraggableMarker from "./DraggableMarker";

type PointType = "pickup" | "delivery";

interface Point {
  lat: number;
  lng: number;
}

const center: Point = { lat: -32.4846, lng: -58.2322 };

const iconBase =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images";

export const centerIcon = new L.Icon({
  iconUrl: `${iconBase}/marker-icon.png`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: `${iconBase}/marker-shadow.png`,
});

export const pickupIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: `${iconBase}/marker-shadow.png`,
});

export const deliveryIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: `${iconBase}/marker-shadow.png`,
});


function ClickHandler({ onSelect }: { onSelect: (p: Point) => void }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function DeliveryMap() {
  const [pickup, setPickup] = useState<Point | null>(null);
  const [delivery, setDelivery] = useState<Point | null>(null);
  const [mode, setMode] = useState<PointType>("pickup");

  const [route, setRoute] = useState<[number, number][]>([]);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // nos devuelve el precio y los kilometros necesarios
  async function calculateRoute(
    centerPoint: Point,
    pickupPoint: Point,
    deliveryPoint: Point,
  ) {
    setLoading(true);
    try {
      const r = await getFullRoute([centerPoint, pickupPoint, deliveryPoint]);
      setRoute(r.geometry);
      setDistanceKm(r.distanceKm);
      setPrice(calculatePrice(r.distanceKm).totalPrice);
    } catch (err) {
      console.error("Error calculando ruta:", err);
    } finally {
      setLoading(false);
    }
  }

  // 
  function handlePointSelection(p: Point) {
    if (mode === "pickup") {
      setPickup(p);
    } else {
      setDelivery(p);
      if (pickup) calculateRoute(center, pickup, p);
    }
  }

  function handleSearchSelect(p: Point) {
    handlePointSelection(p);
  }

  function resetMap() {
    setPickup(null);
    setDelivery(null);
    setRoute([]);
    setDistanceKm(null);
    setPrice(null);
    setMode("pickup");
  }

  function editPoints() {
    setRoute([]);
    setDistanceKm(null);
    setPrice(null);
    setMode("pickup");
  }

  return (
    <div className="relative w-screen h-screen bg-gray-100">
      {/* MAPA */}
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler onSelect={handlePointSelection} />

        <Marker position={[center.lat, center.lng]} icon={centerIcon}>
          <Tooltip>Centro</Tooltip>
        </Marker>


        {route.length > 0 && (
          <Polyline
            positions={route}
            color="#2563EB"
            weight={6}
            opacity={0.75}
          />
        )}

        {pickup && (
  <DraggableMarker
    initialPosition={[pickup.lat, pickup.lng]}
    icon={pickupIcon}
    onPositionChange={([lat, lng]) => {
      const newPickup = { lat, lng };
      setPickup(newPickup);

      if (delivery) {
        calculateRoute(center, newPickup, delivery);
      }
    }}
  />
)}

{delivery && (
  <DraggableMarker
    initialPosition={[delivery.lat, delivery.lng]}
    icon={deliveryIcon}
    onPositionChange={([lat, lng]) => {
      const newDelivery = { lat, lng };
      setDelivery(newDelivery);

      if (pickup) {
        calculateRoute(center, pickup, newDelivery);
      }
    }}
  />
)}
      </MapContainer>

      {/* PANEL DE CONTROL */}
      <div className="
        absolute top-4 left-4 z-10
        w-64
        rounded-2xl
        bg-white/90 backdrop-blur-xl
        border border-gray-200/60
        shadow-xl
        p-4
        flex flex-col gap-4
      ">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {mode === "pickup" ? "Punto de retiro" : "Punto de entrega"}
        </p>

        <LocationSearch
          placeholder={
            mode === "pickup"
              ? "Buscar retiro"
              : "Buscar entrega"
          }
          onSelect={handleSearchSelect}
        />

        {!pickup && (
          <button
            onClick={() => setMode("pickup")}
            className="btn-primary"
          >
            Seleccionar en mapa
          </button>
        )}

        {pickup && !delivery && (
          <button
            onClick={() => setMode("delivery")}
            className="btn-success"
          >
            Seleccionar entrega
          </button>
        )}

        {(pickup || delivery) && (
          <button
            onClick={resetMap}
            className="btn-danger-outline"
          >
            Limpiar
          </button>
        )}

        {pickup && delivery && (
          <button
            onClick={editPoints}
            className="btn-warning"
          >
            Editar puntos
          </button>
        )}
      </div>



      {/* HINT */}
      <div className="
        absolute top-4 right-4 z-10
        bg-black/70 text-white
        text-sm px-4 py-2 rounded-full
      ">
        Click en el mapa para seleccionar{" "}
        {mode === "pickup" ? "retiro" : "entrega"}
      </div>

      {/* INFO PRECIO */}
      {pickup && delivery && (
        <InfoPrice
          distanceKm={distanceKm}
          loading={loading}
          price={price}
        />
      )}
    </div>
  );
}
