import { Order, OrderStatus } from "@/features/orders/types/order";
import { Check, X } from "lucide-react";

interface Props {
  order: Order;
  handleStatusChange: (newStatus: OrderStatus) => void;
}

export default function OrderStatusDeliveryButtons({
  order,
  handleStatusChange,
}: Props) {
  const status = order.status as OrderStatus;

  switch (status) {
    // Delivery recibe la orden pendiente
    case OrderStatus.READY_FOR_DELIVERY_PICKUP:
      return (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleStatusChange(OrderStatus.DELIVERY_ACCEPTED)}
            className="flex items-center gap-1 px-3 py-1 text-sm rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
          >
            <Check className="w-4 h-4" /> Aceptar Pedido
          </button>
          <button
            onClick={() => handleStatusChange(OrderStatus.DELIVERY_REJECTED)}
            className="flex items-center gap-1 px-3 py-1 text-sm rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" /> Rechazar Pedido
          </button>
        </div>
      );
    case OrderStatus.DELIVERY_PENDING:
      return (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleStatusChange(OrderStatus.DELIVERY_ACCEPTED)}
            className="flex items-center gap-1 px-3 py-1 text-sm rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
          >
            <Check className="w-4 h-4" /> Aceptar Pedido
          </button>
          <button
            onClick={() => handleStatusChange(OrderStatus.DELIVERY_REJECTED)}
            className="flex items-center gap-1 px-3 py-1 text-sm rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" /> Rechazar Pedido
          </button>
        </div>
      );

    // Delivery marcando la entrega
    case OrderStatus.OUT_FOR_DELIVERY:
    case OrderStatus.DELIVERY_ACCEPTED:
      return (
        <button
          onClick={() => handleStatusChange(OrderStatus.DELIVERED)}
          className="px-3 py-1 text-sm rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
        >
          Marcar como Entregado
        </button>
      );

    default:
      return null; // Otros estados no muestran botones al delivery
  }
}
