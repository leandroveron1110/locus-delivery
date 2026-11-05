"use client";

import { getRealtimeSocket } from "@/mini-back/infrastructure/realtime/realtime.client";
import { useEffect, useState } from "react";

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = getRealtimeSocket();

    if (!socket) {
      setIsConnected(false);
    } else {
      setIsConnected(socket.connected);
    }

    // Funciones para actualizar el estado
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onError = () => setIsConnected(false);

    socket?.on("connect", onConnect);
    socket?.on("disconnect", onDisconnect);
    socket?.on("connect_error", onError);

    // Limpieza de eventos al desmontar
    return () => {
      socket?.off("connect", onConnect);
      socket?.off("disconnect", onDisconnect);
      socket?.off("connect_error", onError);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border text-sm">
      <span
        className={`relative flex h-2.5 w-2.5`}
      >
        {isConnected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
            isConnected ? "bg-emerald-500" : "bg-rose-500"
          }`}
        />
      </span>
      <span className="font-medium text-muted-foreground">
        {isConnected ? "En vivo" : "Desconectado"}
      </span>
    </div>
  );
}