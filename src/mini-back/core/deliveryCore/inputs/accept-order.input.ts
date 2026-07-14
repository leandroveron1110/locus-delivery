export interface AcceptOrderInput {
  commandId: string;
  acceptedBy: string;
}

export interface BulkQuoteInput {
  defaultCostOverride?: number;
  author: string;
}