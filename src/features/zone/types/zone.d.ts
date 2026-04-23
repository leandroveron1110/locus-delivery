export interface Zone {
  name: string;
  price: number;
  hasTimeLimit: boolean;
  startTime: string | null;
  endTime: string | null;
  companyId: string;
  isActive: boolean;
  geometry: GeoJsonPolygon;
}

// types/zone.ts

// Interfaz para el modelo de datos completo de la zona (tal como viene del backend)
export interface IZone {
  id: string;
  name: string;
  priceMatrices: MatrixZone[];
  hasTimeLimit: boolean;
  startTime: string | null;
  endTime: string | null;
  companyId: string;
  isActive: boolean;
  geometry: GeoJsonPolygon;
}

export interface MatrixZone {
  companyId: string;
  deliveryZoneId: string;
  macroZoneId: string;
  price: number;
}
export interface MacroZone {
  id: string;
  name: string;
}


// Interfaz para los datos que se manejan dentro del formulario de CREACIÓN
export interface CreateZoneFormData {
  name: string;
  price: number;
  hasTimeLimit: boolean;
  startTime?: string;
  endTime?: string;
  isActive: boolean;
}

// Interfaz para los datos que se manejan dentro del formulario de EDICIÓN
export interface EditZoneFormData {
  id: string;
  name: string;
  price: number;
  hasTimeLimit: boolean;
  startTime?: string;
  endTime?: string;
  isActive: boolean;
}

export type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: number[][][];
};

export interface DrawnFeature {
  type: "Feature";
  properties: Record<string, unknown>;
  geometry: GeoJsonPolygon;
}
