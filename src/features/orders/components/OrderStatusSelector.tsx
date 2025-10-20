import React, { useState } from "react";
import { EOrderStatusDelivery } from "../types/order";

const ORDER_STATUS = [
  { value: EOrderStatusDelivery.READY_FOR_DELIVERY_PICKUP, label: "Nuevo Pedido", color: "bg-pink-500" },
  { value: EOrderStatusDelivery.DELIVERY_PENDING, label: "Delivery pendiente", color: "bg-orange-500" },
  { value: EOrderStatusDelivery.DELIVERY_ASSIGNED, label: "Delivery asignado", color: "bg-teal-500" },
  { value: EOrderStatusDelivery.DELIVERY_ACCEPTED, label: "Delivery aceptado", color: "bg-green-600" },
  { value: EOrderStatusDelivery.DELIVERY_REJECTED, label: "Delivery rechazado", color: "bg-red-600" },
  { value: EOrderStatusDelivery.DELIVERY_REASSIGNING, label: "Reasignando delivery", color: "bg-indigo-500" },
  { value: EOrderStatusDelivery.OUT_FOR_PICKUP, label: "Yendo a negocio", color: "bg-blue-600" },
  { value: EOrderStatusDelivery.PICKED_UP, label: "Pedido recogido", color: "bg-purple-600" },
  { value: EOrderStatusDelivery.OUT_FOR_DELIVERY, label: "En camino al cliente", color: "bg-pink-600" },
  { value: EOrderStatusDelivery.DELIVERED, label: "Entregado", color: "bg-green-700" },
  { value: EOrderStatusDelivery.DELIVERY_FAILED, label: "Entrega fallida", color: "bg-red-700" },
  { value: EOrderStatusDelivery.CANCELLED_BY_DELIVERY, label: "Cancelado por delivery", color: "bg-gray-600" },
];

interface Props {
  orderId: string;
  status: EOrderStatusDelivery;
  handleChangeStatus: (orderId: string, value: EOrderStatusDelivery) => void;
}

function OrderStatusSelector({ orderId, status, handleChangeStatus }: Props) {
  const [isChanging, setIsChanging] = useState(false);

  const currentStatus = ORDER_STATUS.find((s) => s.value === status);

  const onChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as EOrderStatusDelivery;
    if (newStatus === status) return;

    setIsChanging(true);
    try {
      await handleChangeStatus(orderId, newStatus);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="mt-2 flex items-center space-x-2">
      {/* Indicador de color */}
      <span
        className={`w-4 h-4 rounded-full ${currentStatus?.color ?? "bg-gray-400"}`}
        title={currentStatus?.label}
      />

      <select
        className={`px-3 py-1 rounded border border-gray-300 text-gray-800 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1`}
        style={{ 
          // Aplicar color dinámico en focus ring:
          outlineColor: currentStatus?.color.replace("bg-", "") 
            ? undefined 
            : undefined,
          boxShadow: `0 0 0 2px var(--tw-ring-color)`,
          '--tw-ring-color': currentStatus ? currentStatus.color.replace("bg-", "") : 'gray'
        } as React.CSSProperties}
        value={status}
        onChange={onChange}
        disabled={isChanging}
        title={currentStatus?.label}
      >
        {ORDER_STATUS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {isChanging && (
        <span className="text-gray-600 text-xs italic select-none">Actualizando...</span>
      )}
    </div>
  );
}

export default OrderStatusSelector;
