"use client";

import { Package, Map, Settings } from "lucide-react";
import Link from "next/link";

interface Props {
  deliveryId: string
}

export default function DeliveryDashboard({ deliveryId }: Props) {
  return (
    <div className="bg-white p-4 sm:p-6 max-w-7xl mx-auto">

      {/* Contenedor de las tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Órdenes */}
        <Link href={`/deliveries/${deliveryId}/orders`} className="group">
          <div className="bg-slate-50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-700">
              Órdenes
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona los pedidos de la compañía.
            </p>
          </div>
        </Link>

        {/* Zonas */}
        <Link href={`/deliveries/${deliveryId}/zones`} className="group">
          <div className="bg-slate-50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
              <Map className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 group-hover:text-green-700">
              Zonas
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Configura y visualiza las áreas de entrega.
            </p>
          </div>
        </Link>

        {/* Perfil */}
        <Link href={`/deliveries/${deliveryId}/profile`} className="group">
          <div className="bg-slate-50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mb-4">
              <Settings className="w-6 h-6 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 group-hover:text-yellow-700">
              Perfil
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Edita la información de la compañía.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}