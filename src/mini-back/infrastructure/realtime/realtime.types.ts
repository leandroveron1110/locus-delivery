export interface RealtimeEvent<T = unknown> {
  eventId: string;
  eventType: string;
  occurredAt: string;
  payload: T;
}

export interface RealtimeAck<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}