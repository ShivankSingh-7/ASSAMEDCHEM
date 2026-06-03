export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/ui/TopBar";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatINR } from "@/lib/pricing";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default async function SellerDashboard() {
  const session = await auth();

  const quotations = await prisma.quotation.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const allQuotations = await prisma.quotation.findMany({
    where: { userId: session!.user.id },
  });

  const pending = allQuotations.filter((q) => q.status === "PENDING").length;
  const approved = allQuotations.filter((q) => q.status === "APPROVED").length;
  const rejected = allQuotations.filter((q) => q.status === "REJECTED").length;

  const stats = [
    {
      label: "Total Quotations",
      value: allQuotations.length,
      icon: FileText,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Approved",
      value: approved,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Rejected",
      value: rejected,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div>
      <TopBar title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
          <h2 className="text-lg font-semibold">
            Welcome back, {session?.user.name?.split(" ")[0]}! 👋
          </h2>
          <p className="text-green-100 text-sm mt-1">
            Browse products and submit quotation requests.
          </p>
          <Link
            href="/seller/products"
            className="inline-flex items-center mt-4 bg-white text-green-600 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-50 transition-colors"
          >
            Browse Products →
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-slate-200 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Quotations */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent Quotations</h2>
            <Link href="/seller/quotations" className="text-xs text-green-600 hover:text-green-700 font-medium">View all →</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {quotations.length === 0 && (
              <div className="py-10 text-center text-slate-400 text-sm">
                No quotations yet.{" "}
                <Link href="/seller/products" className="text-green-600 hover:underline">
                  Browse products
                </Link>{" "}
                to get started.
              </div>
            )}
            {quotations.map((q) => (
              <div key={q.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    #{q.id.slice(-8)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(q.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {formatINR(Number(q.totalAmount))}
                  </p>
                  <StatusBadge status={q.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
