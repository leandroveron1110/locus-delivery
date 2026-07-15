"use client";

import dynamic from "next/dynamic";

const DeliveryMap = dynamic(
  () => import("../../features/maps/components/DeliveryMap"),
  {
    ssr: false,
    loading: () => <div>Cargando mapa...</div>,
  }
);

export default function MapClient() {
  return <DeliveryMap />;
}