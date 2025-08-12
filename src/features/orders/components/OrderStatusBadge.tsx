"use client";
import React from "react";
import {
  CheckCircle,
  Clock,
  Package,
  Truck,
  XCircle,
  AlertCircle,
  RefreshCcw,
  DollarSign,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { OrderStatus } from "../types/order";

interface Props {
  status: OrderStatus | string;
}

const statusMap: Record<
  OrderStatus,
  { label: string; color: string; Icon: React.FC<any> }
> = {
  // 1. Creación y pago
  [OrderStatus.PENDING]: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800",
    Icon: Clock,
  },
  [OrderStatus.WAITING_FOR_PAYMENT]: {
    label: "Esperando pago",
    color: "bg-yellow-200 text-yellow-900",
    Icon: DollarSign,
  },
  [OrderStatus.PAYMENT_IN_PROGRESS]: {
    label: "Pago en curso",
    color: "bg-yellow-300 text-yellow-900",
    Icon: Loader2,
  },
  [OrderStatus.PAYMENT_CONFIRMED]: {
    label: "Pago confirmado",
    color: "bg-green-100 text-green-800",
    Icon: CheckCircle,
  },

  // 2. Confirmación y preparación en negocio
  [OrderStatus.PENDING_CONFIRMATION]: {
    label: "Esperando confirmación",
    color: "bg-yellow-100 text-yellow-800",
    Icon: Clock,
  },
  [OrderStatus.CONFIRMED]: {
    label: "Confirmada",
    color: "bg-blue-100 text-blue-800",
    Icon: CheckCircle,
  },
  [OrderStatus.REJECTED_BY_BUSINESS]: {
    label: "Rechazada por negocio",
    color: "bg-red-100 text-red-800",
    Icon: XCircle,
  },
  [OrderStatus.PREPARING]: {
    label: "En preparación",
    color: "bg-blue-200 text-blue-900",
    Icon: RefreshCcw,
  },

  // 2.1 Pedido listo
  [OrderStatus.READY_FOR_CUSTOMER_PICKUP]: {
    label: "Listo para retiro",
    color: "bg-purple-100 text-purple-800",
    Icon: Package,
  },
  [OrderStatus.READY_FOR_DELIVERY_PICKUP]: {
    label: "Listo para delivery",
    color: "bg-pink-100 text-pink-800",
    Icon: Truck,
  },

  // 3. Asignación de delivery
  [OrderStatus.DELIVERY_PENDING]: {
    label: "Buscando delivery",
    color: "bg-orange-100 text-orange-800",
    Icon: Clock,
  },
  [OrderStatus.DELIVERY_ASSIGNED]: {
    label: "Delivery asignado",
    color: "bg-teal-100 text-teal-800",
    Icon: Truck,
  },
  [OrderStatus.DELIVERY_ACCEPTED]: {
    label: "Delivery aceptó",
    color: "bg-teal-200 text-teal-900",
    Icon: CheckCircle,
  },
  [OrderStatus.DELIVERY_REJECTED]: {
    label: "Delivery rechazó",
    color: "bg-red-200 text-red-900",
    Icon: XCircle,
  },
  [OrderStatus.DELIVERY_REASSIGNING]: {
    label: "Reasignando delivery",
    color: "bg-indigo-100 text-indigo-800",
    Icon: RefreshCcw,
  },

  // 4. Transporte
  [OrderStatus.OUT_FOR_PICKUP]: {
    label: "Delivery yendo al negocio",
    color: "bg-indigo-200 text-indigo-900",
    Icon: Truck,
  },
  [OrderStatus.PICKED_UP]: {
    label: "Pedido recogido",
    color: "bg-indigo-300 text-indigo-900",
    Icon: Truck,
  },
  [OrderStatus.OUT_FOR_DELIVERY]: {
    label: "En camino al cliente",
    color: "bg-indigo-400 text-indigo-900",
    Icon: Truck,
  },

  // 5. Entrega y finalización
  [OrderStatus.DELIVERED]: {
    label: "Entregado",
    color: "bg-green-100 text-green-800",
    Icon: Package,
  },
  [OrderStatus.DELIVERY_FAILED]: {
    label: "Entrega fallida",
    color: "bg-red-300 text-red-900",
    Icon: AlertCircle,
  },
  [OrderStatus.RETURNED]: {
    label: "Devuelto al negocio",
    color: "bg-red-400 text-red-900",
    Icon: XCircle,
  },
  [OrderStatus.REFUNDED]: {
    label: "Reintegrado",
    color: "bg-gray-200 text-gray-800",
    Icon: DollarSign,
  },
  [OrderStatus.COMPLETED]: {
    label: "Finalizado",
    color: "bg-green-200 text-green-900",
    Icon: CheckCircle,
  },

  // 6. Cancelaciones
  [OrderStatus.CANCELLED_BY_USER]: {
    label: "Cancelado por cliente",
    color: "bg-red-100 text-red-800",
    Icon: XCircle,
  },
  [OrderStatus.CANCELLED_BY_BUSINESS]: {
    label: "Cancelado por negocio",
    color: "bg-red-200 text-red-900",
    Icon: XCircle,
  },
  [OrderStatus.CANCELLED_BY_DELIVERY]: {
    label: "Cancelado por delivery",
    color: "bg-red-300 text-red-900",
    Icon: XCircle,
  },

  // 7. Errores generales
  [OrderStatus.FAILED]: {
    label: "Error en pedido",
    color: "bg-gray-300 text-gray-900",
    Icon: AlertCircle,
  },
};

export default function OrderStatusBadge({ status }: Props) {
  const s = statusMap[status as OrderStatus];

  if (!s) {
    return (
      <span className="inline-block px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-700 rounded">
        {status}
      </span>
    );
  }

  const Icon = s.Icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded ${s.color}`}
      title={s.label}
      aria-label={s.label}
      role="status"
    >
      <Icon size={14} />
      {s.label}
    </span>
  );
}
