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
  userId: string;
  sellerId: string | null;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: QuotationItem[];
};

export default function SellerQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"purchases" | "sales">("purchases");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/session").then((r) => r.json()),
      fetch("/api/quotations").then((r) => r.json())
    ]).then(([sessionData, quotationsData]) => {
      setCurrentUserId(sessionData?.user?.id || "");
      setQuotations(quotationsData);
      setLoading(false);
    });
  }, []);

  const purchases = quotations.filter((q) => q.userId === currentUserId);
  const sales = quotations.filter((q) => q.sellerId === currentUserId);
  const displayQuotations = activeTab === "purchases" ? purchases : sales;

  return (
    <div>
      <div className="h-16 bg-white border-b border-slate-200 flex items-center px-6">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-green-600" />
          <h1 className="text-lg font-semibold text-slate-900">My Quotations</h1>
        </div>
      </div>

      <div className="px-6 pt-4 border-b border-slate-200 bg-white">
        <div className="flex gap-6">
          <button
            onClick={() => { setActiveTab("purchases"); setExpandedId(null); }}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "purchases"
                ? "border-green-600 text-green-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            My Purchases
          </button>
          <button
            onClick={() => { setActiveTab("sales"); setExpandedId(null); }}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "sales"
                ? "border-green-600 text-green-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            Sales Requests
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          </div>
        ) : displayQuotations.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No {activeTab === "purchases" ? "purchases" : "sales requests"} yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {displayQuotations.map((q) => (
                <div key={q.id}>
                  <div className="flex items-center justify-between w-full px-6 py-4 hover:bg-slate-50 transition-colors">
                    <button
                      onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                      className="flex-1 flex items-center gap-4 text-left"
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
                    {activeTab === "sales" && q.status === "PENDING" && (
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={async () => {
                            await fetch(`/api/quotations/${q.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: "APPROVED" }),
                            });
                            window.location.reload();
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={async () => {
                            await fetch(`/api/quotations/${q.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: "REJECTED" }),
                            });
                            window.location.reload();
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  {expandedId === q.id && (
                    <div className="px-6 pb-4 bg-slate-50 border-t border-slate-100">
                      <div className="sm:hidden mb-3 pt-3">
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
