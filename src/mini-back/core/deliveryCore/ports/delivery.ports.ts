// src/mini-back/cores/delivery/ports/delivery.ports.ts
import { CoreDeliverySnapshot } from "../domain/delivery.domain";

export interface DeliveryPorts {
  findCommandById(id: string): Promise<CoreDeliverySnapshot | undefined>;
  findPendingQuotes(): Promise<CoreDeliverySnapshot[]>;
  saveCommandState(command: CoreDeliverySnapshot): Promise<void>;
  saveBatchCommands(commands: CoreDeliverySnapshot[]): Promise<void>;
}