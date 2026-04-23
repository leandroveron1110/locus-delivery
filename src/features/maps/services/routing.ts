import axios from "axios";
import polyline from "@mapbox/polyline";

const ORS_URL = "https://api.openrouteservice.org/v2/directions/driving-car";

export interface RouteResult {
  distanceKm: number;
  geometry: [number, number][];
}

export async function getFullRoute(points: { lat: number; lng: number }[]): Promise<RouteResult> {
  if (points.length < 2) throw new Error("Se necesitan al menos dos puntos");

  const coordinates = points.map(p => [p.lng, p.lat]);

  const res = await axios.post(
    ORS_URL,
    { coordinates },
    {
      headers: {
        Authorization: process.env.NEXT_PUBLIC_ORS_KEY!,
        "Content-Type": "application/json"
      }
    }
  );

  const route = res.data.routes[0];
  const distanceMeters = route.summary.distance;

  // Decodificamos la polyline a array de [lat, lng]
  const geometry: [number, number][] = polyline.decode(route.geometry) as [number, number][];

  return {
    distanceKm: +(distanceMeters / 1000).toFixed(2),
    geometry
  };
}
