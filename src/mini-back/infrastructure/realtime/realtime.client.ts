import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectRealtime(accessToken: string) {
  if (socket?.connected) return socket;

  socket = io(`${process.env.NEXT_PUBLIC_WS_URL}/ws`, {
    auth: {
      token: accessToken,
    },
    transports: ["websocket"],
    reconnection: true,
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
  socket?.disconnect();
  socket = null;
}

export function getRealtimeSocket() {
  return socket;
}
