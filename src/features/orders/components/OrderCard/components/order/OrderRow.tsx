"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, DollarSign, CreditCard } from "lucide-react";
import { Order, PaymentMethodType } from "@/features/orders/types/order";
import { formatPrice } from "@/features/common/utils/formatPrice";
import OrderStatusBadge from "../OrderStatusBadge";
import OrderCard from "../../OrderCard";

interface Props {
  order: Order;
}

const shortId = (id: string) => `#${id.slice(0, 6).toUpperCase()}`;

export default function OrderRow({ order }: Props) {
  const [open, setOpen] = useState(false);

  const paymentIcon =
    order.orderPaymentMethod === PaymentMethodType.CASH ? (
      <DollarSign className="w-4 h-4 text-green-600" />
    ) : (
      <CreditCard className="w-4 h-4 text-blue-600" />
    );

  return (
    <>
      {/* Row */}
      <div
        onClick={() => setOpen(!open)}
        className="grid grid-cols-12 gap-2 px-4 py-3 items-center cursor-pointer hover:bg-gray-50 transition"
      >
        <div className="col-span-2 font-mono text-sm text-gray-700">
          {shortId(order.id)}
        </div>

        <div className="col-span-3 text-sm font-medium text-gray-800 truncate">
          {order.user.fullName}
        </div>

        <div className="col-span-2 flex items-center gap-1 text-sm">
          {paymentIcon}
          {order.orderPaymentMethod}
        </div>

        <div className="col-span-2 text-right font-semibold">
          {formatPrice(order.total)}
        </div>

        <div className="col-span-2">
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="col-span-1 flex justify-end">
          {open ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="bg-gray-50 px-4 py-4">
          <OrderCard order={order} />
        </div>
      )}
    </>
  );
}
