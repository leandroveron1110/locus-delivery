// hooks/useDeliveryOrdersSocket.ts
import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useDeliveryOrdersStore } from "../stores/useDeliveryOrdersStore";
import { Order } from "../types/order"; // Asumimos que Order es la interfaz completa

export function useDeliveryOrdersSocket(deliveryId: string | null) {
  const addOrder = useDeliveryOrdersStore((s) => s.addOrder);
  const updateOrderStatus = useDeliveryOrdersStore((s) => s.updateOrderStatus);

  useEffect(() => {
    if (!deliveryId) return;

    const socket: Socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      // 1. Unirse a la sala del delivery
      socket.emit("join_role", { role: "delivery", id: deliveryId });
    });

    // 2. Listener para nueva orden asignada (cuando el negocio la asigna)
    socket.on("newOrderAssigned", (order: Order) => {
      addOrder(order);
    });

    // 3. Listener para actualización de datos de la orden
    // Esto capta el cambio de estado a READY_FOR_DELIVERY_PICKUP
    socket.on("order_ready_for_delivery", (order: { orderId: string; status: string }) => {
      // Si la orden ya existe, la actualiza. Si no existe (raro), la añade.
      // Para el caso READY_FOR_DELIVERY_PICKUP, se actualiza el estado.
      updateOrderStatus(order.orderId, order.status);

      // Si su 'updateOrderStatus' solo actualiza el status, pero necesita
      // añadir la orden completa si no existe, la lógica sería:
      // addOrder(order); // Esto reemplaza o añade la orden completa
    });


    // 4. Listener para cambios de estado genéricos
    // Aunque 'order_data_updated' es más robusto, mantenemos este por si se usa en otros flujos.
    socket.on(
      "order_status_updated",
      (data: { orderId: string; status: string }) => {
        updateOrderStatus(data.orderId, data.status);
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [deliveryId, addOrder, updateOrderStatus]); // Dependencias: deliveryId es clave
}
