"use client";

import React from "react";
import { EOrderStatusDelivery, Order, OrderStatus, DeliveryType, PaymentMethodType } from "../../types/order";
import OrderHeader from "./components/OrderHeader";
import { fetchUpdateOrdersByOrderID } from "../../api/order-api";
import { useDeliveryOrdersStore } from "../../stores/useDeliveryOrdersStore";
import OrderStatusDeliveryButtons from "./components/OrderStatusDeliveryButtons";

interface Props {
  order: Order;
}

export default function OrderCard({ order }: Props) {
  const updateOrderStatus = useDeliveryOrdersStore((s) => s.updateOrderStatus);

  const {
    paymentType,
    deliveryType,
    items,
    bussiness,
    total,
    createdAt,
    status,
    id,
    businessId,
    paymentStatus,
    paymentReceiptUrl,
  } = order;

  // Función genérica para actualizar el estado de la orden
  const handleChangeStatus = async (
    newStatus: OrderStatus | EOrderStatusDelivery
  ) => {
    try {
      const updatedOrder = await fetchUpdateOrdersByOrderID(
        order.id,
        newStatus
      );
      updateOrderStatus(updatedOrder.id, updatedOrder.status);
    } catch (error) {
      console.error("Error cambiando el estado:", error);
    }
  };

  // Condición para mostrar el precio al delivery
  const showPrice =
    deliveryType === DeliveryType.DELIVERY &&
    paymentType === PaymentMethodType.CASH;

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-6 rounded-xl bg-white shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <p className="text-lg font-semibold">Orden #{order.id}</p>
      </div>

      <OrderHeader
        businessName={bussiness.name}
        businessAddress={bussiness.address}
        deliveryType={deliveryType}
        total={showPrice ? total : undefined} // solo mostrar total si corresponde
        status={status}
        businessPhone={bussiness.phone}
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
