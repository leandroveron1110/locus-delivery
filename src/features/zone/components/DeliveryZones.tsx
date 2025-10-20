"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import {
  useCreateZone,
  useDeleteZone,
  useDeliveryCompanyZones,
  useUpdateZone,
} from "../hooks/useDeliveries";
import { IZone, Zone } from "../types/zone";
import Loader from "@/features/common/ui/Loader/Loader";

const ZoneCreatorMap = dynamic(
  () =>
    import("@/features/zone/components/ZoneCreatorMap").then(
      (mod) => mod.ZoneCreatorMap
    ),
  { ssr: false }
);
interface DeliveryZonesProps {
  companyId: string;
}
export default function DeliveryZones({ companyId }: DeliveryZonesProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Traemos las zonas de la compañía
  const {
    data: zones,
    error,
    isLoading: zonesLoading,
  } = useDeliveryCompanyZones(companyId);

  const createZoneMutation = useCreateZone();
  const updateZoneMutation = useUpdateZone();
  const deleteZoneMutation = useDeleteZone();

  if (zonesLoading) return <Loader message="Cargando zonas..." />;
  if (error)
    return (
      <div className="text-center text-red-600">Error al cargar zonas</div>
    );

  const handleZoneCreated = async (zone: Zone) => {
    setIsLoading(true);
    try {
      await createZoneMutation.mutateAsync({
        ...zone,
        price: Number(zone.price),
        companyId,
      });
    } catch (err) {
      console.error("Error al guardar la zona:", err);
      alert("Hubo un error al guardar la zona. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const onZoneEdited = async (zone: Partial<IZone>) => {
    setIsLoading(true);
    try {
      const { id, ...data } = zone;
      if (!id) return;
      await updateZoneMutation.mutateAsync({ id, data });
    } catch (err) {
      console.error("Error al editar la zona:", err);
      alert("Hubo un error al guardar la zona. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const onZoneDeleted = async (zoneId: string) => {
    setIsLoading(true);
    try {
      await deleteZoneMutation.mutateAsync(zoneId);
    } catch (err) {
      console.error("Error al eliminar la zona:", err);
      alert("Hubo un error al eliminar la zona. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-screen">
      <ZoneCreatorMap
        zones={zones ? zones : undefined}
        onZoneCreated={handleZoneCreated}
        onZoneEdited={onZoneEdited}
        onZoneDeleted={onZoneDeleted}
        isLoading={isLoading}
        companyId={companyId}
      />
    </div>
  );
}
