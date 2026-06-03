import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ONE-TIME migration endpoint - adds new columns if they don't exist
// Call: GET /api/admin/run-migration (admin only)
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  try {
    // Add columns to Product table
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "price" DECIMAL(12,4)`
    );
    results.push("✅ Product.price column ensured");

    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "inventoryQuantity" DECIMAL(12,4)`
    );
    results.push("✅ Product.inventoryQuantity column ensured");

    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "inventoryUnit" TEXT`
    );
    results.push("✅ Product.inventoryUnit column ensured");

    // Add columns to ProductListing table
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "ProductListing" ADD COLUMN IF NOT EXISTS "price" DECIMAL(12,4)`
    );
    results.push("✅ ProductListing.price column ensured");

    await prisma.$executeRawUnsafe(
      `ALTER TABLE "ProductListing" ADD COLUMN IF NOT EXISTS "inventoryQuantity" DECIMAL(12,4)`
    );
    results.push("✅ ProductListing.inventoryQuantity column ensured");

    await prisma.$executeRawUnsafe(
      `ALTER TABLE "ProductListing" ADD COLUMN IF NOT EXISTS "inventoryUnit" TEXT`
    );
    results.push("✅ ProductListing.inventoryUnit column ensured");

    // Widen precision on all columns from DECIMAL(12,4) to DECIMAL(20,4)
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Product" ALTER COLUMN "price" TYPE DECIMAL(20,4)`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Product" ALTER COLUMN "inventoryQuantity" TYPE DECIMAL(20,4)`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "ProductListing" ALTER COLUMN "price" TYPE DECIMAL(20,4)`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "ProductListing" ALTER COLUMN "inventoryQuantity" TYPE DECIMAL(20,4)`
    );
    results.push("✅ All numeric columns widened to DECIMAL(20,4)");

    // Migrate existing Product data from basePrice/stockQuantity if those columns still exist
    try {
      await prisma.$executeRawUnsafe(`
        UPDATE "Product"
        SET
          "price" = "basePrice",
          "inventoryUnit" = CASE
            WHEN "baseUnit" IN ('kg','g','mg') THEN 'mg'
            WHEN "baseUnit" IN ('L','mL') THEN 'mL'
            ELSE 'unit'
          END,
          "inventoryQuantity" = CASE
            WHEN "baseUnit" = 'kg' THEN "stockQuantity" * 1000000
            WHEN "baseUnit" = 'g'  THEN "stockQuantity" * 1000
            WHEN "baseUnit" = 'mg' THEN "stockQuantity"
            WHEN "baseUnit" = 'L'  THEN "stockQuantity" * 1000
            WHEN "baseUnit" = 'mL' THEN "stockQuantity"
            ELSE "stockQuantity"
          END
        WHERE "price" IS NULL AND "basePrice" IS NOT NULL
      `);
      results.push("✅ Migrated existing Product rows from basePrice/stockQuantity");
    } catch {
      results.push("ℹ️ Product rows: basePrice/stockQuantity columns may not exist (already clean)");
    }

    // Migrate existing ProductListing data
    try {
      await prisma.$executeRawUnsafe(`
        UPDATE "ProductListing"
        SET
          "price" = "basePrice",
          "inventoryUnit" = CASE
            WHEN "baseUnit" IN ('kg','g','mg') THEN 'mg'
            WHEN "baseUnit" IN ('L','mL') THEN 'mL'
            ELSE 'unit'
          END,
          "inventoryQuantity" = CASE
            WHEN "baseUnit" = 'kg' THEN "stockQuantity" * 1000000
            WHEN "baseUnit" = 'g'  THEN "stockQuantity" * 1000
            WHEN "baseUnit" = 'mg' THEN "stockQuantity"
            WHEN "baseUnit" = 'L'  THEN "stockQuantity" * 1000
            WHEN "baseUnit" = 'mL' THEN "stockQuantity"
            ELSE "stockQuantity"
          END
        WHERE "price" IS NULL AND "basePrice" IS NOT NULL
      `);
      results.push("✅ Migrated existing ProductListing rows from basePrice/stockQuantity");
    } catch {
      results.push("ℹ️ ProductListing rows: basePrice/stockQuantity columns may not exist (already clean)");
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : String(err),
      results,
    }, { status: 500 });
  }
}
