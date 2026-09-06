"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Logo from "@/components/ui/Logo";

interface NavbarProps {
  transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "SHOWCASE", href: "/showcase" },
    { name: "COMMUNITY", href: "/forum" },
    { name: "PLANNER", href: "/planner" },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled || !transparent
          ? "bg-[#0b1017]/90 backdrop-blur-md border-b border-white/[0.08] py-3.5 shadow-lg shadow-black/40" 
          : "bg-transparent py-5 md:py-7 border-b border-transparent"
      } px-4 sm:px-8 lg:px-14 flex items-center justify-between`}
    >
      {/* Clean Text Logo */}
      <Logo />

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-xs font-semibold tracking-[0.14em] text-slate-300">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.name + link.href}
              href={link.href} 
              className={`relative py-1 uppercase transition-colors group ${
                isActive ? "text-white font-bold" : "text-slate-300 hover:text-amber-300"
              }`}
            >
              {link.name}
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-amber-400 transition-colors rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Auth Actions */}
      <div className="hidden sm:flex items-center gap-3">
        <Link
          href="/auth/login"
          className="px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase text-slate-300 hover:text-white transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/auth/register"
          className="px-4 py-1.5 text-xs font-bold tracking-wider uppercase rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all shadow-sm shadow-amber-400/25"
        >
          Sign Up
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 text-slate-300 hover:text-white"
        aria-label="Toggle Navigation Menu"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#0b1017]/95 border-b border-white/10 backdrop-blur-lg px-6 py-6 flex flex-col gap-4 md:hidden shadow-2xl">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold tracking-wider uppercase text-slate-300 hover:text-amber-400 transition-colors py-2 border-b border-white/5"
            >
              {link.name}
            </Link>
          ))}
          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 text-xs font-semibold tracking-wider uppercase rounded-full border border-white/20 text-white"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 text-xs font-semibold tracking-wider uppercase rounded-full bg-amber-400 text-slate-950 font-bold"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
