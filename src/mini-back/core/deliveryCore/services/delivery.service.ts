// src/mini-back/cores/delivery/delivery.core.ts

import { CoreDeliverySnapshot } from "../domain/delivery.domain";
import { AcceptOrderInput, BulkQuoteInput } from "../inputs/accept-order.input";
import { DeliveryPorts } from "../ports/delivery.ports";
import { IDeliveryService } from "../public/delivery-service.interface";
import {
  BulkQuotedSignal,
  OrderAcceptedSignal,
} from "../signal/bulk-quoted.signal";

export class DeliveryService implements IDeliveryService {
  constructor(private readonly ports: DeliveryPorts) {}

  /**
   * Acción: Cotización Masiva
   * Signature: public bulkQuote(input: BulkQuoteInput): Promise<BulkQuotedSignal>
   */
  public async bulkQuote(input: BulkQuoteInput): Promise<BulkQuotedSignal> {
    // 1. Invocamos al mundo exterior mediante el Port
    const pendingCommands = await this.ports.findPendingQuotes();

    if (!pendingCommands.length) {
      throw new Error(
        "Invariante Rota: No hay comandas pendientes para cotizar.",
      );
    }

    const now = Date.now();
    const updatedCommands: CoreDeliverySnapshot[] = pendingCommands.map(
      (cmd) => {
        const cost = input.defaultCostOverride ?? cmd.quotedCost;

        if (!cost || cost <= 0) {
          throw new Error(
            `Negocio Denegado: Tarifa inválida para la orden ${cmd.id}`,
          );
        }

        return {
          ...cmd,
          quotedCost: cost,
          status: "QUOTED",
          updatedAtLocal: now,
        };
      },
    );

    // 2. Le pedimos al mundo exterior que guarde el nuevo estado
    await this.ports.saveBatchCommands(updatedCommands);

    // 3. Retornamos la Signal con la verdad histórica
    return {
      type: "BULK_QUOTED_SUCCESS",
      payload: {
        quotedCount: updatedCommands.length,
        commandIds: updatedCommands.map((c) => c.id),
        timestamp: now,
      },
    };
  }

  /**
   * Acción: Aceptar Orden
   * Signature: public acceptOrder(input: AcceptOrderInput): Promise<OrderAcceptedSignal>
   */
  public async acceptOrder(
    input: AcceptOrderInput,
  ): Promise<OrderAcceptedSignal> {
    const command = await this.ports.findCommandById(input.commandId);

    if (!command) {
      throw new Error("Invariante Rota: La comanda especificada no existe.");
    }

    if (command.status === "CANCELLED") {
      throw new Error("Negocio Denegado: La orden fue cancelada previamente.");
    }

    const now = Date.now();
    const updatedCommand: CoreDeliverySnapshot = {
      ...command,
      status: "ACCEPTED",
      updatedAtLocal: now,
    };

    // Le pedimos al Port que persista la mutación
    await this.ports.saveCommandState(updatedCommand);

    return {
      type: "ORDER_ACCEPTED_SUCCESS",
      payload: {
        commandId: command.id,
        acceptedAt: now,
      },
    };
  }
}
