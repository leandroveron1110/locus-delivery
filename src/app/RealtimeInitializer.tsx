"use client";

import { connectRealtime } from "@/mini-back/infrastructure/realtime/realtime.client";
import { useEffect } from "react";

export function RealtimeInitializer() {
  useEffect(() => {
    const accessToken = localStorage.getItem("authToken");

    if (!accessToken) return;

    // Inicia la conexión global una sola vez
    connectRealtime(accessToken);

  }, []);

  return null;
}