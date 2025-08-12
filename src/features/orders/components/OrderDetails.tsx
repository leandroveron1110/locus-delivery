import React from "react";
import { OrderItem } from "../types/order";

interface Props {
  items: OrderItem[];
}

export default function OrderDetails({ items }: Props) {
  return (
    <div className="mb-4">
      <strong>Items:</strong>
      <ul className="ml-4 list-disc text-sm text-gray-700">
        {items.map((item) => (
          <li key={item.id} className="mb-2">
            <p>
              {item.productName} x{item.quantity} -{" "}
              <span className="font-semibold">${item.priceAtPurchase.toFixed(2)}</span>
            </p>
            {item.optionGroups.length > 0 && (
              <ul className="ml-5 list-disc">
                {item.optionGroups.map((group) => (
                  <li key={group.id}>
                    <strong>{group.groupName}:</strong>
                    <ul className="ml-4 list-disc">
                      {group.options.map((opt) => (
                        <li key={opt.id}>
                          {opt.optionName} x{opt.quantity} - ${opt.priceFinal.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
            {item.notes && <p className="italic text-gray-600">Nota: {item.notes}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
