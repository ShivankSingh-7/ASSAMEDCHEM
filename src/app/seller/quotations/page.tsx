"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatINR } from "@/lib/pricing";
import { FileText, ChevronDown, Loader2 } from "lucide-react";

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
  totalAmount: number;
  status: string;
  createdAt: string;
  items: QuotationItem[];
};

export default function SellerQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/quotations")
      .then((r) => r.json())
      .then((data) => {
        setQuotations(data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="h-16 bg-white border-b border-slate-200 flex items-center px-6">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-green-600" />
          <h1 className="text-lg font-semibold text-slate-900">My Quotations</h1>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          </div>
        ) : quotations.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No quotations yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Browse products and add items to cart to create a quotation request
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {quotations.map((q) => (
                <div key={q.id}>
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === q.id ? null : q.id)
                    }
                    className="w-full px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${
                        expandedId === q.id ? "rotate-180" : ""
                      }`}
                    />
                    <div className="flex-1 grid grid-cols-3 sm:grid-cols-4 gap-4 items-center">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          #{q.id.slice(-8)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(q.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">
                          {q.items.length} item(s)
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatINR(Number(q.totalAmount))}
                        </p>
                      </div>
                      <div className="hidden sm:block">
                        <StatusBadge status={q.status} />
                      </div>
                    </div>
                  </button>

                  {expandedId === q.id && (
                    <div className="px-6 pb-4 bg-slate-50 border-t border-slate-100">
                      <div className="sm:hidden mb-3">
                        <StatusBadge status={q.status} />
                      </div>
                      <table className="w-full text-sm mt-4">
                        <thead>
                          <tr>
                            {["Product", "SKU", "Ordered", "Converted", "Price"].map((h) => (
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
                                {Number(item.convertedQuantity)} {item.product.baseUnit}
                              </td>
                              <td className="py-2.5 font-semibold text-slate-900">
                                {formatINR(Number(item.calculatedPrice))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-slate-300">
                            <td colSpan={4} className="pt-2.5 text-right font-semibold text-slate-700">
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
          </div>
        )}
      </div>
    </div>
  );
}
