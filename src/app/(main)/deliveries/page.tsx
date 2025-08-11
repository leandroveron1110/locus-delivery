"use client";

import { useAuthStore } from "@/features/auth/store/authStore";
import DeliveryCard from "@/features/delivery/components/DeliveryCard";
import { useDeliveries } from "@/features/delivery/hooks/useDeliveries";


export default function DeliveriesPage() {
  const { data: deliveries, isLoading, error } = useDeliveries();

  if (isLoading) return <p>Cargando deliveries...</p>;
  if (error) return <p>Error al cargar deliveries</p>;

  if (!deliveries?.length) return <p>No hay deliveries para mostrar.</p>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Tus Compañías de Delivery</h1>
      {deliveries.map((delivery: any) => (
        <DeliveryCard key={delivery.id} delivery={delivery} />
      ))}
    </div>
  );
}
