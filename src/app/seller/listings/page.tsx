"use client";

import { useEffect, useState, useCallback } from "react";
import { PlusCircle, Trash2, Loader2, AlertTriangle } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDisplayPrice } from "@/lib/pricing";
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
  status: string;
  adminNote: string | null;
  createdAt: string;
};

import UnitSelect from "@/components/ui/UnitSelect";
import { perUnitLabel } from "@/lib/units";

const CATEGORIES = ["Food", "Chemical", "Medical", "Pharmaceutical", "Industrial", "Other"];

const EMPTY_FORM = {
  name: "", sku: "", category: "", description: "",
  baseUnit: "kg", price: "", stock: "",
};

export default function SellerListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/listings");
    const data = await res.json();
    setListings(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        stock: parseFloat(form.stock),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to submit listing");
      setSubmitting(false);
      return;
    }

    setForm(EMPTY_FORM);
    setShowForm(false);
    setSubmitting(false);
    fetchListings();
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/listings/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    setDeleting(false);
    fetchListings();
  }

  const statusMap: Record<string, string> = {
    DRAFT: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
  };

  const unitLabel = perUnitLabel(form.baseUnit);

  return (
    <div>
      {/* Header */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">My Listings</h1>
          <p className="text-xs text-slate-500 -mt-0.5">Submit products for Admin review</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(""); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          {showForm ? "Cancel" : "Submit New Product"}
        </button>
      </div>

      <div className="p-6 space-y-5 max-w-4xl">
        {/* How it works banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-blue-600 text-sm font-bold">?</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900">How seller listings work</p>
            <p className="text-sm text-blue-700 mt-1">
              Submit a product below. The Admin will review it and either <strong>approve</strong> (it appears in the catalog) or <strong>reject</strong> it with a note.
            </p>
          </div>
        </div>

        {/* Submission Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
          >
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Product Details</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Name *</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Organic Turmeric" className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">SKU *</label>
                <input name="sku" value={form.sku} onChange={handleChange} required placeholder="e.g. TUR-001" className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
                <select name="category" value={form.category} onChange={handleChange} required className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Base Unit *</label>
                <UnitSelect name="baseUnit" value={form.baseUnit} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Price * <span className="font-normal text-slate-400">({unitLabel})</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                  <input name="price" type="number" value={form.price} onChange={handleChange} required min="0" step="0.0001" placeholder="0.0000" className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Stock Qty * <span className="font-normal text-slate-400">(in {form.baseUnit})</span>
                </label>
                <input name="stock" type="number" value={form.stock} onChange={handleChange} required min="0" step="0.01" className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Optional description..." className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>

            {form.price && (form.baseUnit === "mg" || form.baseUnit === "mL") && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5 text-sm text-blue-700">
                💡 Equals <strong>₹{(parseFloat(form.price) * (form.baseUnit === "mg" ? 1000000 : 1000)).toFixed(2)} per {form.baseUnit === "mg" ? "kg" : "L"}</strong>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 text-center px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Submitting..." : "Submit for Review"}
              </button>
            </div>
          </form>
        )}

        {/* Listings table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          ) : listings.length === 0 ? (
            <div className="py-14 text-center text-slate-400">
              <PlusCircle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">No listings yet</p>
              <p className="text-sm mt-1">Submit your first product using the button above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Product", "SKU", "Category", "Price", "Stock", "Status", ""].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listings.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{l.name}</p>
                        {l.adminNote && l.status === "REJECTED" && (
                          <p className="text-xs text-red-500 mt-0.5">Note: {l.adminNote}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{l.sku}</td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full border border-blue-100">{l.category}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {formatDisplayPrice(Number(l.price), l.baseUnit)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {convertFromAnchorUnit(Number(l.inventoryQuantity), l.inventoryUnit, l.baseUnit).toLocaleString()} {l.baseUnit}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={statusMap[l.status] ?? l.status} />
                      </td>
                      <td className="px-6 py-4">
                        {l.status === "DRAFT" && (
                          <button onClick={() => setDeleteId(l.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Withdraw">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Withdraw Listing</h3>
                <p className="text-sm text-slate-500">This listing will be removed.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium text-white disabled:opacity-60 transition-colors">
                {deleting ? "Removing..." : "Withdraw"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
