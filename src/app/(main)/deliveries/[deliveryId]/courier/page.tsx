"use client";

import { useParams } from "next/navigation";
import Loader from "@/features/common/ui/Loader/Loader";
import BaseDeliveryPanelV2 from "@/features/base/BaseDeliveryPanelV2";
import { CouriersPage } from "@/features/courier/CouriersPage";

export default function DeliveryOrdersPage() {
  const params = useParams<{ deliveryId: string }>();

  const deliveryId = params?.deliveryId;

  if (!deliveryId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Loader message="Cargando Cadetes..." />
      </div>
    );
  }


  return (
    <div className="w-full bg-gray-100">
      <CouriersPage />
    </div>
  );
}
