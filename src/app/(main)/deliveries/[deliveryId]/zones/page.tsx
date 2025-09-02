"use client";
import BackButton from "@/features/common/ui/BackButton/BackButton";
import Loader from "@/features/common/ui/Loader/Loader";
import DeliveryZones from "@/features/zone/components/DeliveryZones";
import { useParams } from "next/navigation";

export default function Zone() {
  const params = useParams<{ deliveryId: string }>();
  const deliveryId = params?.deliveryId;

  // Si todavía no hay deliveryId, mostramos un loader
  if (!deliveryId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Loader message="Cargando zonas..." />
      </div>
    );
  }
  return (
    <div className="">
            <div className="max-w-xl p-4">
        <BackButton />
      </div>
      <DeliveryZones companyId={deliveryId} />
    </div>
  );
}
