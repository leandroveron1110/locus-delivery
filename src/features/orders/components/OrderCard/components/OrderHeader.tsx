"use client";

import React from "react";
import {
  MapPin,
  Phone,
  User,
  Store,
  Truck,
  DollarSign,
  Info,
  CircleDot,
  ArrowRight,
} from "lucide-react";
import {
  DeliveryType,
  PaymentMethodType,
  OrderStatus,
} from "../../../types/order";
import OrderStatusBadge from "./OrderStatusBadge";

interface Props {
  businessName: string;
  businessAddress: string;
  businessPhone?: string;
  userFullName: string;
  userAddress: string;
  userPhone?: string;
  deliveryType: DeliveryType;
  total?: number;
  status: OrderStatus;
  paymentType: PaymentMethodType;
}

export default function DeliveryOrderHeader({
  businessName,
  businessAddress,
  businessPhone,
  userFullName,
  userAddress,
  userPhone,
  total,
  status,
  paymentType,
}: Props) {
  const businessMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessAddress)}`;
  const userMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(userAddress)}`;

  const isCashPayment =
    paymentType === PaymentMethodType.CASH ||
    paymentType === PaymentMethodType.DELIVERY;

  const getPaymentInfo = (paymentType: PaymentMethodType) => {
    switch (paymentType) {
      case PaymentMethodType.CASH:
        return { icon: <DollarSign className="w-4 h-4 text-green-600" />, text: "Efectivo" };
      case PaymentMethodType.TRANSFER:
        return { icon: <Info className="w-4 h-4 text-blue-600" />, text: "Transferencia" };
      case PaymentMethodType.DELIVERY:
        return { icon: <Truck className="w-4 h-4 text-purple-600" />, text: "Pago al delivery" };
      default:
        return { icon: null, text: "Método de pago no definido" };
    }
  };

  const paymentInfo = getPaymentInfo(paymentType);

  return (
    <div className="flex flex-col gap-4 bg-white rounded-xl ">
      {/* Sección principal: Total y Estado */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex flex-col">
          <p className="font-bold text-lg text-gray-900 leading-tight">
            {isCashPayment && total ? `$${total.toFixed(2)}` : "---"}
          </p>
          <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
            {paymentInfo.icon}
            <span>{paymentInfo.text}</span>
          </div>
        </div>
        <OrderStatusBadge status={status} />
      </div>

      <hr className="border-t border-dashed border-gray-200" />

      {/* Sección de Origen y Destino */}
      <div className="flex flex-col gap-4">
        {/* Origen */}
        <div className="flex flex-col gap-2">
          <h3 className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
            <Store className="w-4 h-4 text-gray-500" />
            Origen
          </h3>
          <div className="flex flex-col gap-1 text-gray-600 pl-6">
            <p className="flex items-center gap-2 text-sm">
              <span className="font-medium">{businessName}</span>
              {businessPhone && (
                <a href={`tel:${businessPhone}`} className="hover:underline text-blue-600">
                  <Phone className="w-3 h-3 inline-block mr-1" />
                  Llamar
                </a>
              )}
            </p>
            <a
              href={businessMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-blue-600 hover:underline truncate"
              title={businessAddress}
            >
              <MapPin className="w-3 h-3" />
              {businessAddress}
            </a>
          </div>
        </div>

        {/* Separador visual para la ruta */}
        <div className="flex items-center justify-center text-gray-400">
          {/* <ArrowRight className="w-5 h-5" /> */}
        </div>

        {/* Destino */}
        <div className="flex flex-col gap-2">
          <h3 className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
            <Truck className="w-4 h-4 text-gray-500" />
            Destino
          </h3>
          <div className="flex flex-col gap-1 text-gray-600 pl-6">
            <p className="flex items-center gap-2 text-sm">
              <span className="font-medium">{userFullName}</span>
              {userPhone && (
                <a href={`tel:${userPhone}`} className="hover:underline text-blue-600">
                  <Phone className="w-3 h-3 inline-block mr-1" />
                  Llamar
                </a>
              )}
            </p>
            <a
              href={userMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-blue-600 hover:underline truncate"
              title={userAddress}
            >
              <MapPin className="w-3 h-3" />
              {userAddress}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}