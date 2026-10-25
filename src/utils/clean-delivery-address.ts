const REDUNDANT_LOCATION_PARTS = [
  /^concepción\s+del\s+uruguay$/i,
  /^concepcion\s+del\s+uruguay$/i,
  /^entre\s+ríos$/i,
  /^entre\s+rios$/i,
  /^uruguay$/i,
];

export function cleanDeliveryAddress(
  value?: string | null,
  fallback = 'Sin dirección',
): string {
  if (!value?.trim()) {
    return fallback;
  }

  const parts = value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  // Quitar únicamente componentes que sean ubicaciones completas.
  const cleanedParts = parts.filter(
    (part) =>
      !REDUNDANT_LOCATION_PARTS.some((pattern) => pattern.test(part)),
  );

  return cleanedParts.join(', ') || fallback;
}