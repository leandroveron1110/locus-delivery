import L from "leaflet";

export function getDistanceKm(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
) {
  const meters = L.latLng(from.lat, from.lng).distanceTo(
    L.latLng(to.lat, to.lng)
  );

  return +(meters / 1000).toFixed(2);
}
