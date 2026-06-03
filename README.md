# IQM System — Inventory & Quotation Management

A lightweight, production-ready SaaS-style Inventory & Quotation Management System built for a fresher-level hackathon. Clean architecture, accurate pricing, and a polished professional UI.

---

## Project Overview

IQM System allows businesses to manage product inventory and handle quotation requests efficiently. Admins manage products and approve quotations; Sellers browse products, configure quantities with automatic unit conversion, and submit quotation requests.

---

## Features

### Admin
- Login with role-based access
- Create, edit, and delete products
- View all submitted quotations with line-item breakdown
- Update quotation status (Pending → Approved / Rejected)
- Dashboard with key metrics

### Seller / User
- Register and login
- Browse products with search and category filter
- View product details with live price calculator
- Add items to cart with unit selection
- Submit quotation requests
- View quotation history with status tracking

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Authentication | NextAuth.js v5 (Credentials + JWT) |
| ORM | Prisma v7 |
| Database | Neon PostgreSQL |
| Deployment | Vercel |
| Icons | Lucide React |
| Password Hashing | bcryptjs |

---

## Architecture

```
User (Browser)
     ↓
Next.js Frontend (App Router Pages)
     ↓
Next.js API Routes (/api/*)
     ↓
Prisma ORM (via @prisma/adapter-pg)
     ↓
Neon PostgreSQL (Serverless)
```

---

## Database Schema

```prisma
model User {
  id         String      @id @default(cuid())
  name       String
  email      String      @unique
  password   String      // bcrypt hashed
  role       Role        @default(SELLER)
  createdAt  DateTime    @default(now())
  quotations Quotation[]
}

model Product {
  id             String    @id @default(cuid())
  name           String
  sku            String    @unique
  category       String
  description    String?
  baseUnit       String    // "g" | "mL" | "unit"
  basePrice      Decimal   @db.Decimal(12, 4)  // price per base unit
  stockQuantity  Decimal   @db.Decimal(12, 4)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model Quotation {
  id          String          @id @default(cuid())
  userId      String
  totalAmount Decimal         @db.Decimal(12, 4)
  status      QuotationStatus @default(PENDING)
  createdAt   DateTime        @default(now())
}

model QuotationItem {
  id                String  @id @default(cuid())
  quotationId       String
  productId         String
  orderedQuantity   Decimal @db.Decimal(12, 4)
  orderedUnit       String
  convertedQuantity Decimal @db.Decimal(12, 4)  // in baseUnit
  calculatedPrice   Decimal @db.Decimal(12, 4)
}

enum Role { ADMIN  SELLER }
enum QuotationStatus { PENDING  APPROVED  REJECTED }
```

### Why `Decimal(12, 4)`?
PostgreSQL `DECIMAL(12,4)` stores numbers with up to 4 decimal places of precision without floating-point errors. This is critical for sub-gram pricing like ₹0.0050/g which cannot be represented exactly as a JavaScript `float64`.

---

## Unit Conversion Strategy

### Storage
All prices are stored as **price per base unit**:

| Category | Base Unit | Example |
|----------|-----------|---------|
| Weight | gram (g) | ₹0.05/g = ₹50/kg |
| Volume | millilitre (mL) | ₹0.12/mL = ₹120/L |
| Count | unit | ₹12.50/unit |

### Conversion Table (`src/lib/units.ts`)

| User Selects | Base Unit | Factor |
|-------------|-----------|--------|
| g | g | × 1 |
| kg | g | × 1000 |
| mL | mL | × 1 |
| L | mL | × 1000 |
| unit | unit | × 1 |

### Where Calculations Occur
1. **Browser**: Live preview on Product Detail page (instant, no API call)
2. **API**: `POST /api/quotations` — server validates and stores converted values
3. **Formula**: `calculatedPrice = convertedQuantity × basePrice`

```
User enters: 2 kg
→ convertedQuantity = 2 × 1000 = 2000 g
→ calculatedPrice = 2000 × ₹0.05 = ₹100.00
```

---

## Price Storage Strategy

- Prices are stored as `Decimal(12,4)` in PostgreSQL — no float precision loss
- Prices are stored as **per-base-unit** values only
- Display conversion happens in `src/lib/pricing.ts::formatDisplayPrice()`
- INR formatting uses `Intl.NumberFormat` with `en-IN` locale

---

## Setup Instructions

### Prerequisites
- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database
- npm

### 1. Clone & Install
```bash
cd iqm-system
npm install
```

### 2. Environment Variables
Create a `.env` file (or rename `.env.local.example`):
```env
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="your-random-secret-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

> Generate a secret: `openssl rand -base64 32`

### 3. Push Database Schema
```bash
npm run db:push
```

### 4. Seed Database
```bash
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | ✅ |
| `NEXTAUTH_SECRET` | Random secret for JWT signing (min 32 chars) | ✅ |
| `NEXTAUTH_URL` | Base URL of your app | ✅ |

---

## Neon Database Configuration

1. Go to [https://neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string from **Connection Details**
4. Make sure to append `?sslmode=require` to the URL
5. Paste into your `.env` as `DATABASE_URL`

---

## Vercel Deployment

1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com) → **New Project** → import your repo
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your Vercel domain, e.g. `https://iqm-system.vercel.app`)
4. Deploy
5. After deployment, run seed via Vercel CLI or manually through Neon's SQL editor

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@iqm.com | Admin@123 |
| Seller | seller@iqm.com | Seller@123 |

---

## Assumptions Made

1. **Cart is session-based** — stored in `sessionStorage`, not a DB table. This keeps the schema simple and appropriate for a hackathon scope.
2. **Registration is Seller-only** — Admins are created via seed only. This is the standard pattern for admin-controlled platforms.
3. **Stock is not decremented** on quotation submission — quotations are requests, not confirmed orders.
4. **Prices are stored in smallest unit** (g, mL, unit) — eliminates all conversion ambiguity at storage time.
5. **No file uploads** — product images are not required per the spec.
6. **Single currency** — INR only, formatted with Indian locale.

---

## Project Structure

```
iqm-system/
├── prisma/
│   ├── schema.prisma       # DB schema
│   └── seed.ts             # Demo data seeder
├── prisma.config.ts        # Prisma v7 connection config
├── src/
│   ├── app/
│   │   ├── (auth pages)    # login, register
│   │   ├── admin/          # Admin dashboard, products, quotations
│   │   ├── seller/         # Seller dashboard, products, cart, quotations
│   │   └── api/            # REST API routes
│   ├── components/
│   │   ├── admin/          # AdminSidebar
│   │   ├── seller/         # SellerSidebar
│   │   └── ui/             # TopBar, StatusBadge
│   └── lib/
│       ├── auth.ts         # NextAuth config
│       ├── prisma.ts       # Prisma singleton
│       ├── units.ts        # Unit conversion
│       └── pricing.ts      # Price calculation + INR formatting
└── .env                    # Environment variables
```
