import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/quotations
// Admin → all quotations; Seller → own quotations
export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quotations = await prisma.quotation.findMany({
    where: session.user.role === "ADMIN" 
      ? {} 
      : { OR: [{ userId: session.user.id }, { sellerId: session.user.id }] },
    include: {
      user: { select: { name: true, email: true } },
      seller: { select: { name: true, email: true } },
      items: {
        include: {
          product: { select: { name: true, sku: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(quotations);
}

// POST /api/quotations — seller submits a quotation
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { items } = body as {
    items: {
      productId: string;
      orderedQuantity: number;
      orderedUnit: string;
      convertedQuantity: number;
      calculatedPrice: number;
    }[];
  };

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "No items in quotation" }, { status: 400 });
  }

  // Fetch products to determine sellerId for each item
  const productIds = items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, sellerId: true },
  });

  const productSellerMap = new Map(products.map((p) => [p.id, p.sellerId]));

  // Group items by sellerId
  const itemsBySeller = new Map<string | null, typeof items>();

  for (const item of items) {
    const sellerId = productSellerMap.get(item.productId) || null;
    if (!itemsBySeller.has(sellerId)) {
      itemsBySeller.set(sellerId, []);
    }
    itemsBySeller.get(sellerId)!.push(item);
  }

  // Create a separate quotation for each seller
  const createdQuotations = [];

  for (const [sellerId, sellerItems] of itemsBySeller.entries()) {
    const totalAmount = sellerItems.reduce((sum, item) => sum + item.calculatedPrice, 0);

    const quotation = await prisma.quotation.create({
      data: {
        userId: session.user.id,
        sellerId: sellerId,
        totalAmount,
        items: {
          create: sellerItems.map((item) => ({
            productId: item.productId,
            orderedQuantity: item.orderedQuantity,
            orderedUnit: item.orderedUnit,
            convertedQuantity: item.convertedQuantity,
            calculatedPrice: item.calculatedPrice,
          })),
        },
      },
      include: { items: true },
    });
    createdQuotations.push(quotation);
  }

  return NextResponse.json(createdQuotations, { status: 201 });
}
