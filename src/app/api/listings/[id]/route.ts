import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/listings/[id] — Admin approves or rejects a listing
// On APPROVED → auto-creates a Product in the catalog
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status, adminNote } = await req.json();
  if (!["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const listing = await prisma.productListing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Update listing status
  const updated = await prisma.productListing.update({
    where: { id },
    data: { status, adminNote: adminNote ?? null },
  });

  // If approved → promote to Product catalog
  if (status === "APPROVED") {
    try {
      await prisma.product.create({
        data: {
          name: listing.name,
          sku: listing.sku,
          category: listing.category,
          description: listing.description,
          baseUnit: listing.baseUnit,
          price: listing.price,
          inventoryQuantity: listing.inventoryQuantity,
          inventoryUnit: listing.inventoryUnit,
          sellerId: listing.sellerId,
        },
      });
    } catch {
      // If SKU already exists in catalog, still update listing status
    }
  }

  return NextResponse.json(updated);
}

// DELETE /api/listings/[id] — Seller deletes own draft listing
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listing = await prisma.productListing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Seller can only delete own listings; Admin can delete any
  if (session.user.role === "SELLER" && listing.sellerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.productListing.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
