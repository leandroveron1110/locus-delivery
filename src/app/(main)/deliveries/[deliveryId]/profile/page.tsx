"use client";

import { useParams } from "next/navigation";
import { useDelivery } from "@/features/delivery/hooks/useDeliveries";
import Loader from "@/features/common/ui/Loader/Loader";
import ErrorMessage from "@/features/common/ui/ErrorMessage/ErrorMessage";
import DeliveryProfile from "@/features/delivery/components/DeliveryProfile";
import BackButton from "@/features/common/ui/BackButton/BackButton";
import { useAlert } from "@/features/common/ui/Alert/Alert";
import { useEffect } from "react";
import { getDisplayErrorMessage } from "@/lib/uiErrors";

export default function DeliveryProfilePage() {
  const params = useParams<{ deliveryId: string }>();
  const deliveryId = params?.deliveryId;
  const { data: delivery, isLoading, error, isError } = useDelivery(deliveryId);

  const { addAlert } = useAlert();

  useEffect(() => {
    if (isError) {
      addAlert({
        message: getDisplayErrorMessage(error),
        type: "error",
      });
    }
  }, [isError, error, addAlert]);

  // Si todavía no hay deliveryId, mostramos un loader
  if (!deliveryId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Loader message="Cargando perfil..." />
      </div>
    );
  }


  const containerClass =
    "flex items-center justify-center min-h-screen bg-gray-50 p-4";

  if (isLoading)
    return (
      <div className={containerClass}>
        <Loader message="Cargando perfil..." />
      </div>
    );
  if (!delivery)
    return (
      <div className={containerClass}>
        <ErrorMessage message="Compañía no encontrada" />
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto mb-6">
        <BackButton />
      </div>
      <DeliveryProfile delivery={delivery} />
    </div>
  );
}
