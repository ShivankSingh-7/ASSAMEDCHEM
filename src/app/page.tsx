import Link from "next/link";
import { FlaskConical, ArrowRight, ShieldCheck, Pill, Microscope } from "lucide-react";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-600/20">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">ASSAMEDCHAM</span>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <Link
                href={session.user.role === "ADMIN" ? "/admin/dashboard" : "/seller/dashboard"}
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                Sign in
              </Link>
            )}
            <Link
              href={session ? (session.user.role === "ADMIN" ? "/admin/dashboard" : "/seller/dashboard") : "/register"}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all shadow-sm shadow-blue-600/20 hover:shadow-md hover:shadow-blue-600/30 flex items-center gap-2"
            >
              {session ? "Go to Dashboard" : "Get Started"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            ASSAMEDCHAM B2B Platform Live
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
            Pharmaceutical Supply Chain & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
              Bulk Ordering System.
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            A seamless platform for managing pharmaceutical products, tracking medical inventory, and generating automated quotations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={session ? (session.user.role === "ADMIN" ? "/admin/dashboard" : "/seller/dashboard") : "/register"}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-base font-medium px-8 py-4 rounded-full transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {session ? "Go to Dashboard" : "Start Selling Now"}
              <ArrowRight className="w-5 h-5" />
            </Link>
            {!session && (
              <Link
                href="/login"
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-base font-medium px-8 py-4 rounded-full transition-all flex items-center justify-center"
              >
                Sign in to account
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
                <Microscope className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">API Distribution</h3>
              <p className="text-slate-600 leading-relaxed">
                Automatically convert between strict pharmaceutical measurements (mg, kg, mL, L) without manual calculations.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
                <Pill className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Bulk Medical Supplies</h3>
              <p className="text-slate-600 leading-relaxed">
                Sellers can generate precise B2B quotations instantly based on live sterile inventory and dynamic pricing.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Secure Formulations</h3>
              <p className="text-slate-600 leading-relaxed">
                Strict catalog management. Sellers can submit new chemical formulations that require admin safety approval.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
