import { auth } from "@/lib/auth";

export default async function TopBar({ title }: { title: string }) {
  const session = await auth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">
            {session?.user.name}
          </p>
          <p className="text-xs text-slate-500">{session?.user.email}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-xs font-bold text-white">
            {session?.user.name?.[0]?.toUpperCase() ?? "U"}
          </span>
        </div>
      </div>
    </header>
  );
}
