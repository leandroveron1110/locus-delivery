// src/mini-back/cores/DeliveryCore/public/delivery-service.interface.ts

import { AcceptOrderInput, BulkQuoteInput } from "../inputs/accept-order.input";
import { BulkQuotedSignal, OrderAcceptedSignal } from "../signal/bulk-quoted.signal";

export interface IDeliveryService {
  bulkQuote(input: BulkQuoteInput): Promise<BulkQuotedSignal>;
  acceptOrder(input: AcceptOrderInput): Promise<OrderAcceptedSignal>;
}