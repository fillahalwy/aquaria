import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#070b10] py-12 px-4 sm:px-8 lg:px-14 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        
        {/* Brand Column */}
        <div className="md:col-span-2">
          <Logo className="mb-4" />
          <p className="max-w-md text-slate-400 leading-relaxed mt-2 text-xs">
            The premier digital hub for aquascaping enthusiasts. Discover curated inspiration, calculate gear parameters, and connect with creators worldwide.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200 mb-3">
            Explore
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/showcase" className="hover:text-amber-400 transition-colors">
                Showcase Gallery
              </Link>
            </li>
            <li>
              <Link href="/forum" className="hover:text-amber-400 transition-colors">
                Community Forum
              </Link>
            </li>
            <li>
              <Link href="/planner" className="hover:text-amber-400 transition-colors">
                Tank Planner & Calculator
              </Link>
            </li>
          </ul>
        </div>

        {/* Account & Legal */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200 mb-3">
            Account
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/auth/login" className="hover:text-amber-400 transition-colors">
                Sign In
              </Link>
            </li>
            <li>
              <Link href="/auth/register" className="hover:text-amber-400 transition-colors">
                Create Account
              </Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-amber-400 transition-colors">
                User Dashboard
              </Link>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-500">
        <p className="text-[11px] tracking-wider uppercase text-slate-600">© {new Date().getFullYear()} Aquaria. All rights reserved.</p>
      </div>
    </footer>
  );
}
