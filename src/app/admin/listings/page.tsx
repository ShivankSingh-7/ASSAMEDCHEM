"use client";

import { useEffect, useState, useCallback } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDisplayPrice } from "@/lib/pricing";
import { CheckCircle, XCircle, Loader2, ChevronDown } from "lucide-react";
import { convertFromAnchorUnit } from "@/lib/units";

type Listing = {
  id: string;
  name: string;
  sku: string;
  category: string;
  baseUnit: string;
  price: number;
  inventoryQuantity: number;
  inventoryUnit: string;
  description: string | null;
  status: string;
  adminNote: string | null;
  createdAt: string;
  seller: { name: string; email: string };
};

const statusMap: Record<string, string> = {
  DRAFT: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"ALL" | "DRAFT" | "APPROVED" | "REJECTED">("DRAFT");

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/listings");
    const data = await res.json();
    setListings(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  async function handleAction(id: string, status: "APPROVED" | "REJECTED") {
    setActionId(id);
    await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote: noteMap[id] ?? null }),
    });
    setActionId(null);
    fetchListings();
  }

  const filtered = listings.filter((l) =>
    filter === "ALL" ? true : l.status === filter
  );

  const draftCount = listings.filter((l) => l.status === "DRAFT").length;

  return (
    <div>
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Seller Submissions</h1>
          <p className="text-xs text-slate-500 -mt-0.5">Review and approve product listings from sellers</p>
        </div>
        {draftCount > 0 && (
          <span className="bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold px-3 py-1 rounded-full">
            {draftCount} pending review
          </span>
        )}
      </div>

      <div className="p-6 space-y-4">
        {/* Filter tabs */}
        <div className="flex gap-2">
          {(["DRAFT", "ALL", "APPROVED", "REJECTED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                filter === f
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
              }`}
            >
              {f === "DRAFT" ? "Pending" : f === "ALL" ? "All" : f === "APPROVED" ? "Approved" : "Rejected"}
              {f === "DRAFT" && draftCount > 0 && (
                <span className="ml-1.5 bg-amber-400 text-white text-xs rounded-full px-1.5">{draftCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-14 text-center text-slate-400">No listings in this category</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((l) => (
                <div key={l.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{l.name}</h3>
                        <span className="font-mono text-xs text-slate-400">{l.sku}</span>
                        <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full border border-blue-100">{l.category}</span>
                        <StatusBadge status={statusMap[l.status] ?? l.status} />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-slate-500">Seller</p>
                          <p className="font-medium text-slate-900">{l.seller.name}</p>
                          <p className="text-xs text-slate-400">{l.seller.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Price</p>
                          <p className="font-medium text-slate-900">{formatDisplayPrice(Number(l.price), l.baseUnit)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Stock</p>
                          <p className="font-medium text-slate-900">{convertFromAnchorUnit(Number(l.inventoryQuantity), l.inventoryUnit, l.baseUnit).toLocaleString()} {l.baseUnit}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Submitted</p>
                          <p className="font-medium text-slate-900">{new Date(l.createdAt).toLocaleDateString("en-IN")}</p>
                        </div>
                      </div>
                      {l.description && (
                        <p className="text-xs text-slate-500 mt-2">{l.description}</p>
                      )}
                      {l.adminNote && l.status === "REJECTED" && (
                        <p className="text-xs text-red-500 mt-2 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                          <strong>Your note:</strong> {l.adminNote}
                        </p>
                      )}
                    </div>

                    {/* Actions — only for DRAFT */}
                    {l.status === "DRAFT" && (
                      <div className="flex-shrink-0 flex flex-col gap-2 w-56">
                        <input
                          type="text"
                          placeholder="Optional rejection note..."
                          value={noteMap[l.id] ?? ""}
                          onChange={(e) => setNoteMap((prev) => ({ ...prev, [l.id]: e.target.value }))}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(l.id, "APPROVED")}
                            disabled={actionId === l.id}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                          >
                            {actionId === l.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(l.id, "REJECTED")}
                            disabled={actionId === l.id}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                          >
                            {actionId === l.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                            Reject
                          </button>
                        </div>
                        {l.status === "DRAFT" && (
                          <p className="text-xs text-slate-400 text-center">
                            Approve → auto-adds to product catalog
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
