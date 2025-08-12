"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDeliveryOrdersSocket } from "@/features/orders/socket/useDeliverySocket";
import { useDeliveryOrdersStore } from "@/features/orders/stores/useDeliveryOrdersStore";
import { useFetchDeliveryOrders } from "@/features/orders/stores/useFetchDeliveryOrders";
import OrderList from "@/features/orders/components/OrderList";

export default function DeliveryOrdersPage() {
  const { deliveryId } = useParams<{ deliveryId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFetchDeliveryOrders(deliveryId);
  useDeliveryOrdersSocket(deliveryId);

  const orders = useDeliveryOrdersStore((s) => s.orders);

  useEffect(() => {
    if (orders.length >= 0) setLoading(false);
  }, [orders]);

  if (loading)
    return (
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Órdenes para entregar</h1>
        <p>Cargando órdenes...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-red-600">
        <h1 className="text-2xl font-semibold mb-4">Órdenes para entregar</h1>
        <p>Error: {error}</p>
      </div>
    );

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Órdenes para entregar</h1>
      <OrderList orders={orders} />
    </div>
  );
}
