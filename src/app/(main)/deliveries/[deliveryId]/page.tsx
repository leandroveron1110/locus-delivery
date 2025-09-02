"use client";

import { useParams } from "next/navigation";
import DeliveryDashboard from "@/features/delivery/components/DeliveryDashboard";


export default function DeliveryDashboardPage() {
  const params = useParams<{ deliveryId: string }>();

  return <DeliveryDashboard deliveryId={params.deliveryId} />;
}
