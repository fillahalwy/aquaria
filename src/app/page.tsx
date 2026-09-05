import Link from "next/link";
import { 
  Compass, 
  Calculator, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Database,
  Flame,
  ArrowRight
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-radial from-[#0d1b2a] via-[#090d16] to-[#04070d] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Aquaria
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <Link href="/showcase" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> Showcase
            </Link>
            <Link href="/planner" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              <Calculator className="w-4 h-4" /> Tank Planner
            </Link>
            <Link href="/forum" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" /> Forum
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 hover:opacity-90 transition-all font-semibold shadow-md shadow-cyan-500/10"
            >
              Daftar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-8">
          <Flame className="w-3.5 h-3.5" /> Platform Komunitas Aquascape Fullstack
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Inspirasi Seni Akuarium, Diskusi Komunitas & Kalkulasi Akurat.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          Platform terpadu untuk para aquascaper: jelajahi setup tangki bergaya visual explore, kalkulasi kebutuhan air & lampu dengan Tank Planner, serta diskusikan masalah parameter air di forum Q&A.
        </p>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-5xl text-left">
          {/* Card 1 */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Showcase Explore</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Masonry grid asimetris dengan hover overlay like, komentar, serta rincian spesifikasi hardscape, flora, & fauna.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <Calculator className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Tank Planner</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Kalkulator instan untuk menghitung volume air gross & net, estimasi kebutuhan substrat, lumens & watt lampu, serta bioload guide.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Community Forum</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ruang tanya jawab terstruktur dengan sistem upvote/downvote, filter tag kategori, dan tanda verified accepted solution.
            </p>
          </div>
        </div>

        {/* Stack Status Badge */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <Layers className="w-3.5 h-3.5 text-cyan-400" /> Next.js 16 (App Router)
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <Database className="w-3.5 h-3.5 text-emerald-400" /> PostgreSQL & Prisma ORM
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> NextAuth.js & Middleware Auth
          </span>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#060910] py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Aquaria Platform. All rights reserved.</p>
      </footer>
    </main>
  );
}
