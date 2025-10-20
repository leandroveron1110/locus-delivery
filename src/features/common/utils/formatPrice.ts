export const formatPrice = (value: string | number | undefined, currencyMask = "$"): string => {
  const numValue = Number(value) || 0;
  return `${currencyMask} ${numValue.toLocaleString("es-AR")}`;
};