"use client";

import { MapPin, Store, Truck, Copy, Check } from "lucide-react";
import { Order, OrderStatus } from "@/features/orders/types/order";
import { useAlert } from "@/features/common/ui/Alert/Alert";
import { getDisplayErrorMessage } from "@/lib/uiErrors";
import { useDeliveryOrdersStore } from "@/features/orders/stores/useDeliveryOrdersStore";
import { fetchUpdateOrdersByOrderID } from "@/features/orders/api/order-api";
import OrderStatusBadge from "../OrderStatusBadge";
import OrderStatusDeliveryButtons from "../OrderStatusDeliveryButtons";
import { formatPrice } from "@/features/common/utils/formatPrice";

interface Props {
  orders: Order[];
}

const getShortId = (id: string) => `#${id.substring(0, 8).toUpperCase()}`;

export default function DeliveryOrdersTable({ orders }: Props) {
  const updateOrderStatus = useDeliveryOrdersStore((s) => s.updateOrderStatus);
  const { addAlert } = useAlert();

  const handleChangeStatus = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      const updatedOrder = await fetchUpdateOrdersByOrderID(orderId, newStatus);
      if (updatedOrder) {
        updateOrderStatus(updatedOrder.id, updatedOrder.status);
      }
    } catch (error) {
      addAlert({
        message: `Hubo un error al cambiar el estado. ${getDisplayErrorMessage(error)}`,
        type: "error",
      });
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50 text-left text-sm text-gray-600">
          <tr>
            <th className="p-3">Orden</th>
            <th className="p-3">Estado</th>
            <th className="p-3">Retiro</th>
            <th className="p-3">Entrega</th>
            <th className="p-3">Envío</th>
            <th className="p-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const businessMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              order.business.address
            )}`;
            const userMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              order.user.address || ""
            )}`;

            return (
              <tr
                key={order.id}
                className="border-t text-sm hover:bg-gray-50 transition-colors"
              >
                {/* Orden */}
                <td className="p-3 font-mono text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    {getShortId(order.id)}
                    <button
                      onClick={() => navigator.clipboard.writeText(order.id)}
                      className="text-gray-400 hover:text-blue-600"
                      title="Copiar ID"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </td>

                {/* Estado */}
                <td className="p-3">
                  <OrderStatusBadge status={order.status} />
                </td>

                {/* Retiro */}
                <td className="p-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium flex items-center gap-1">
                      <Store className="w-4 h-4 text-gray-400" />
                      {order.business.name}
                    </span>
                    <a
                      href={businessMapsLink}
                      target="_blank"
                      className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
                    >
                      <MapPin className="w-3 h-3" /> Ver mapa
                    </a>
                  </div>
                </td>

                {/* Entrega */}
                <td className="p-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium flex items-center gap-1">
                      <Truck className="w-4 h-4 text-gray-400" />
                      {order.user.fullName}
                    </span>
                    <a
                      href={userMapsLink}
                      target="_blank"
                      className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
                    >
                      <MapPin className="w-3 h-3" /> Ver mapa
                    </a>
                  </div>
                </td>

                {/* Envío */}
                <td className="p-3 font-semibold">
                  {formatPrice(order.deliveryCompany?.totalDeliveryCost) ?? "-"}
                </td>

                {/* Acciones */}
                <td className="p-3 text-right">
                  <OrderStatusDeliveryButtons
                    order={order}
                    handleStatusChange={(status) =>
                      handleChangeStatus(order.id, status)
                    }
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {orders.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No hay pedidos asignados.
        </div>
      )}
    </div>
  );
}
