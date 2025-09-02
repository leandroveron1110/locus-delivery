"use client";

import { Package } from "lucide-react";

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message = "No hay datos para mostrar" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-500">
      <Package className="w-10 h-10 mb-2" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
