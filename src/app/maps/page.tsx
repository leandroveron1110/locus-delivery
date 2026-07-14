import dynamic from "next/dynamic";

const DeliveryMap = dynamic(
  () => import("@/features/maps/components/DeliveryMap"),
  {
    ssr: false,
  }
);

export default function MapPage() {
  return <DeliveryMap />;
}