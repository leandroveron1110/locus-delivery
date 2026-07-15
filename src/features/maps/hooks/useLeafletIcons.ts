"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import {
  initializeLeaflet,
  createMarkerIcon,
} from "../services/leaflet.client";

interface LeafletIcons {
  centerIcon: L.Icon;
  pickupIcon: L.Icon;
  deliveryIcon: L.Icon;
}

export function useLeafletIcons() {
  const [icons, setIcons] = useState<LeafletIcons | null>(null);

  useEffect(() => {
    initializeLeaflet();

    setIcons({
      centerIcon: createMarkerIcon(
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png"
      ),

      pickupIcon: createMarkerIcon(
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png"
      ),

      deliveryIcon: createMarkerIcon(
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
      ),
    });
  }, []);

  return icons;
}