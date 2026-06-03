import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/listings — admin gets all, seller gets own
export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listings = await prisma.productListing.findMany({
    where: session.user.role === "ADMIN" ? {} : { sellerId: session.user.id },
    include: { seller: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(listings);
}

// POST /api/listings — seller submits a product listing
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, sku, category, description, baseUnit, basePrice, stockQuantity } = body;

  if (!name || !sku || !category || !baseUnit || basePrice == null || stockQuantity == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const listing = await prisma.productListing.create({
      data: {
        sellerId: session.user.id,
        name,
        sku,
        category,
        description,
        baseUnit,
        basePrice,
        stockQuantity,
        status: "DRAFT",
      },
    });
    return NextResponse.json(listing, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "SKU already submitted" }, { status: 409 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
