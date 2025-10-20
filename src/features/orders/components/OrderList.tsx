import React, { useState } from "react";
import { Order } from "../types/order";
import OrderCard from "./OrderCard/OrderCard";

interface Props {
  orders: Order[];
}

export default function OrderList({ orders }: Props) {
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>(
    {}
  );

  const toggleDetails = (orderId: string) => {
    setShowDetails((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  if (orders.length === 0) {
    return <p className="text-gray-500">No hay órdenes listas para entrega.</p>;
  }

  return (
    <div className="w-full bg-gray-100">
      <div className="grid grid-cols-1 p-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        {orders.map((order) => (
          <OrderCard order={order} />
        ))}
      </div>
    </div>
  );
}
