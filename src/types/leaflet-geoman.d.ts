// src/types/leaflet-geoman.d.ts

import * as L from 'leaflet';
import { Feature, Polygon, Geometry } from 'geojson';

// 1. Extiende la interfaz L.Map para incluir los métodos de Geoman
declare module 'leaflet' {
  interface Map {
    pm: any; // Es complejo tipar todo 'pm', pero al menos lo declaramos aquí.
    // Alternativa más segura: usar los tipos internos de Geoman si los tienes instalados
    // pm: import('@geoman-io/leaflet-geoman-free').PM.Map;
    // Para simplificar y evitar el error, `any` en la extensión del módulo es aceptable.
    pm: {
      enableDraw: (shape: string, options?: any) => void;
      disableDraw: (shape?: string) => void;
      toggleDraw: (shape: string, options?: any) => void;
      // ... otros métodos de control de mapa global
      disableGlobalEditMode: () => void;
      disableGlobalDragMode: () => void;
      disableGlobalCutMode: () => void;
      addControls: (options?: any) => void;
      removeControls: () => void;
      // ...
    };
  }
  
  // 2. Extiende la interfaz L.Path (para Polígonos, Rectángulos, etc.)
  interface Path {
    pm: {
      enable: (options?: any) => void;
      disable: () => void;
      toggleEdit: () => void;
      // ... la lista de 21+ propiedades que faltaban
      getShape: () => string;
      enableRotate: () => void;
      disableRotate: () => void;
      rotateEnabled: boolean;
      // ... etc.
    };
    toGeoJSON: () => Feature<Polygon | Geometry, {}>;
  }
  
  // 3. Tipos para los eventos PM
  interface PMEvent extends LeafletEvent {
    layer: Path; // Ahora la capa es un L.Path con la extensión PM
    shape: string;
  }
}