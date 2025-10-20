"use client";

import React from "react";
import {
  EOrderStatusDelivery,
  Order,
  OrderStatus,
  DeliveryType,
  PaymentMethodType,
} from "../../types/order";
import OrderHeader from "./components/OrderHeader";
import { fetchUpdateOrdersByOrderID } from "../../api/order-api";
import { useDeliveryOrdersStore } from "../../stores/useDeliveryOrdersStore";
import OrderStatusDeliveryButtons from "./components/OrderStatusDeliveryButtons";
import { Copy } from "lucide-react";
import { useAlert } from "@/features/common/ui/Alert/Alert";
import { getDisplayErrorMessage } from "@/lib/uiErrors";

interface Props {
  order: Order;
}

export default function OrderCard({ order }: Props) {
  const updateOrderStatus = useDeliveryOrdersStore((s) => s.updateOrderStatus);

  const { addAlert } = useAlert();

  const { deliveryType, business, deliveryCompany, status } = order;

  // Función genérica para actualizar el estado de la orden
  const handleChangeStatus = async (
    newStatus: OrderStatus | EOrderStatusDelivery
  ) => {
    try {
      const updatedOrder = await fetchUpdateOrdersByOrderID(
        order.id,
        newStatus
      );

      if (updatedOrder) {
        updateOrderStatus(updatedOrder.id, updatedOrder.status);
      }
    } catch (error) {
      addAlert({
        message: `Hubo un error al cambiar el estado de la orden. ${getDisplayErrorMessage(
          error
        )} `,
        type: "error",
      });
    }
  };

  return (
    <div className="w-full sm:max-w-md sm:mx-auto bg-[#f9f9ef] border border-gray-300 rounded-xl p-4 shadow-sm">
      <OrderHeader
        orderId={order.id}
        businessName={business.name}
        businessAddress={business.address}
        deliveryType={deliveryType}
        priceDeliveryTotal={deliveryCompany?.totalDelivery} // solo mostrar total si corresponde
        priceOrderTotal={order.total}
        status={status}
        customerObservations={order.customerObservations || ""}
        businessPhone={business.phone}
        userAddress={order.user.address || "Dirección no especificada"}
        userFullName={order.user.fullName}
        userPhone={order.user.phone}
        paymentType={order.paymentType}
      />

      {/* Botones del delivery */}
      <OrderStatusDeliveryButtons
        order={order}
        handleStatusChange={handleChangeStatus}
      />
    </div>
  );
}
