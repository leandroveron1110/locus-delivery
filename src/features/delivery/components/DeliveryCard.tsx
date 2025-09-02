import Link from "next/link";

interface Props {
  delivery: {
    id: string;
    name: string;
    phone: string;
    zones: string[];
    isActive: boolean;
  };
}

export default function DeliveryCard({ delivery }: Props) {
  return (
    <div className="border p-4 rounded shadow hover:shadow-md transition cursor-pointer">
      <Link href={`/deliveries/${delivery.id}`}>
        <h2 className="text-lg font-semibold">{delivery.name}</h2>
      </Link>
      <p>Teléfono: {delivery.phone}</p>
      <p>Zonas: {delivery.zones?.join(", ")}</p>
      <p>Estado: {delivery.isActive ? "Activo" : "Inactivo"}</p>
    </div>
  );
}
