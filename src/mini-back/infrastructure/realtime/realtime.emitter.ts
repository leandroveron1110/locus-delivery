import { getRealtimeSocket } from "./realtime.client";
import type { RealtimeAck } from "./realtime.types";

export function emitRealtime<TPayload, TResponse = unknown>(
  event: string,
  payload: TPayload,
  callback?: (response: RealtimeAck<TResponse>) => void,
) {
  const socket = getRealtimeSocket();

  if (!socket || !socket.connected) {
    console.warn("Realtime: no hay conexión disponible");
    return false;
  }

  socket.emit(event, payload, callback);

  return true;
}