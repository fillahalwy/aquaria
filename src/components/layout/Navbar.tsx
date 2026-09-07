"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, User as UserIcon, LogOut, ChevronDown } from "lucide-react";
import Logo from "@/components/ui/Logo";

interface NavbarProps {
  transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "SHOWCASE", href: "/showcase" },
    { name: "COMMUNITY", href: "/forum" },
    { name: "PLANNER", href: "/planner" },
  ];

  const handleSignOut = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  const displayName = session?.user?.name || (session?.user as { username?: string })?.username || "Aquascaper";
  const displayUsername = (session?.user as { username?: string })?.username || "";

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

      {/* Auth Actions (Desktop) */}
      <div className="hidden sm:flex items-center gap-3">
        {status === "loading" ? (
          <div className="w-24 h-8 rounded-full bg-white/5 animate-pulse" />
        ) : session?.user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#0e1520] border border-white/10 hover:border-amber-400/40 text-slate-200 hover:text-white transition-all cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs font-bold font-sans">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium max-w-[120px] truncate">
                {displayUsername ? `@${displayUsername}` : displayName}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0e1520] border border-white/10 shadow-2xl p-1.5 backdrop-blur-md z-50">
                <div className="px-3 py-2 border-b border-white/5 mb-1">
                  <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                  {displayUsername && (
                    <p className="text-[11px] text-amber-400/90 font-mono truncate">@{displayUsername}</p>
                  )}
                </div>

                <Link
                  href="/forum"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Community Feed</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
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
          </>
        )}
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

          {session?.user ? (
            <div className="pt-2 border-t border-white/5 space-y-3">
              <div className="flex items-center gap-3 px-1 py-1">
                <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-sm font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{displayName}</p>
                  {displayUsername && (
                    <p className="text-[11px] text-amber-400 font-mono">@{displayUsername}</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold tracking-wider uppercase rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
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
          )}
        </div>
      )}
    </header>
  );
}
