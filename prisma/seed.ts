import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@iqm.com" },
    update: {},
    create: { name: "Admin User", email: "admin@iqm.com", password: adminPassword, role: "ADMIN" },
  });
  console.log("✅ Admin created:", admin.email);

  const sellerPassword = await bcrypt.hash("Seller@123", 12);
  const seller = await prisma.user.upsert({
    where: { email: "seller@iqm.com" },
    update: {},
    create: { name: "Demo Seller", email: "seller@iqm.com", password: sellerPassword, role: "SELLER" },
  });
  console.log("✅ Seller created:", seller.email);

  const products = [
    { name: "Sugar", sku: "SUG-001", category: "Food", description: "Refined white sugar", baseUnit: "g", basePrice: 0.05, stockQuantity: 1000000 },
    { name: "Refined Oil", sku: "OIL-001", category: "Food", description: "Pure refined sunflower oil", baseUnit: "mL", basePrice: 0.12, stockQuantity: 500000 },
    { name: "Surgical Gloves", sku: "GLV-001", category: "Medical", description: "Disposable latex surgical gloves", baseUnit: "unit", basePrice: 12.5, stockQuantity: 10000 },
    { name: "Sodium Chloride", sku: "NAC-001", category: "Chemical", description: "Laboratory grade sodium chloride (NaCl)", baseUnit: "g", basePrice: 0.008, stockQuantity: 5000000 },
    { name: "Ethanol", sku: "ETH-001", category: "Chemical", description: "70% ethanol solution for medical use", baseUnit: "mL", basePrice: 0.08, stockQuantity: 200000 },
    { name: "Paracetamol Tablet", sku: "PAR-500", category: "Pharmaceutical", description: "Paracetamol 500mg tablet", baseUnit: "unit", basePrice: 1.5, stockQuantity: 50000 },
    { name: "IV Fluid Bag", sku: "IVF-001", category: "Medical", description: "500mL Normal Saline IV Bag", baseUnit: "unit", basePrice: 85.0, stockQuantity: 2000 },
    { name: "Hydrogen Peroxide", sku: "HPX-030", category: "Chemical", description: "3% Hydrogen peroxide solution", baseUnit: "mL", basePrice: 0.05, stockQuantity: 100000 },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
    console.log(`✅ Product: ${product.name}`);
  }

  console.log("\n🎉 Seeding complete!");
  console.log("   Admin:  admin@iqm.com / Admin@123");
  console.log("   Seller: seller@iqm.com / Seller@123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
