import { io } from "socket.io-client";
const accessToken = localStorage.getItem("authToken");

if (!accessToken) {
  throw new Error("No se encontró el token de autenticación");
}

const socket = io(`${process.env.NEXT_PUBLIC_WS_URL}/ws`, {
  auth: {
    token: accessToken,
  },
});

interface JoinRoomResponse {
  success: boolean;
  message?: string;
}

socket.on("connect", () => {
  console.log("Conectado a Hunay Realtime");

  socket.emit(
    "room:join",
    {
      room: "delivery:operations",
    },
    (response: JoinRoomResponse) => {
      if (!response?.success) {
        console.error("No se pudo ingresar a la sala");
        return;
      }

      console.log("Suscripción confirmada");
    },
  );
});

socket.on("connect_error", (error) => {
  console.error("Error de conexión:", error.message);
});

socket.on("delivery.command.created", (event) => {
  console.log("Nuevo despacho:", event.payload);
});

socket.on("disconnect", (reason) => {
  console.log("Desconectado:", reason);
});
