export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import TopBar from "@/components/ui/TopBar";
import StatusBadge from "@/components/ui/StatusBadge";
import { Package, FileText, Clock, TrendingUp, ClipboardList } from "lucide-react";
import { formatINR } from "@/lib/pricing";
import Link from "next/link";

export default async function AdminDashboard() {
  const [totalProducts, totalQuotations, pendingQuotations, pendingListings, recentQuotations] =
    await Promise.all([
      prisma.product.count(),
      prisma.quotation.count(),
      prisma.quotation.count({ where: { status: "PENDING" } }),
      prisma.productListing.count({ where: { status: "DRAFT" } }),
      prisma.quotation.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

  const stats = [
    {
      label: "Total Products",
      value: totalProducts,
      icon: Package,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Total Quotations",
      value: totalQuotations,
      icon: FileText,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Pending Quotations",
      value: pendingQuotations,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Approval Rate",
      value:
        totalQuotations > 0
          ? `${Math.round(((totalQuotations - pendingQuotations) / totalQuotations) * 100)}%`
          : "—",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
      href: null,
    },
    {
      label: "Pending Listings",
      value: pendingListings,
      icon: ClipboardList,
      color: "text-orange-600",
      bg: "bg-orange-50",
      href: "/admin/listings",
    },
  ];

  return (
    <div>
      <TopBar title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-slate-200 p-5 relative"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-500 font-medium">
                  {stat.label}
                </p>
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              {stat.href && (
                <Link href={stat.href} className="absolute inset-0 rounded-xl" aria-label={stat.label} />
              )}
            </div>
          ))}
        </div>

        {/* Recent Quotations */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Quotations
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentQuotations.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-slate-400"
                    >
                      No quotations yet
                    </td>
                  </tr>
                )}
                {recentQuotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      #{q.id.slice(-8)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">
                        {q.user.name}
                      </p>
                      <p className="text-xs text-slate-500">{q.user.email}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {formatINR(Number(q.totalAmount))}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(q.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
