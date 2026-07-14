// src/mini-back/cores/delivery/domain/delivery.domain.ts

export type CommandType = "QUOTE" | "DISPATCH";
export type DeliveryStatus = "PENDING" | "QUOTED" | "ACCEPTED" | "CANCELLED";

export interface CoreDeliverySnapshot {
  id: string;
  command: CommandType;
  status: DeliveryStatus;
  originName: string;
  originAddress: string;
  destinationAddress: string;
  notes?: string;
  quotedCost?: number;
  createdAt: number;
  updatedAtLocal: number;
}