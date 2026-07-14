export interface BulkQuotedSignal {
  type: "BULK_QUOTED_SUCCESS";
  payload: {
    quotedCount: number;
    commandIds: string[];
    timestamp: number;
  };
}

export interface OrderAcceptedSignal {
  type: "ORDER_ACCEPTED_SUCCESS";
  payload: {
    commandId: string;
    acceptedAt: number;
  };
}