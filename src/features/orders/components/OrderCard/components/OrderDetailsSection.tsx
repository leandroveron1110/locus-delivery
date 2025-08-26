// src/components/components/OrderDetailsSection.tsx
"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { OrderItem as OrderItemType } from "../../../types/order";
import OrderItem from "./OrderItem";

interface Props {
  items: OrderItemType[];
}

export default function OrderDetailsSection({ items }: Props) {
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  return (
    <div className="py-4">
      <button
        className="flex items-center justify-between w-full font-semibold text-gray-800 hover:text-gray-600 transition-colors"
        onClick={() => setShowOrderDetails(!showOrderDetails)}
      >
        <span>Detalles del Pedido</span>
        {showOrderDetails ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {showOrderDetails && (
        <div className="mt-2 space-y-2 text-sm text-gray-700 animate-slide-down">
          {items.map((item) => (
            <OrderItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}