// ─── Unit System ─────────────────────────────────────────────────────────────
// Products can have any supported unit as their base unit.
// Price is stored as "price per baseUnit".
// Inventory is stored purely in the category's anchor unit.
//
// Conversion: toBaseUnit(qty, orderedUnit, baseUnit)
//   e.g. ordered 500 g, baseUnit = kg → 500 × (1000/1000000) = 0.5 kg → 0.5 × pricePerKg

// ─── Conversion factors (relative to category anchor) ───────────────────────
// Weight anchor = 1 mg
export const WEIGHT_FACTORS: Record<string, number> = {
  mg: 1,
  g: 1000,
  kg: 1_000_000,
};

// Volume anchor = 1 mL
export const VOLUME_FACTORS: Record<string, number> = {
  mL: 1,
  L: 1000,
};

// Count — discrete units (factor = how many "base units" 1 of these equals)
export const COUNT_FACTORS: Record<string, number> = {
  unit: 1,
};

// ─── Grouped unit options for forms ─────────────────────────────────────────
export const UNIT_GROUPS = [
  {
    group: "Weight",
    units: [
      { value: "mg", label: "mg — milligram" },
      { value: "g", label: "g — gram" },
      { value: "kg", label: "kg — kilogram" },
    ],
  },
  {
    group: "Volume",
    units: [
      { value: "mL", label: "mL — millilitre" },
      { value: "L", label: "L — litre" },
    ],
  },
  {
    group: "Count",
    units: [
      { value: "unit", label: "unit" },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export type UnitCategory = "weight" | "volume" | "count";

export function getUnitCategory(unit: string): UnitCategory {
  if (unit in WEIGHT_FACTORS) return "weight";
  if (unit in VOLUME_FACTORS) return "volume";
  return "count";
}

function getUnitFactor(unit: string): number {
  return (
    WEIGHT_FACTORS[unit] ??
    VOLUME_FACTORS[unit] ??
    COUNT_FACTORS[unit] ??
    1
  );
}

/**
 * Get the anchor unit for any given unit.
 */
export function getAnchorUnit(unit: string): string {
  const cat = getUnitCategory(unit);
  if (cat === "weight") return "mg";
  if (cat === "volume") return "mL";
  return "unit";
}

/**
 * Convert an arbitrary quantity to its category's anchor unit.
 * e.g. 500 kg -> 500000000 (mg)
 * Always returns a whole number (anchor units don't use fractions).
 */
export function convertToAnchorUnit(quantity: number, unit: string): number {
  // Use Math.round to eliminate floating-point drift
  return Math.round(quantity * getUnitFactor(unit));
}

/**
 * Convert an anchor quantity back to a specific target unit.
 * e.g. 500000000 (mg) -> 500 kg
 *
 * Uses a safe rounding strategy:
 *   - For count/unit (factor = 1): the anchor IS the value, return as-is
 *   - For others: divide then round to 10 significant decimal places
 *     using Number(result.toFixed(10)) which is more stable than toPrecision
 */
export function convertFromAnchorUnit(
  quantity: number,
  anchorUnit: string,
  targetUnit: string
): number {
  const targetFactor = getUnitFactor(targetUnit);
  if (targetFactor === 1) {
    // count (unit) or already in anchor — no division needed, no float risk
    return Math.round(quantity);
  }
  // Divide and round to 10 decimal places to kill floating-point noise
  // e.g. 5000000 / 1000000 = 4.999999... -> toFixed(10) -> 5.0000000000 -> 5
  const raw = quantity / targetFactor;
  return parseFloat(raw.toFixed(10));
}

/**
 * Convert a quantity from orderedUnit into baseUnit.
 * e.g. toBaseUnit(500, "g", "kg") → 0.5
 */
export function toBaseUnit(
  quantity: number,
  orderedUnit: string,
  baseUnit: string
): number {
  const orderedFactor = getUnitFactor(orderedUnit);
  const baseFactor = getUnitFactor(baseUnit);

  const cat = getUnitCategory(baseUnit);
  const orderedCat = getUnitCategory(orderedUnit);

  if (cat !== orderedCat) return quantity;

  return (quantity * orderedFactor) / baseFactor;
}

/**
 * Returns all units in the same category as baseUnit.
 */
export function getAvailableUnits(baseUnit: string): string[] {
  const cat = getUnitCategory(baseUnit);
  if (cat === "weight") return Object.keys(WEIGHT_FACTORS);
  if (cat === "volume") return Object.keys(VOLUME_FACTORS);
  return [baseUnit];
}

/**
 * Format a unit for display.
 */
export function formatUnit(unit: string): string {
  return unit;
}

/**
 * Return the "friendly" per-unit label for pricing display.
 */
export function perUnitLabel(unit: string): string {
  return `per ${unit}`;
}
