"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Filter } from "lucide-react";
import { formatDisplayPrice } from "@/lib/pricing";

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  baseUnit: string;
  basePrice: number;
  description: string;
  stockQuantity: number;
};

const CATEGORIES = ["All", "Food", "Chemical", "Medical", "Pharmaceutical", "Industrial", "Other"];

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "All") params.set("category", category);
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }, [search, category]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  return (
    <div>
      <div className="h-16 bg-white border-b border-slate-200 flex items-center px-6">
        <h1 className="text-lg font-semibold text-slate-900">Browse Products</h1>
      </div>

      <div className="p-6 space-y-5">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="seller-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              id="category-filter"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No products found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col hover:shadow-md transition-shadow"
              >
                {/* Category badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-full border border-green-100">
                    {p.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{p.sku}</span>
                </div>

                <h3 className="font-semibold text-slate-900 text-base mb-1">
                  {p.name}
                </h3>

                {p.description && (
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2 flex-1">
                    {p.description}
                  </p>
                )}

                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-lg font-bold text-slate-900">
                        {formatDisplayPrice(Number(p.basePrice), p.baseUnit)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Unit: {p.baseUnit}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/seller/products/${p.id}`}
                    className="w-full block text-center bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
