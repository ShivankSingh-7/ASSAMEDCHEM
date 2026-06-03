import { toBaseUnit } from "./units";

/**
 * Calculate the price for an order.
 *
 * @param quantity         - The quantity entered by the user
 * @param orderedUnit      - The unit selected by the user (e.g. "kg")
 * @param baseUnit         - The product's base unit (e.g. "kg")
 * @param basePricePerUnit - Price per baseUnit stored in DB
 * @returns { convertedQuantity, calculatedPrice }
 */
export function calculatePrice(
  quantity: number,
  orderedUnit: string,
  baseUnit: string,
  basePricePerUnit: number
): { convertedQuantity: number; calculatedPrice: number } {
  const convertedQuantity = toBaseUnit(quantity, orderedUnit, baseUnit);
  const calculatedPrice = convertedQuantity * basePricePerUnit;
  return {
    convertedQuantity: Number(convertedQuantity.toFixed(6)),
    calculatedPrice: Number(calculatedPrice.toFixed(4)),
  };
}

/**
 * Format a number as Indian Rupees.
 */
export function formatINR(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format price for display with the product's base unit.
 * e.g. baseUnit="kg", basePrice=50 → "₹50.00 / kg"
 */
export function formatDisplayPrice(
  basePrice: number,
  baseUnit: string
): string {
  return `${formatINR(basePrice)} / ${baseUnit}`;
}
