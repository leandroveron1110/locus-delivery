"use client";

import { useAuthStore } from "@/features/auth/store/authStore";
import EmptyState from "@/features/common/ui/EmptyState/EmptyState";
import ErrorMessage from "@/features/common/ui/ErrorMessage/ErrorMessage";
import Loader from "@/features/common/ui/Loader/Loader";
import DeliveryCard from "@/features/delivery/components/DeliveryCard";
import { useDeliveries } from "@/features/delivery/hooks/useDeliveries";

export default function DeliveriesPage() {
  const userId = useAuthStore(s => s.user?.id);
  const { data: deliveries, isLoading, error } = useDeliveries(userId);

  if (isLoading) return <Loader message="Cargando deliveries..." />;
  if (error) return <ErrorMessage message="Error al cargar deliveries" />;
  if (!deliveries?.length) return <EmptyState message="No hay deliveries para mostrar." />;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Tus Compañías de Delivery</h1>
      {deliveries.map((delivery) => (
        <DeliveryCard key={delivery.id} delivery={{
          id: delivery.id,
          isActive: delivery.isActive,
          name: delivery.name,
          phone: delivery.phone,
        }} />
      ))}
    </div>
  );
}
