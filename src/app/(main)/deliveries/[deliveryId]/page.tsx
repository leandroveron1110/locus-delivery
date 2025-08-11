"use client";

import { useDeliveryOrdersSocket } from "@/features/orders/socket/useDeliverySocket";
import { useDeliveryOrdersStore } from "@/features/orders/stores/useDeliveryOrdersStore";
import { useFetchDeliveryOrders } from "@/features/orders/stores/useFetchDeliveryOrders";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

enum OrderStatusText {
  PENDING = "Pendiente",
  CONFIRMED = "Confirmada",
  IN_DELIVERY = "En reparto",
  DELIVERED = "Entregada",
  CANCELLED = "Cancelada",
}

// Tipado para evitar errores, asumiendo la interface Order que enviaste
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarId?: string | null;
}

interface Address {
  id: string;
  street: string;
  number?: string | null;
  apartment?: string | null;
  city: string;
  province: string;
  country: string;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isDefault: boolean;
  enabled: boolean;
  notes?: string | null;
}

interface OrderOption {
  id: string;
  opcionId?: string | null;
  optionName: string;
  priceFinal: number;
  priceWithoutTaxes: number;
  taxesAmount: number;
  priceModifierType: string;
  quantity: number;
}

interface OrderOptionGroup {
  id: string;
  opcionGrupoId?: string | null;
  groupName: string;
  minQuantity: number;
  maxQuantity: number;
  quantityType: string;
  options: OrderOption[];
}

interface OrderItem {
  id: string;
  productName: string;
  productDescription?: string | null;
  productImageUrl?: string | null;
  quantity: number;
  priceAtPurchase: number;
  notes?: string | null;
  optionGroups: OrderOptionGroup[];
}

interface Order {
  id: string;
  businessId: string;
  status: string;
  origin: string;
  isTest: boolean;
  total: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  pickupAddress?: Address | null;
  deliveryAddress?: Address | null;
  items: OrderItem[];
  discounts: any[];
  shippingFee?: number; // Agregué por si usás
}

export default function DeliveryOrdersPage() {
  const { deliveryId } = useParams<{ deliveryId: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});

  useFetchDeliveryOrders(deliveryId);
  useDeliveryOrdersSocket(deliveryId);

  const orders = useDeliveryOrdersStore((s) => s.orders);

  useEffect(() => {
    if (orders.length >= 0) {
      setLoading(false);
    }
  }, [orders]);

  const toggleDetails = (orderId: string) => {
    setShowDetails((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  if (loading)
    return (
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Órdenes para entregar</h1>
        <p>Cargando órdenes...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-red-600">
        <h1 className="text-2xl font-semibold mb-4">Órdenes para entregar</h1>
        <p>Error: {error}</p>
      </div>
    );

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Órdenes para entregar</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">No hay órdenes listas para entrega.</p>
      ) : (
        <ul className="space-y-8">
          {orders.map((order) => {
            const subtotal = order.total;

            return (
              <li
                key={order.id}
                className="p-5 border rounded-lg shadow hover:shadow-lg transition bg-white"
              >
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold">Orden #{order.id}</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      order.status === "CANCELLED"
                        ? "bg-red-200 text-red-800"
                        : order.status === "DELIVERED"
                        ? "bg-green-200 text-green-800"
                        : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {OrderStatusText[order.status as keyof typeof OrderStatusText] ??
                      order.status}
                  </span>
                </div>

                {/* Direcciones */}
                <div className="mb-4 space-y-2 text-sm">
                  <p>
                    <strong>Retiro:</strong>{" "}
                    {order.pickupAddress
                      ? `${order.pickupAddress.street}${
                          order.pickupAddress.number
                            ? ` ${order.pickupAddress.number}`
                            : ""
                        }${order.pickupAddress.apartment ? `, ${order.pickupAddress.apartment}` : ""}, ${
                          order.pickupAddress.city
                        }, ${order.pickupAddress.province}`
                      : order.businessId}
                  </p>
                  <p>
                    <strong>Entrega:</strong>{" "}
                    {order.deliveryAddress
                      ? `${order.deliveryAddress.street}${
                          order.deliveryAddress.number
                            ? ` ${order.deliveryAddress.number}`
                            : ""
                        }${order.deliveryAddress.apartment ? `, ${order.deliveryAddress.apartment}` : ""}, ${
                          order.deliveryAddress.city
                        }, ${order.deliveryAddress.province}`
                      : "No especificada"}
                  </p>
                  <p>
                    <strong>Cliente:</strong> {order.user.firstName}{" "}
                    {order.user.lastName} -{" "}
                    <a
                      href={`mailto:${order.user.email}`}
                      className="text-blue-600 underline"
                    >
                      {order.user.email}
                    </a>
                  </p>
                </div>

                {/* Notas */}
                {order.notes && (
                  <p className="mb-4 italic text-gray-600">
                    Nota: {order.notes}
                  </p>
                )}

                {/* Toggle para detalles de productos */}
                <button
                  onClick={() => toggleDetails(order.id)}
                  className="mb-4 text-blue-600 hover:underline text-sm font-medium"
                >
                  {showDetails[order.id] ? "Ocultar detalles" : "Ver detalles"}
                </button>

                {showDetails[order.id] && (
                  <div className="mb-4">
                    <strong>Items:</strong>
                    <ul className="ml-4 list-disc text-sm text-gray-700">
                      {order.items.map((item) => (
                        <li key={item.id} className="mb-2">
                          <p>
                            {item.productName} x{item.quantity} -{" "}
                            <span className="font-semibold">
                              ${item.priceAtPurchase.toFixed(2)}
                            </span>
                          </p>
                          {item.optionGroups.length > 0 && (
                            <ul className="ml-5 list-disc">
                              {item.optionGroups.map((group) => (
                                <li key={group.id}>
                                  <strong>{group.groupName}:</strong>
                                  <ul className="ml-4 list-disc">
                                    {group.options.map((opt) => (
                                      <li key={opt.id}>
                                        {opt.optionName} x{opt.quantity} - $
                                        {opt.priceFinal.toFixed(2)}
                                      </li>
                                    ))}
                                  </ul>
                                </li>
                              ))}
                            </ul>
                          )}
                          {item.notes && (
                            <p className="italic text-gray-600">
                              Nota: {item.notes}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Totales claros */}
                <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Envío:</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xl mt-1">
                  <span>Total a cobrar:</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
