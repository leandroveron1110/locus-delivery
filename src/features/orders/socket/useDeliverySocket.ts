import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useDeliveryOrdersStore } from "../stores/useDeliveryOrdersStore";
import { Order } from "../types/order";

export function useDeliveryOrdersSocket(deliveryId: string | null) {
  const addOrder = useDeliveryOrdersStore((s) => s.addOrder);
  const updateOrderStatus = useDeliveryOrdersStore((s) => s.updateOrderStatus);

  useEffect(() => {
    if(!deliveryId) return;
    const socket: Socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Conectado al socket como delivery", socket.id);
      socket.emit("join_role", { role: "delivery", id: deliveryId});
    });

    socket.on(
      "newOrderAssigned",
      (data: Order) => {
        console.log("Orden lista para delivery:", data);

        addOrder(data);
      }
    );

    socket.on(
      "order_status_updated",
      (data: { orderId: string; status: string }) => {
        console.log("Estado de orden actualizado:", data);
        updateOrderStatus(data.orderId, data.status);
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [addOrder, updateOrderStatus]);
}
