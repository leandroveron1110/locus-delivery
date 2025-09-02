"use client";

import { Loader2 } from "lucide-react";

interface LoaderProps {
  message?: string;
}

export default function Loader({ message = "Cargando..." }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-600">
      <Loader2 className="w-8 h-8 animate-spin mb-2" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
