"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatINR } from "@/lib/pricing";
import { ChevronDown, Loader2 } from "lucide-react";

type QuotationItem = {
  id: string;
  product: { name: string; sku: string; baseUnit: string };
  orderedQuantity: number;
  orderedUnit: string;
  convertedQuantity: number;
  calculatedPrice: number;
};

type Quotation = {
  id: string;
  user: { name: string; email: string };
  seller?: { name: string; email: string } | null;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: QuotationItem[];
};

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/quotations")
      .then((r) => r.json())
      .then((data) => {
        setQuotations(data);
        setLoading(false);
      });
  }, []);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    const res = await fetch(`/api/quotations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setQuotations((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status } : q))
      );
    }
    setUpdating(null);
  }

  return (
    <div>
      <div className="h-16 bg-white border-b border-slate-200 flex items-center px-6">
        <h1 className="text-lg font-semibold text-slate-900">Quotations</h1>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : quotations.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              No quotations yet
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {quotations.map((q) => (
                <div key={q.id}>
                  {/* Row */}
                  <div className="px-6 py-4 flex items-center gap-4">
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === q.id ? null : q.id)
                      }
                      className="p-1 hover:bg-slate-100 rounded transition-colors"
                    >
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          expandedId === q.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <div className="flex-1 grid grid-cols-5 gap-4 items-center text-sm">
                      <div>
                        <p className="font-mono text-xs text-slate-500">
                          #{q.id.slice(-8)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(q.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 truncate">
                          Buyer: {q.user.name}
                        </p>
                        <p className="font-medium text-slate-900 truncate mt-1">
                          Seller: {q.seller ? q.seller.name : "System"}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {formatINR(Number(q.totalAmount))}
                        </p>
                        <p className="text-xs text-slate-500">
                          {q.items.length} item(s)
                        </p>
                      </div>
                      <div>
                        <StatusBadge status={q.status} />
                      </div>
                      <div>
                        <div className="relative">
                          <select
                            value={q.status}
                            onChange={(e) =>
                              updateStatus(q.id, e.target.value)
                            }
                            disabled={updating === q.id}
                            className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 cursor-pointer disabled:opacity-50"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                          {updating === q.id ? (
                            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-slate-400" />
                          ) : (
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded items */}
                  {expandedId === q.id && (
                    <div className="px-6 pb-4 bg-slate-50 border-t border-slate-100">
                      <table className="w-full text-sm mt-4">
                        <thead>
                          <tr>
                            {[
                              "Product",
                              "SKU",
                              "Ordered",
                              "Converted",
                              "Price",
                            ].map((h) => (
                              <th
                                key={h}
                                className="text-left pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {q.items.map((item) => (
                            <tr key={item.id}>
                              <td className="py-2.5 font-medium text-slate-900">
                                {item.product.name}
                              </td>
                              <td className="py-2.5 font-mono text-xs text-slate-500">
                                {item.product.sku}
                              </td>
                              <td className="py-2.5 text-slate-700">
                                {Number(item.orderedQuantity)} {item.orderedUnit}
                              </td>
                              <td className="py-2.5 text-slate-700">
                                {Number(item.convertedQuantity)}{" "}
                                {item.product.baseUnit}
                              </td>
                              <td className="py-2.5 font-semibold text-slate-900">
                                {formatINR(Number(item.calculatedPrice))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-slate-300">
                            <td colSpan={4} className="pt-2.5 text-right font-semibold text-slate-700 text-sm">
                              Grand Total
                            </td>
                            <td className="pt-2.5 font-bold text-slate-900">
                              {formatINR(Number(q.totalAmount))}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
