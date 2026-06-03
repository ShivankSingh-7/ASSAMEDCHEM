"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Loader2 } from "lucide-react";
import { calculatePrice, formatINR, formatDisplayPrice } from "@/lib/pricing";
import { getAvailableUnits, formatUnit } from "@/lib/units";
import { use } from "react";

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  baseUnit: string;
  basePrice: number;
  stockQuantity: number;
};

type Props = { params: Promise<{ id: string }> };

export default function ProductDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>("g");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((p) => {
        setProduct(p);
        setUnit(p.baseUnit);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
      </div>
    );
  }

  if (!product) return <div className="p-6 text-slate-500">Product not found.</div>;

  const availableUnits = getAvailableUnits(product.baseUnit);
  const { convertedQuantity, calculatedPrice } = calculatePrice(
    quantity || 0,
    unit,
    product.baseUnit,
    Number(product.basePrice)
  );

  function addToCart() {
    setAdding(true);
    const existing = JSON.parse(sessionStorage.getItem("cart") ?? "[]");
    const item = {
      productId: product!.id,
      productName: product!.name,
      productSku: product!.sku,
      baseUnit: product!.baseUnit,
      orderedQuantity: quantity,
      orderedUnit: unit,
      convertedQuantity,
      calculatedPrice,
    };
    existing.push(item);
    sessionStorage.setItem("cart", JSON.stringify(existing));
    setAdding(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  return (
    <div>
      <div className="h-16 bg-white border-b border-slate-200 flex items-center gap-4 px-6">
        <Link href="/seller/products" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-semibold text-slate-900">{product.name}</h1>
      </div>

      <div className="p-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div>
              <span className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-full border border-green-100">
                {product.category}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{product.name}</h2>
              <p className="text-sm font-mono text-slate-500 mt-0.5">{product.sku}</p>
            </div>
            {product.description && (
              <p className="text-sm text-slate-600">{product.description}</p>
            )}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Base Price</span>
                <span className="font-semibold text-slate-900">
                  {formatDisplayPrice(Number(product.basePrice), product.baseUnit)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Base Unit</span>
                <span className="font-semibold text-slate-900">{product.baseUnit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Stock</span>
                <span className="font-semibold text-slate-900">
                  {Number(product.stockQuantity).toLocaleString()} {product.baseUnit}
                </span>
              </div>
            </div>
          </div>

          {/* Order calculator */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <h3 className="font-semibold text-slate-900">Request Quotation</h3>

            {/* Quantity input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Quantity
              </label>
              <input
                id="quantity-input"
                type="number"
                min={0.001}
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Unit selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Unit
              </label>
              <div className="flex flex-wrap gap-2">
                {availableUnits.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      unit === u
                        ? "bg-green-600 text-white border-green-600"
                        : "border-slate-300 text-slate-700 hover:border-green-400"
                    }`}
                  >
                    {formatUnit(u)}
                  </button>
                ))}
              </div>
            </div>

            {/* Live calculation */}
            {quantity > 0 && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2.5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Price Breakdown
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">You entered</span>
                  <span className="font-medium text-slate-900">
                    {quantity} {formatUnit(unit)}
                  </span>
                </div>
                {unit !== product.baseUnit && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Converted to</span>
                    <span className="font-medium text-slate-900">
                      {convertedQuantity} {product.baseUnit}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    Rate ({formatINR(Number(product.basePrice))}/{product.baseUnit})
                  </span>
                  <span className="font-medium text-slate-900">×{convertedQuantity}</span>
                </div>
                <div className="border-t border-slate-200 pt-2.5 flex justify-between">
                  <span className="font-semibold text-slate-900">Total Price</span>
                  <span className="font-bold text-green-600 text-lg">
                    {formatINR(calculatedPrice)}
                  </span>
                </div>
              </div>
            )}

            <button
              id="add-to-cart-btn"
              onClick={addToCart}
              disabled={!quantity || quantity <= 0 || adding}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                success
                  ? "bg-green-600 text-white"
                  : "bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {success ? "Added to Cart ✓" : "Add to Cart"}
            </button>

            <Link
              href="/seller/cart"
              className="block w-full text-center text-sm text-green-600 hover:text-green-700 font-medium"
            >
              View Cart →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
