import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectRealtime(accessToken: string) {
  // Si ya existe un socket conectado o intentando conectar, lo retornamos de inmediato
  if (socket?.connected || socket?.active) {
    return socket;
  }

  // Si ya existía una instancia vieja desconectada, la limpiamos antes de crear otra
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  socket = io(`${process.env.NEXT_PUBLIC_WS_URL}/ws`, {
    auth: {
      token: accessToken,
    },
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("Conectado a Hunay Realtime");

    socket?.emit(
      "room:join",
      { room: "delivery:operations" },
      (response: { success: boolean; message?: string }) => {
        if (!response.success) {
          console.error("No se pudo ingresar a la sala", response.message);
          return;
        }

        console.log("Suscripción confirmada");
      },
    );
  });

  socket.on("connect_error", (error) => {
    console.error("Error de conexión Realtime:", error.message);
  });

  return socket;
}

export function disconnectRealtime() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getRealtimeSocket() {
  return socket;
}
