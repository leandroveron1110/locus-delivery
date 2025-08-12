"use client";

import React from "react";
import {
  EOrderStatusBusiness,
  EOrderStatusDelivery,
  Order,
  OrderStatus,
} from "../types/order";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderDetails from "./OrderDetails";
import OrderStatusSelector from "./OrderStatusSelector";
import { fetchUpdateOrdersByOrderID } from "../api/order-api";
import { useDeliveryOrdersSocket } from "../socket/useDeliverySocket";
import { useDeliveryOrdersStore } from "../stores/useDeliveryOrdersStore";

interface Props {
  order: Order;
  showDetails: boolean;
  toggleDetails: () => void;
}

export default function OrderCard({
  order,
  showDetails,
  toggleDetails,
}: Props) {
  const subtotal = order.total; // Podés cambiar si necesitás calcularlo distinto

  const updateOrderStatus = useDeliveryOrdersStore((s) => s.updateOrderStatus);

  const formatAddress = (
    address: Order["pickupAddress"] | Order["deliveryAddress"]
  ) => {
    if (!address) return "No especificada";
    return `${address.street}${address.number ? ` ${address.number}` : ""}${
      address.apartment ? `, ${address.apartment}` : ""
    }, ${address.city}, ${address.province}`;
  };

  const handleChangeStatus = async (
    orderId: string,
    newStatus: EOrderStatusDelivery
  ) => {
    try {
      const updatedOrder = await fetchUpdateOrdersByOrderID(orderId, newStatus);
      updateOrderStatus(updatedOrder.id, updatedOrder.status);
    } catch (error) {
      console.error("Error cambiando el estado:", error);
    }
  };

  return (
    <div className="p-5 border rounded-lg shadow hover:shadow-lg transition bg-white">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Orden #{order.id}</h2>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Orden #{order.id}</h2>
        <OrderStatusSelector
          handleChangeStatus={handleChangeStatus}
          orderId={order.id}
          status={order.status as unknown as EOrderStatusDelivery}
        />
      </div>

      <div className="mb-4 space-y-2 text-sm">
        <p>
          <strong>Retiro:</strong>{" "}
          {formatAddress(order.pickupAddress) ?? order.businessId}
        </p>
        <p>
          <strong>Entrega:</strong> {formatAddress(order.deliveryAddress)}
        </p>
        <p>
          <strong>Cliente:</strong> {order.user.firstName} {order.user.lastName}{" "}
          -{" "}
          <a
            href={`mailto:${order.user.email}`}
            className="text-blue-600 underline"
          >
            {order.user.email}
          </a>
        </p>
      </div>

      {order.notes && (
        <p className="mb-4 italic text-gray-600">Nota: {order.notes}</p>
      )}

      <button
        onClick={toggleDetails}
        className="mb-4 text-blue-600 hover:underline text-sm font-medium"
      >
        {showDetails ? "Ocultar detalles" : "Ver detalles"}
      </button>

      {showDetails && <OrderDetails items={order.items} />}

      <div className="border-t pt-3 flex justify-between font-semibold text-lg">
        <span>Subtotal:</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-semibold text-lg">
        <span>Envío:</span>
        <span>${order.total.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-bold text-xl mt-1">
        <span>Total a cobrar:</span>
        <span>${order.total.toFixed(2)}</span>
      </div>
    </div>
  );
}
