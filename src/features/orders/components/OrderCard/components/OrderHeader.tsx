"use client";

import React, { useState } from "react";
import {
  MapPin,
  Store,
  Truck,
  DollarSign,
  Info,
  Copy,
  Package,
  CreditCard,
  Check,
} from "lucide-react";
import {
  DeliveryType,
  PaymentMethodType,
  OrderStatus,
} from "../../../types/order";
import OrderStatusBadge from "./OrderStatusBadge";
import { formatPrice } from "@/features/common/utils/formatPrice";

interface Props {
  orderId: string;
  businessName: string;
  businessAddress: string;
  businessPhone?: string;
  businessObservations?: string;
  userFullName: string;
  userAddress: string;
  userPhone?: string;
  customerObservations: string;
  deliveryType: DeliveryType;
  priceDeliveryTotal?: string;
  priceOrderTotal?: string;
  status: OrderStatus;
  paymentType: PaymentMethodType;
}

const getPaymentInfo = (paymentType: PaymentMethodType) => {
  switch (paymentType) {
    case PaymentMethodType.CASH:
      return {
        icon: <DollarSign className="w-4 h-4 text-green-600" />,
        text: "Efectivo",
        color: "text-green-600",
      };
    case PaymentMethodType.TRANSFER:
      return {
        icon: <CreditCard className="w-4 h-4 text-blue-600" />,
        text: "Transferencia",
        color: "text-blue-600",
      };
    default:
      return {
        icon: <CreditCard className="w-4 h-4 text-gray-500" />,
        text: "Método no definido",
        color: "text-gray-500",
      };
  }
};

const getShortId = (id: string) =>
  id ? `#${id.substring(0, 8).toUpperCase()}` : "";

export default function DeliveryOrderHeader({
  customerObservations,
  businessObservations,
  orderId,
  priceOrderTotal,
  businessName,
  businessAddress,
  userFullName,
  userAddress,
  priceDeliveryTotal,
  status,
  paymentType,
}: Props) {
  const [copied, setCopied] = useState(false);

  const businessMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    businessAddress
  )}`;
  const userMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    userAddress
  )}`;

  const paymentInfo = getPaymentInfo(paymentType);
  const totalToCharge =
    (Number(priceDeliveryTotal) || 0) + (Number(priceOrderTotal) || 0);

  const infoRowClass =
    "flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0";
  const labelClass = "text-sm text-gray-500 flex items-center gap-1";

  const generateWhatsappMessage = () => {
    const isCash = paymentType === PaymentMethodType.CASH;
    const isTransfer = paymentType === PaymentMethodType.TRANSFER;

    let paymentDetail = "";
    const businessObs = businessObservations?.trim()
      ? `Observaciones: ${businessObservations}`
      : "";
    const customerObs = customerObservations?.trim()
      ? `Observaciones: ${customerObservations}`
      : "";

    if (isCash) {
      paymentDetail = `
Pedido: ${formatPrice(priceOrderTotal)}
Envío: ${formatPrice(priceDeliveryTotal)}
Total a cobrar: *${formatPrice(totalToCharge)}*

El cadete paga el pedido al retirar  
y cobra el total al entregar al cliente.
----------------------------------------`;
    } else if (isTransfer) {
      paymentDetail = `
Envío: ${formatPrice(priceDeliveryTotal)}
Total a cobrar: *${formatPrice(priceDeliveryTotal)}*

El cliente ya pagó el pedido  
(el cadete solo cobra el envío).
----------------------------------------`;
    }

    return `
ORDEN: *${getShortId(orderId)}*
${paymentDetail}
RETIRO  
${businessName.toUpperCase()}  
Dirección: ${businessAddress}  
Mapa: ${businessMapsLink}  
${businessObs}
----------------------------------------
ENTREGA  
${userFullName.toUpperCase()}  
Dirección: ${userAddress}  
Mapa: ${userMapsLink}  
${customerObs}`.trim();
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generateWhatsappMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 pb-5">
      {/* ID, Estado y Pago */}
      <div className="flex justify-between items-start border-b pb-3">
        <div className="flex flex-col">
          <OrderStatusBadge status={status} />
          <div className="flex items-center mt-1">
            <span className="text-xs text-gray-500 font-mono font-semibold select-none">
              {getShortId(orderId)}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(orderId)}
              className="ml-2 flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors"
              title="Copiar ID completo"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div
            className={`flex items-center gap-1 text-sm font-semibold ${paymentInfo.color}`}
          >
            {paymentInfo.icon}
            <span>{paymentInfo.text}</span>
          </div>
        </div>
      </div>

      {/* Precios */}
      <div className="flex flex-col gap-1 p-3 bg-gray-50 rounded-lg">
        <div className={infoRowClass}>
          <p className={labelClass}>
            <Truck className="w-4 h-4 text-gray-400" />
            Precio de Envío
          </p>
          <span className="font-bold text-base text-gray-900">
            {formatPrice(priceDeliveryTotal)}
          </span>
        </div>

        {paymentType === PaymentMethodType.CASH && (
          <>
            <div className={infoRowClass}>
              <p className={labelClass}>
                <Package className="w-4 h-4 text-gray-400" />
                Total del Pedido
              </p>
              <span className="font-bold text-base text-gray-900">
                {formatPrice(priceOrderTotal)}
              </span>
            </div>

            <div className={`${infoRowClass}`}>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <p className="text-green-800 font-semibold text-base">
                  Total a cobrar
                </p>
              </div>
              <span className="font-bold text-xl text-green-700 tracking-tight">
                {formatPrice(totalToCharge)}
              </span>
            </div>
          </>
        )}
      </div>
      {/* Origen y Destino */}
      <div className="flex flex-col gap-2 relative">
        {/* Botón copiar */}
        <button
          onClick={handleCopyMessage}
          className={`self-end text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-sm ${
            copied
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-blue-50 text-blue-700 hover:bg-blue-100"
          }`}
          title="Copiar mensaje para WhatsApp"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copiar mensaje
            </>
          )}
        </button>

        {/* ORIGEN */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-3">
          <h3 className="flex items-center gap-2 font-semibold text-gray-800 text-sm mb-1">
            <Store className="w-4 h-4 text-gray-500" />
            Retiro (Origen)
          </h3>
          <div className="pl-6 flex flex-col gap-1 text-gray-600">
            <p className="text-sm font-medium">{businessName}</p>
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

            {businessObservations?.trim() && (
              <div className="mt-2 pl-2 border-l-2 border-amber-300 bg-amber-50 text-amber-800 text-xs rounded-sm p-1.5 flex items-start gap-1">
                <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                {businessObservations}
              </div>
            )}
          </div>
        </div>

        {/* DESTINO */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-3">
          <h3 className="flex items-center gap-2 font-semibold text-gray-800 text-sm mb-1">
            <Truck className="w-4 h-4 text-gray-500" />
            Entrega (Destino)
          </h3>
          <div className="pl-6 flex flex-col gap-1 text-gray-600">
            <p className="text-sm font-medium">{userFullName}</p>
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

            {customerObservations?.trim() && (
              <div className="mt-2 pl-2 border-l-2 border-amber-300 bg-amber-50 text-amber-800 text-xs rounded-sm p-1.5 flex items-start gap-1">
                <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                {customerObservations}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
