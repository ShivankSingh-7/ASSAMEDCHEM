import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/quotations
// Admin → all quotations; Seller → own quotations
export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quotations = await prisma.quotation.findMany({
    where: session.user.role === "ADMIN" ? {} : { userId: session.user.id },
    include: {
      user: { select: { name: true, email: true } },
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

  const totalAmount = items.reduce((sum, item) => sum + item.calculatedPrice, 0);

  const quotation = await prisma.quotation.create({
    data: {
      userId: session.user.id,
      totalAmount,
      items: {
        create: items.map((item) => ({
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

  return NextResponse.json(quotation, { status: 201 });
}
