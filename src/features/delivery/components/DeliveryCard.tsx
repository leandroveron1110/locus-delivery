"use client";

import Link from "next/link";
import { Phone, Building2, CheckCircle, XCircle } from "lucide-react";

interface Props {
  delivery: {
    id: string;
    name: string;
    phone: string;
    isActive: boolean;
  };
}

export default function DeliveryCard({ delivery }: Props) {
  return (
    <Link href={`/deliveries/${delivery.id}`}>
      <div className="group rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md hover:border-blue-500 transition-all cursor-pointer">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
              {delivery.name}
            </h2>
          </div>
          {delivery.isActive ? (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              Activo
            </span>
          ) : (
            <span className="flex items-center gap-1 text-sm text-red-600">
              <XCircle className="w-4 h-4" />
              Inactivo
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex items-center gap-2 text-gray-600">
          <Phone className="w-4 h-4" />
          <p className="text-sm">{delivery.phone || "Sin teléfono"}</p>
        </div>
      </div>
    </Link>
  );
}
