import React, { useState } from "react";
import { Order } from "../types/order";
import OrderCard from "./OrderCard";

interface Props {
  orders: Order[];
}

export default function OrderList({ orders }: Props) {
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});

  const toggleDetails = (orderId: string) => {
    setShowDetails((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  if (orders.length === 0) {
    return <p className="text-gray-500">No hay órdenes listas para entrega.</p>;
  }

  return (
    <ul className="space-y-8">
      {orders.map((order) => (
        <li key={order.id}>
          <OrderCard
            order={order}
            showDetails={!!showDetails[order.id]}
            toggleDetails={() => toggleDetails(order.id)}
          />
        </li>
      ))}
    </ul>
  );
}
