// src/app/providers.tsx
"use client";

import { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient"; // o donde tengas tu cliente
import { AlertProvider } from "@/features/common/ui/Alert/Alert";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AlertProvider>{children}</AlertProvider>
    </QueryClientProvider>
  );
}
