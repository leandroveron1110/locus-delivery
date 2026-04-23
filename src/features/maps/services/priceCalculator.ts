import pricing from "../config/pricing.config.json";

interface SegmentBreakdown {
  fromKm: number;
  toKm: number | null;
  kmCharged: number;
  pricePerKm: number;
  subtotal: number;
}

export interface PriceResult {
  totalKm: number;
  basePrice: number;
  totalPrice: number;
  breakdown: SegmentBreakdown[];
}

export function calculatePrice(totalKm: number): PriceResult {
  // Asignamos el precio base de la tarifa
  let totalPrice = pricing.base.price;

  // Calculamos los kilómetros que exceden lo cubierto por la tarifa base
  let remainingKm = Math.max(totalKm - pricing.base.maxKm, 0);

  const breakdown: SegmentBreakdown[] = [];

  // Recorremos los segmentos de precio por kilómetro
  for (const segment of pricing.segments) {

    // Si no quedan kilómetros por cobrar, salimos del bucle
    if (remainingKm <= 0) break;

    // Calculamos cuántos kilómetros se cobran en este segmento
    const segmentKm =
      segment.toKm === null
        ? remainingKm
        : Math.min(remainingKm, segment.toKm - segment.fromKm);

    // Si este segmento no aporta kilómetros cobrables, lo ignoramos
    if (segmentKm <= 0) continue;

    // Calculamos el subtotal del segmento
    const subtotal = segmentKm * segment.pricePerKm;

    // Guardamos el desglose de este segmento
    breakdown.push({
      fromKm: segment.fromKm,
      toKm: segment.toKm,
      kmCharged: +segmentKm.toFixed(2),
      pricePerKm: segment.pricePerKm,
      subtotal
    });

    // Sumamos el subtotal al precio total
    totalPrice += subtotal;

    // Restamos los kilómetros ya cobrados
    remainingKm -= segmentKm;
  }

  // Retornamos el resultado final
  return {
    totalKm: +totalKm.toFixed(2),
    basePrice: pricing.base.price,
    totalPrice: Math.round(totalPrice),
    breakdown
  };
}

