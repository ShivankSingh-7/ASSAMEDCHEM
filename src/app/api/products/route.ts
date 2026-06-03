import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getAnchorUnit, convertToAnchorUnit } from "@/lib/units";

// GET /api/products — public list with optional search + category filter
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";

  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  const products = await prisma.product.findMany({
    where: {
      ...(isAdmin ? {} : { status: "ACTIVE" }),
      AND: [
        search ? { name: { contains: search, mode: "insensitive" } } : {},
        category ? { category: { equals: category, mode: "insensitive" } } : {},
      ],
    },
    include: { seller: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

// POST /api/products — admin only
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, sku, category, description, baseUnit, price, stock } = body;

  if (!name || !sku || !category || !baseUnit || price == null || stock == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const inventoryUnit = getAnchorUnit(baseUnit);
  const inventoryQuantity = convertToAnchorUnit(Number(stock), baseUnit);

  try {
    const product = await prisma.product.create({
      data: { name, sku, category, description, baseUnit, price, inventoryQuantity, inventoryUnit },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "SKU already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
