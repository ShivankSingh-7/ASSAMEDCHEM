import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/quotations/[id] — admin updates status
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status } = await req.json();
  if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const quotation = await prisma.quotation.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(quotation);
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

  // Sellers can only view their own
  if (session.user.role === "SELLER" && quotation.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(quotation);
}
