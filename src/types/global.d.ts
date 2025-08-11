// Interfaz para el modelo Image centralizado
export interface Image {
  id: string;
  url: string;
  publicId: string;
  format?: string;
  resourceType: string;
  width?: number;
  height?: number;
  bytes?: number; // BigInt en Prisma se mapea a number en TS (para valores razonables)
  folder?: string;
  createdAt: string;
  updatedAt: string;
}
