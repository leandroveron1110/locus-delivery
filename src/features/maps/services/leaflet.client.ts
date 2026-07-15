"use client";

import L from "leaflet";

const iconBase =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images";

let initialized = false;

export function initializeLeaflet() {
  if (initialized || typeof window === "undefined") {
    return;
  }

  // @ts-expect-error
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: `${iconBase}/marker-icon-2x.png`,
    iconUrl: `${iconBase}/marker-icon.png`,
    shadowUrl: `${iconBase}/marker-shadow.png`,
  });

  initialized = true;
}

export function createMarkerIcon(iconUrl: string) {
  return new L.Icon({
    iconUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: `${iconBase}/marker-shadow.png`,
  });
}