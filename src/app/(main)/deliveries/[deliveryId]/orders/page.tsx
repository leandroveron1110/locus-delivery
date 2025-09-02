"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDeliveryOrdersSocket } from "@/features/orders/socket/useDeliverySocket";
import { useDeliveryOrdersStore } from "@/features/orders/stores/useDeliveryOrdersStore";
import { useFetchDeliveryOrders } from "@/features/orders/stores/useFetchDeliveryOrders";
import OrderList from "@/features/orders/components/OrderList";
import BackButton from "@/features/common/ui/BackButton/BackButton";
import Loader from "@/features/common/ui/Loader/Loader";

export default function DeliveryOrdersPage() {
  const params = useParams<{ deliveryId: string }>();

  const deliveryId = params?.deliveryId;

  if (!deliveryId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Loader message="Cargando Ordenes..." />
      </div>
    );
  }


  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);

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
        <BackButton />
        <h1 className="text-2xl font-semibold mb-4">Órdenes para entregar</h1>
        <p>Error: {error}</p>
      </div>
    );

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <BackButton />
      <h1 className="text-2xl font-semibold mb-6">Órdenes para entregar</h1>
      <OrderList orders={orders} />
    </div>
  );
}
