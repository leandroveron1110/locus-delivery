"use client";

import { AlertTriangle } from "lucide-react";

interface ErrorMessageProps {
  message?: string;
}

export default function ErrorMessage({ message = "Ocurrió un error" }: ErrorMessageProps) {
  return (
    <div className="flex items-center gap-2 bg-red-100 text-red-700 p-4 rounded-xl">
      <AlertTriangle className="w-5 h-5 shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
