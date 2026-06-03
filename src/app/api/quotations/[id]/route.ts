import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/quotations/[id] — seller (or admin) updates status
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status } = await req.json();
  if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!quotation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only the seller of the product or admin can update status
  if (session.user.role !== "ADMIN" && quotation.sellerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updatedQuotation = await prisma.quotation.update({
    where: { id },
    data: { status },
  });

  // If approved, unlist the associated products
  if (status === "APPROVED") {
    const productIds = quotation.items.map((item) => item.productId);
    await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { status: "UNLISTED" },
    });
  }

  return NextResponse.json(updatedQuotation);
}

// GET /api/quotations/[id] — get single quotation detail
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: { product: { select: { name: true, sku: true, baseUnit: true } } },
      },
    },
  });

  if (!quotation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Sellers can only view if they are the buyer OR the seller
  if (session.user.role === "SELLER" && quotation.userId !== session.user.id && quotation.sellerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(quotation);
}
