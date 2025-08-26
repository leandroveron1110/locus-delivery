// src/components/OrderStatusBadge.tsx
import React from "react";
import {
  CheckCircle,
  Clock,
  Package,
  XCircle,
  Truck,
  Building,
  Loader2,
  AlertTriangle,
  MapPin,
  Clipboard,
} from "lucide-react";
import { OrderStatus, PaymentMethodType, PaymentStatus } from "@/features/orders/types/order";

interface Props {
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentType?: PaymentMethodType;
}

const statusMap: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  // Estados generales del pedido
  [OrderStatus.PENDING]: {
    label: "Pendiente",
    color: "bg-gray-100 text-gray-800",
    Icon: Clock,
  },
  [OrderStatus.CONFIRMED]: {
    label: "Confirmado",
    color: "bg-green-100 text-green-800",
    Icon: CheckCircle,
  },
  [OrderStatus.PREPARING]: {
    label: "Preparando",
    color: "bg-blue-100 text-blue-800",
    Icon: Package,
  },
  [OrderStatus.READY_FOR_CUSTOMER_PICKUP]: {
    label: "Listo p/ Retiro",
    color: "bg-teal-100 text-teal-800",
    Icon: Building,
  },
  [OrderStatus.READY_FOR_DELIVERY_PICKUP]: {
    label: "Listo p/ Envío",
    color: "bg-fuchsia-100 text-fuchsia-800",
    Icon: MapPin,
  },
  [OrderStatus.DELIVERY_ACCEPTED]: {
    label: "Delivery Acepto",
    color: "bg-fuchsia-100 text-fuchsia-800",
    Icon: MapPin,
  },
    [OrderStatus.CANCELLED_BY_DELIVERY]: {
    label: "Delivery Cancelo",
    color: "bg-fuchsia-100 text-fuchsia-800",
    Icon: MapPin,
  },
  [OrderStatus.DELIVERY_PENDING]: {
    label: "Envío Asignado",
    color: "bg-purple-100 text-purple-800",
    Icon: Truck,
  },
  [OrderStatus.OUT_FOR_PICKUP]: {
    label: "En camino",
    color: "bg-orange-100 text-orange-800",
    Icon: Truck,
  },
  [OrderStatus.DELIVERED]: {
    label: "Entregado",
    color: "bg-emerald-100 text-emerald-800",
    Icon: CheckCircle,
  },
  [OrderStatus.COMPLETED]: {
    label: "Completado",
    color: "bg-green-100 text-green-800",
    Icon: CheckCircle,
  },
  [OrderStatus.CANCELLED_BY_USER]: {
    label: "Cancelado por cliente",
    color: "bg-red-100 text-red-800",
    Icon: XCircle,
  },
  [OrderStatus.REJECTED_BY_BUSINESS]: {
    label: "Rechazado por negocio",
    color: "bg-red-100 text-red-800",
    Icon: XCircle,
  },
  [OrderStatus.DELIVERY_FAILED]: {
    label: "Envío fallido",
    color: "bg-red-100 text-red-800",
    Icon: AlertTriangle,
  },
};

export default function OrderStatusBadge({
  status,
  paymentStatus,
  paymentType,
}: Props) {
  // Lógica específica para estados de pago por transferencia
  if (paymentType === PaymentMethodType.TRANSFER) {
    if (paymentStatus === PaymentStatus.PENDING) {
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-yellow-100 text-yellow-800"
          title="El cliente debe subir el comprobante"
        >
          <Clock size={12} />
          Pago pendiente
        </span>
      );
    }
    if (paymentStatus === PaymentStatus.IN_PROGRESS) {
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-yellow-300 text-yellow-900"
          title="El negocio está revisando el comprobante"
        >
          <Loader2 size={12} className="animate-spin" />
          Pago en revisión
        </span>
      );
    }
  }

  // Lógica para estado de pago en efectivo
  if (paymentType === PaymentMethodType.CASH && status === OrderStatus.PENDING) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-gray-200 text-gray-700"
        title="Pago en efectivo al recibir el pedido"
      >
        <Clipboard size={12} />
        A pagar en efectivo
      </span>
    );
  }

  // Lógica para el resto de los estados generales
  const s = statusMap[status];

  if (!s) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-gray-200 text-gray-700">
        <AlertTriangle size={12} />
        Estado desconocido
      </span>
    );
  }

  const Icon = s.Icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium rounded-full ${s.color}`}
      title={s.label}
      aria-label={s.label}
      role="status"
    >
      <Icon size={12} className="shrink-0" />
      {s.label}
    </span>
  );
}