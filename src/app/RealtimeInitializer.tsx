"use client";

import {
  connectRealtime,
  disconnectRealtime,
} from "@/mini-back/infrastructure/realtime/realtime.client";
import { useEffect } from "react";

export function RealtimeInitializer() {
  useEffect(() => {
    const accessToken = localStorage.getItem("authToken");

    if (!accessToken) return;

    connectRealtime(accessToken);

    return () => {
      disconnectRealtime();
    };
  }, []);

  return null;
}
