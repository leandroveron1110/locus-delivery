// src/mini-back/cores/DeliveryCore/public/index.ts
import { DeliveryPorts } from "../ports/delivery.ports";
import { DeliveryService } from "../services/delivery.service";
import { IDeliveryService } from "./delivery-service.interface";

export interface DeliveryDependencyContainer {
  deliveryProviderPort: DeliveryPorts;
}

export const DeliveryServicePublic = (
  dependencies: DeliveryDependencyContainer,
): IDeliveryService => {
  return new DeliveryService(dependencies.deliveryProviderPort);
};

export * from "./delivery-service.interface";
export * from "../inputs/accept-order.input";
export * from "../signal/bulk-quoted.signal";
export * from "../ports/delivery.ports";
