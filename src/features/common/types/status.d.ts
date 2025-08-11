// src/features/common/types/status.d.ts

// Interfaz para el modelo Status
export interface Status {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  entityType: string;
  isFinal: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
