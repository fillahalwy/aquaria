"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, ArrowRight, AlertCircle, Loader2, CheckCircle2, Globe } from "lucide-react";
import Logo from "@/components/ui/Logo";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your full name (minimum 2 characters).");
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      setError("Username can only contain letters, numbers, and underscores.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          username: cleanUsername,
          email: email.trim() || undefined,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);

      // Auto sign-in after successful registration
      const signInRes = await signIn("credentials", {
        username: cleanUsername,
        password,
        redirect: false,
        callbackUrl,
      });

      if (signInRes?.error) {
        router.push("/auth/login?registered=true");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col justify-between h-full min-h-[500px]">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-5">
        <Logo />
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-300">
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span>EN</span>
        </div>
      </div>

      {/* Main Form Center */}
      <div className="my-auto max-w-sm w-full mx-auto py-1">
        {/* Title Header */}
        <div className="text-center mb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
            Join Aquaria
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create your aquascaper account
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-3.5 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>Account created! Signing you in...</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-3.5 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-2.5">
          {/* Full Name (Required) */}
          <div>
            <input
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name *"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#070b10] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-sans"
            />
          </div>

          {/* Username (Required) */}
          <div>
            <input
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username *"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#070b10] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-sans"
            />
          </div>

          {/* Email (Optional) */}
          <div>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (Optional)"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#070b10] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-sans"
            />
          </div>

          {/* Password */}
          <div className="relative flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 characters) *"
              className="w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-[#070b10] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-sans"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-slate-400 hover:text-slate-200"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative flex items-center">
            <input
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password *"
              className="w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-[#070b10] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-sans"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 text-slate-400 hover:text-slate-200"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full !mt-4 py-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Register</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch Link */}
        <div className="mt-4 text-center text-xs text-slate-400">
          <span>Already have an account? </span>
          <Link
            href={`/auth/login${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
            className="font-bold text-amber-400 hover:text-amber-300 transition-colors ml-1"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Bottom Social Icons */}
      <div className="flex items-center justify-center gap-5 pt-5 text-slate-500">
        <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors" aria-label="GitHub">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </a>
        <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors" aria-label="X / Twitter">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors" aria-label="Instagram">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </a>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#0b1017] text-slate-100 selection:bg-amber-400/30 selection:text-amber-200 flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Unified Connected Container with sharper corners */}
      <div className="max-w-4xl w-full mx-auto bg-[#0e1520] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Full-bleed image seamlessly connected */}
        <div className="relative w-full min-h-[260px] sm:min-h-[340px] md:min-h-full">
          <Image
            src="/images/hero-aquascape.jpg"
            alt="Nature Aquarium Aquascape"
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Right Side: Form Area */}
        <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
          <Suspense fallback={<div className="text-xs text-slate-400 p-8">Loading...</div>}>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
