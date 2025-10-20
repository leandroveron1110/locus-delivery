// src/types/leaflet-geoman.d.ts

import type { Feature, Polygon, Geometry } from "geojson";
import type { LeafletEvent } from "leaflet";

declare module "leaflet" {
  // 1️⃣ Extiende la interfaz del mapa
  interface Map {
    pm: {
      enableDraw: (shape: string, options?: Record<string, unknown>) => void;
      disableDraw: (shape?: string) => void;
      toggleDraw: (shape: string, options?: Record<string, unknown>) => void;
      disableGlobalEditMode: () => void;
      disableGlobalDragMode: () => void;
      disableGlobalCutMode: () => void;
      addControls: (options?: Record<string, unknown>) => void;
      removeControls: () => void;
    };
  }

  // 2️⃣ Extiende la interfaz Path (para polígonos, rectángulos, etc.)
  interface Path {
    pm: {
      enable: (options?: Record<string, unknown>) => void;
      disable: () => void;
      toggleEdit: () => void;
      getShape: () => string;
      enableRotate: () => void;
      disableRotate: () => void;
      rotateEnabled: boolean;
    };
    toGeoJSON: () => Feature<Polygon | Geometry, Record<string, never>>;
  }

  // 3️⃣ Tipos para los eventos PM
  interface PMEvent extends LeafletEvent {
    layer: Path;
    shape: string;
  }
}
