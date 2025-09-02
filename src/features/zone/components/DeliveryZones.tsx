"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import {
  useCreateZone,
  useDeleteZone,
  useDeliveryCompanyZones,
  useUpdateZone,
} from "../hooks/useDeliveries";
import { GeoJsonPolygon, IZone, Zone } from "../types/zone";
// import { ZoneCreatorMap } from '@/features/zone/components/ZoneCreatorMap';

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
  const [_createdZone, setCreatedZone] = useState<IZone | null>(null);
  const { data: deliveries, error } = useDeliveryCompanyZones(companyId);
  const createZoneMutation = useCreateZone();
  const updateZoneMutation = useUpdateZone();
  const deleteZoneMutation = useDeleteZone();

  const handleZoneCreated = async (zone: Zone) => {
    setIsLoading(true);
    setCreatedZone(null);
    try {
      await createZoneMutation.mutateAsync({
        ...zone,
        price: Number(zone.price),
        companyId: companyId,
      });
    } catch (error) {
      console.error("Error al guardar la zona:", error);
      alert("Hubo un error al guardar la zona. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const onZoneEdited = async (zone: Partial<IZone>) => {
    setIsLoading(true);
    setCreatedZone(null);
    try {
      const { geometry, id, ...data } = zone;
      await updateZoneMutation.mutateAsync({
        id: id || "",
        data,
      });
    } catch (error) {
      console.error("Error al guardar la zona:", error);
      alert("Hubo un error al guardar la zona. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const onZoneDeleted = async (zoneId: string)=> {
    setIsLoading(true);
    setCreatedZone(null);
    try {
      await deleteZoneMutation.mutateAsync(zoneId);
    } catch (error) {
      console.error("Error al guardar la zona:", error);
      alert("Hubo un error al guardar la zona. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
<div className="flex flex-col lg:flex-row w-full h-screen">
        <ZoneCreatorMap
          zones={deliveries}
          onZoneCreated={handleZoneCreated}
          onZoneEdited={onZoneEdited}
          onZoneDeleted={onZoneDeleted}
          isLoading={isLoading}
          companyId={companyId}
        />
    </div>
  );
}
