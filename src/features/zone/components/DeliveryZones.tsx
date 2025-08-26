'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
// import { ZoneCreatorMap } from '@/features/zone/components/ZoneCreatorMap';

const ZoneCreatorMap = dynamic(
  () => import('@/features/zone/components/ZoneCreatorMap').then(mod => mod.ZoneCreatorMap),
  { ssr: false }
);

type GeoJsonPolygon = {
  type: 'Polygon';
  coordinates: number[][][];
};

type z = {
  name: string;
  price: number;
  geometry: GeoJsonPolygon;
};



export default function DeliveryZones() {
  const [isLoading, setIsLoading] = useState(false);
  const [createdZone, setCreatedZone] = useState<z | null>(null);

  const handleZoneCreated = async (zone: z) => {
    setIsLoading(true);
    setCreatedZone(null);

    console.log('Datos de la zona listos para ser enviados al back-end:', zone);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCreatedZone(zone);
    } catch (error) {
      console.error('Error al guardar la zona:', error);
      alert('Hubo un error al guardar la zona. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
        Gestión de Zonas de Envío
      </h1>

      <ZoneCreatorMap onZoneCreated={handleZoneCreated} isLoading={isLoading} />

      {createdZone && (
        <div className="mt-8 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md shadow-inner">
          <h3 className="font-semibold text-lg">Zona Creada:</h3>
          <p><strong>Nombre:</strong> {createdZone.name}</p>
          <p><strong>Precio:</strong> ${createdZone.price}</p>
          <p className="mt-2">Se envió la siguiente geometría GeoJSON al servidor:</p>
          <pre className="mt-2 text-sm bg-green-200 p-2 rounded-md overflow-auto">
            {JSON.stringify(createdZone.geometry, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
