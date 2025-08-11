import React from 'react';
import { useDeliverySocket } from '../socket/useDeliverySocket';

export default function DeliveryDashboard() {
  const { connected, ordersReadyForDelivery } = useDeliverySocket('delivery-1');

  return (
    <div>
      <h1>Delivery Dashboard</h1>
      <p>Status socket: {connected ? 'Conectado' : 'Desconectado'}</p>
      <h2>Órdenes listas para delivery:</h2>
      <ul>
        {ordersReadyForDelivery.map(({ orderId, businessId }, i) => (
          <li key={i}>
            Orden <strong>{orderId}</strong> del negocio <strong>{businessId}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
