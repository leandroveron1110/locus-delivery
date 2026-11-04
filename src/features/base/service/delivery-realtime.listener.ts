import { getRealtimeSocket } from "@/mini-back/infrastructure/realtime/realtime.client";

export const DELIVERY_EVENTS = {
  COMMAND_CREATED: "delivery.command.created",
  COMMAND_UPDATED: "delivery.command.updated",
} as const;

export function listenDeliveryCommands(
  onCreated: (data: any) => void,
  onUpdated: (data: any) => void,
) {
  const socket = getRealtimeSocket();

  if (!socket) {
    console.warn("Socket no inicializado");
    return () => {};
  }

  socket.on(DELIVERY_EVENTS.COMMAND_CREATED, onCreated);
  socket.on(DELIVERY_EVENTS.COMMAND_UPDATED, onUpdated);

  return () => {
    socket.off(DELIVERY_EVENTS.COMMAND_CREATED, onCreated);
    socket.off(DELIVERY_EVENTS.COMMAND_UPDATED, onUpdated);
  };
}