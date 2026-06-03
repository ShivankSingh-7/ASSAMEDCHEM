"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { formatINR } from "@/lib/pricing";
import { formatUnit } from "@/lib/units";

type CartItem = {
  productId: string;
  productName: string;
  productSku: string;
  baseUnit: string;
  orderedQuantity: number;
  orderedUnit: string;
  convertedQuantity: number;
  calculatedPrice: number;
};

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const cart = JSON.parse(sessionStorage.getItem("cart") ?? "[]");
    setItems(cart);
  }, []);

  function removeItem(index: number) {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    sessionStorage.setItem("cart", JSON.stringify(updated));
  }

  const grandTotal = items.reduce((sum, item) => sum + item.calculatedPrice, 0);

  async function handleSubmit() {
    if (items.length === 0) return;
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/quotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          productId: item.productId,
          orderedQuantity: item.orderedQuantity,
          orderedUnit: item.orderedUnit,
          convertedQuantity: item.convertedQuantity,
          calculatedPrice: item.calculatedPrice,
        })),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to submit quotation");
      setSubmitting(false);
      return;
    }

    sessionStorage.removeItem("cart");
    router.push("/seller/quotations");
  }

  if (!mounted) return null;

  return (
    <div>
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-5 h-5 text-green-600" />
          <h1 className="text-lg font-semibold text-slate-900">My Cart</h1>
        </div>
        {items.length > 0 && (
          <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        )}
      </div>

      <div className="p-6 max-w-3xl space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
            <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Your cart is empty</p>
            <p className="text-sm text-slate-400 mt-1">
              Add products to your cart to create a quotation
            </p>
            <Link
              href="/seller/products"
              className="mt-4 inline-flex items-center bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
                <div className="grid grid-cols-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span className="col-span-2">Product</span>
                  <span>Ordered</span>
                  <span>Converted</span>
                  <span className="text-right">Price</span>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="px-6 py-4 grid grid-cols-5 items-center gap-2 text-sm"
                  >
                    <div className="col-span-2">
                      <p className="font-medium text-slate-900">
                        {item.productName}
                      </p>
                      <p className="text-xs font-mono text-slate-500">
                        {item.productSku}
                      </p>
                    </div>
                    <div className="text-slate-700">
                      {item.orderedQuantity} {formatUnit(item.orderedUnit)}
                    </div>
                    <div className="text-slate-700">
                      {item.convertedQuantity} {item.baseUnit}
                    </div>
                    <div className="text-right flex items-center justify-end gap-3">
                      <span className="font-semibold text-slate-900">
                        {formatINR(item.calculatedPrice)}
                      </span>
                      <button
                        onClick={() => removeItem(i)}
                        className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">
                Quotation Summary
              </h3>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.productName}</span>
                    <span className="font-medium text-slate-900">
                      {formatINR(item.calculatedPrice)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between">
                <span className="font-bold text-slate-900">Grand Total</span>
                <span className="font-bold text-green-600 text-xl">
                  {formatINR(grandTotal)}
                </span>
              </div>

              <button
                id="submit-quotation-btn"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Submitting..." : "Submit Quotation Request"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
