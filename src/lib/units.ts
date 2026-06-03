// ─── Unit System ─────────────────────────────────────────────────────────────
// Products can have any supported unit as their base unit.
// Price is stored as "price per baseUnit".
// When ordering, we convert the ordered quantity into baseUnit quantity,
// then multiply by basePrice.
//
// Conversion: toBaseUnit(qty, orderedUnit, baseUnit)
//   e.g. ordered 500 g, baseUnit = kg → 500 × (1/1000) = 0.5 kg → 0.5 × pricePerKg

// ─── Conversion factors (relative to category anchor) ───────────────────────
// Weight anchor = 1 mg
export const WEIGHT_FACTORS: Record<string, number> = {
  mg: 1,
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
 * Convert a quantity from orderedUnit into baseUnit.
 * e.g. toBaseUnit(500, "g", "kg") → 0.5
 *      toBaseUnit(2, "L", "mL")  → 2000
 *      toBaseUnit(1, "dozen", "dozen") → 1
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

  // Cross-category conversions don't make sense — just return as-is
  if (cat !== orderedCat) return quantity;

  // Count units that have different factors (dozen, gross) still work:
  // e.g. base=unit(1), ordered=dozen(12) → 12 × 12/1 = 144? No.
  // The factor is "how many anchor units = 1 of this unit"
  // Convert: qty ordered × orderedFactor / baseFactor
  return (quantity * orderedFactor) / baseFactor;
}

/**
 * Returns all units in the same category as baseUnit,
 * allowing a buyer to order in any compatible unit.
 */
export function getAvailableUnits(baseUnit: string): string[] {
  const cat = getUnitCategory(baseUnit);
  if (cat === "weight") return Object.keys(WEIGHT_FACTORS);
  if (cat === "volume") return Object.keys(VOLUME_FACTORS);
  // For count — only the same unit (tablet orders in tablets, not in dozens etc.)
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
 * e.g. "kg" → "per kg", "tablet" → "per tablet"
 */
export function perUnitLabel(unit: string): string {
  return `per ${unit}`;
}
