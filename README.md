# ASSAMEDCHAM B2B Marketplace

Welcome to the **ASSAMEDCHAM B2B Platform**! This is a production-ready Pharmaceutical Business-to-Business marketplace built for the hackathon. 

It acts as a highly specialized supply chain platform where chemical and medical suppliers can list bulk pharmaceutical products, platform administrators can verify the safety and legitimacy of those products, and clinics/buyers can purchase them using strictly calculated medical units.

---

## The Core B2B Workflow

The application operates on a strict, 4-step professional workflow:

1. **Sellers List Products:** A Seller logs in and submits a new chemical formulation or bulk medical supply they wish to sell (for example, a batch of 500 kg of an Active Pharmaceutical Ingredient). 
2. **Admins Enforce Quality Control:** Products do not go live automatically. An Administrator must review the submission to ensure it meets platform guidelines. Once the Admin clicks "Approve", the product is published to the public catalog.
3. **Buyers Shop & Request Quotations:** A Buyer (like a clinic or pharmacy) browses the catalog, adds items to their cart, and requests a formal "Quotation". Even if the seller listed the product in bulk **Kilograms**, the buyer can specifically order exact doses in **Milligrams**. The system handles the complex mathematical conversions dynamically!
4. **Sellers Fulfill Orders:** The original Seller receives the quotation request on their dashboard. Once they review and click "Approve", the system automatically deducts the exact amount of stock from the database. If the inventory reaches zero, the product is automatically unlisted to prevent backorders.

---

## The Unit Conversion Engine (How it works)

Because pharmaceutical measurements must be exact, this platform features a robust, dynamic Unit Conversion Engine to handle pricing and inventory perfectly without floating-point math errors.

### 1. How Units are Stored
To prevent mathematical drift, the database NEVER stores multiple different units for a single product. Instead, **every product is strictly stored using a base anchor unit**. 
- Weight products are always anchored in **Milligrams (mg)**.
- Volume products are always anchored in **Milliliters (mL)**.
- Discrete items are anchored as a **Unit**.

The price is always stored in the database as **Price per Base Unit** using PostgreSQL's strict `Decimal(12, 4)` data type. This guarantees precision up to 4 decimal places, ensuring that sub-milligram pricing (e.g. ₹0.0050/mg) never loses accuracy.

### 2. How the Math Works
When a seller lists a product in `kg`, or a buyer purchases a product in `L`, the system uses a centralized conversion dictionary (`src/lib/units.ts`) to immediately convert the input back to the base anchor before saving it.

**Example Scenario:**
1. **The Seller** lists a product at ₹5,000 per `kg`.
2. **The System** intercepts this and divides it by 1,000,000. It stores the price in the database as exactly `₹0.0050 per mg`.
3. **The Buyer** decides to order `500 mg`. 
4. **The System** calculates `500 mg × ₹0.0050` and generates a perfectly accurate invoice for `₹2.50`.
5. When the order is approved, exactly `500` is subtracted from the `mg` inventory column in the database.

By always reducing quantities down to their absolute smallest common denominator (`mg` or `mL`), the platform can safely and instantly translate measurements between buyers and sellers without any risk of data corruption.

---

## Tech Stack

* **Frontend:** Next.js (React) & Tailwind CSS (Deep Medical Blue theme).
* **Backend:** Next.js API Routes (Serverless backend to handle logic and math securely).
* **Database:** PostgreSQL (hosted on Neon) using **Prisma ORM** to enforce strict `Decimal` types.
* **Security:** NextAuth.js to handle secure logins and enforce Role-Based Access Control (Admins vs Sellers).

---

## Live Demo

The application is deployed and accessible live. You can test the platform, browse the catalog, and experience the dynamic unit conversion engine firsthand at:

🔗 **[https://assamedchem-virid.vercel.app/](https://assamedchem-virid.vercel.app/)**

---
