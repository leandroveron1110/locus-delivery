import { getRealtimeSocket } from "./realtime.client";
import type { RealtimeEvent } from "./realtime.types";

export function listenRealtime<T>(
  event: string,
  handler: (data: RealtimeEvent<T>) => void,
) {
  const socket = getRealtimeSocket();

  if (!socket) {
    console.warn("Realtime: socket no inicializado");
    return () => {};
  }

  socket.on(event, handler);

  return () => {
    socket.off(event, handler);
  };
}
