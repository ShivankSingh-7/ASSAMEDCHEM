export const dynamic = "force-dynamic";

import SellerSidebar from "@/components/seller/SellerSidebar";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <SellerSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
