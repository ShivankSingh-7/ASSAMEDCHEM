# ASSAMEDCHAM B2B Marketplace

Welcome to the **ASSAMEDCHAM B2B Platform** — a production-ready Pharmaceutical Business-to-Business marketplace built for the hackathon.

It is a highly specialized supply chain platform where chemical and medical suppliers can list bulk pharmaceutical products, platform administrators can verify and approve those products, and clinics/buyers can purchase them using strictly calculated medical units.

---

## The Core B2B Workflow

The application operates on a strict, 4-step professional workflow:

1. **Sellers List Products:** A Seller logs in and submits a new product they wish to sell — for example, a batch of 500 kg of an Active Pharmaceutical Ingredient.
2. **Admins Enforce Quality Control:** Products do not go live automatically. An Administrator reviews each submission and either approves or rejects it with a note. Once approved, the product is published to the public catalog.
3. **Buyers Browse & Request Quotations:** A Buyer (clinic, pharmacy, distributor) browses the catalog, adds items to their cart, and submits a formal Quotation request. Even if the seller listed the product in bulk **Kilograms**, the buyer can order in **Milligrams** — the system handles all conversions automatically.
4. **Sellers Fulfill Orders:** The Seller receives the quotation on their dashboard. Once approved, the system automatically deducts the exact stock amount from the database. If inventory hits zero, the product is automatically unlisted to prevent backorders.

---

## The Unit Conversion Engine

Because pharmaceutical measurements must be exact, this platform features a robust Unit Conversion Engine built in [`src/lib/units.ts`](src/lib/units.ts) that separates **inventory storage** from **pricing** — keeping both perfectly accurate.

### Supported Units

| Category | Units Available | Anchor (Storage) Unit |
|---|---|---|
| Weight | `mg`, `g`, `kg` | `mg` (milligram) |
| Volume | `mL`, `L` | `mL` (millilitre) |
| Count | `unit` | `unit` |

---

### How Inventory is Stored

To prevent mathematical drift, inventory is **always stored in the category's anchor unit**, regardless of what the seller enters.

| Seller Enters | Stored As |
|---|---|
| 500 kg | 500,000,000 mg |
| 2 L | 2,000 mL |
| 100 unit | 100 unit |

This means a seller can list a product in `kg` but a buyer can order in `mg` — and the deduction from inventory is always mathematically exact.

The `inventoryQuantity` column holds the raw anchor-unit value. The `inventoryUnit` column records which anchor is being used (`mg`, `mL`, or `unit`).

---

### How Pricing is Stored

Price is kept **separate from inventory**. It is always stored as **₹ per seller's chosen base unit**.

- Seller lists at ₹5,000 per `kg` → stored as `price = 5000`, `baseUnit = "kg"`
- When a buyer orders 500 mg, the system converts: `500 mg → 0.0005 kg`, then calculates `0.0005 × 5000 = ₹2.50`

This makes pricing human-readable while keeping inventory in precise anchor units.

---

### The Conversion Math

All conversion logic lives in `src/lib/units.ts`:

**Conversion Factors (relative to anchor):**
```
mg  = 1      (anchor)
g   = 1,000
kg  = 1,000,000

mL  = 1      (anchor)
L   = 1,000

unit = 1     (anchor)
```

**`convertToAnchorUnit(quantity, unit)`**
Converts a seller's input into the anchor unit before saving:
```
500 kg  → 500 × 1,000,000 = 500,000,000 mg
2.5 L   → 2.5 × 1,000     = 2,500 mL
```
Uses `Math.round()` to eliminate any floating-point drift.

**`convertFromAnchorUnit(quantity, anchorUnit, targetUnit)`**
Converts stored anchor values back for display:
```
5,000,000 mg → 5,000,000 ÷ 1,000,000 = 5 kg
2,000 mL     → 2,000 ÷ 1,000         = 2 L
```
Uses `parseFloat(result.toPrecision(10))` to strip floating-point noise (e.g. `4.9999...` → `5`).

**`toBaseUnit(quantity, orderedUnit, baseUnit)`**
Used during quotation pricing — converts an ordered quantity into the seller's base unit for price calculation:
```
500 mg ordered, baseUnit = kg → 500 ÷ 1,000,000 = 0.0005 kg → × ₹5,000 = ₹2.50
```

---

### Full Example: End-to-End

| Step | Action | Value |
|---|---|---|
| Seller lists | 500 kg at ₹5,000/kg | `inventoryQuantity = 500,000,000 mg`, `price = 5000`, `baseUnit = "kg"` |
| Buyer orders | 250 g | `convertedQuantity = 0.25 kg`, `calculatedPrice = ₹1,250` |
| Order approved | Stock deducted | `500,000,000 − 250,000 = 499,750,000 mg` remaining |
| Display | Shown to seller | `499,750,000 ÷ 1,000,000 = 499.75 kg` |

---

## Database Schema

Key fields in the `Product` and `ProductListing` models:

| Field | Type | Purpose |
|---|---|---|
| `price` | `Decimal(20,4)` | Price per `baseUnit` |
| `baseUnit` | `String` | The unit the seller priced in (`kg`, `L`, `unit`) |
| `inventoryQuantity` | `Decimal(20,4)` | Stock stored in anchor unit |
| `inventoryUnit` | `String` | Always `mg`, `mL`, or `unit` |

> `Decimal(20,4)` supports up to 16 digits before the decimal — enough for quantities like 500,000,000,000 mg (500 metric tonnes).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React |
| Styling | Vanilla CSS — Medical Blue theme |
| Backend | Next.js API Routes (serverless) |
| Database | PostgreSQL on Neon via Prisma ORM |
| Auth | NextAuth.js with Role-Based Access Control |
| Deployment | Vercel |

---

## Live Demo

🔗 **[https://assamedchem-virid.vercel.app/](https://assamedchem-virid.vercel.app/)**

---
