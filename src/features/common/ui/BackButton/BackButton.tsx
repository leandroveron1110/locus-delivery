// src/components/common/BackButton.jsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
      aria-label="Volver atrás"
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="font-medium">Volver</span>
    </button>
  );
}