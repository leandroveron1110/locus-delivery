"use client";

import {
  Loader2,
  CircleCheck,
  CircleX,
  ArrowRight,
} from "lucide-react";
import { PaymentStatus } from "../../../types/order";

interface Props {
  status: PaymentStatus;
  paymentReceiptUrl?: string | null;
}

export default function PaymentStatusSection({ status, paymentReceiptUrl }: Props) {
  if (status === PaymentStatus.IN_PROGRESS) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 p-4 rounded-lg border bg-yellow-100 border-yellow-200">
          <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin text-yellow-600" />
          <p className="text-sm text-gray-700">Comprobante subido. Lo estamos verificando.</p>
        </div>
        {paymentReceiptUrl && (
          <a
            href={paymentReceiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline text-sm"
          >
            Ver comprobante <ArrowRight className="w-4 h-4" />
          </a>
        )}
      </div>
    );
  }

  if (status === PaymentStatus.CONFIRMED) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 p-4 rounded-lg border bg-green-100 border-green-200">
          <CircleCheck className="w-5 h-5 flex-shrink-0 text-green-600" />
          <p className="text-sm text-gray-700">Pago confirmado. Tu comprobante fue aceptado.</p>
        </div>
        {paymentReceiptUrl && (
          <a
            href={paymentReceiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline text-sm"
          >
            Ver comprobante <ArrowRight className="w-4 h-4" />
          </a>
        )}
      </div>
    );
  }

  if (status === PaymentStatus.REJECTED) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 p-4 rounded-lg border bg-red-100 border-red-200">
          <CircleX className="w-5 h-5 flex-shrink-0 text-red-600" />
          <p className="text-sm text-gray-700">
            El pago fue rechazado. Puedes subir un nuevo comprobante o contactar al negocio.
          </p>
        </div>
        {paymentReceiptUrl && (
          <a
            href={paymentReceiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline text-sm"
          >
            Ver comprobante <ArrowRight className="w-4 h-4" />
          </a>
        )}
      </div>
    );
  }

  return null; // Para PENDING o casos no manejados
}
