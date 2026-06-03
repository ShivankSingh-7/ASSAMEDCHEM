import React from "react";

type BadgeVariant = "pending" | "approved" | "rejected" | "default";

const styles: Record<BadgeVariant, string> = {
  pending:
    "bg-amber-50 text-amber-700 border border-amber-200",
  approved:
    "bg-green-50 text-green-700 border border-green-200",
  rejected:
    "bg-red-50 text-red-700 border border-red-200",
  default:
    "bg-slate-100 text-slate-600 border border-slate-200",
};

export default function StatusBadge({
  status,
}: {
  status: string;
}) {
  const variant = (status?.toLowerCase() as BadgeVariant) ?? "default";
  const cls = styles[variant] ?? styles.default;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          variant === "pending"
            ? "bg-amber-500"
            : variant === "approved"
            ? "bg-green-500"
            : variant === "rejected"
            ? "bg-red-500"
            : "bg-slate-400"
        }`}
      />
      {status}
    </span>
  );
}
