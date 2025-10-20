"use client";

import React from "react";
import { useParams } from "next/navigation";
import BackButton from "@/features/common/ui/BackButton/BackButton";
import Loader from "@/features/common/ui/Loader/Loader";
import BusinessOrdersPage from "@/features/orders/components/BusinessOrdersPage";

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


  return (
    <div className="w-full bg-gray-100">
      <BackButton />
      <h1 className="text-2xl font-semibold mb-6">Órdenes para entregar</h1>
      <BusinessOrdersPage deliveryId={deliveryId} />
    </div>
  );
}
