import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TankPlanner from "@/components/planner/TankPlanner";

export const metadata: Metadata = {
  title: "Tank Planner & Equipment Calculator - Aquaria",
  description:
    "Instant precision calculator for aquascapers. Calculate net water volume, aqua soil substrate requirements, target lighting lumens/watts, filter turnover, and bioload limits.",
};

export default function PlannerPage() {
  return (
    <main className="min-h-screen bg-[#0b1017] text-slate-100 selection:bg-amber-400/30 selection:text-amber-200 flex flex-col justify-between">
      {/* 1. Sticky Navigation Bar */}
      <Navbar transparent={false} />

      {/* 2. Editorial Header Section */}
      <section className="relative z-10 pt-16 pb-6 px-4 sm:px-8 lg:px-14 max-w-7xl mx-auto text-center">
        {/* Subtle Ambient Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Small Top Tagline */}
        <p className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-amber-400 mb-3 drop-shadow-sm">
          Precision Aquascaping Tool
        </p>

        {/* Serif Luxury Title */}
        <h1 className="font-serif-luxury text-3xl sm:text-5xl md:text-6xl font-normal text-white tracking-wide max-w-4xl mx-auto leading-tight">
          Tank Setup Planner & Calculator
        </h1>

        {/* Subtitle */}
        <p className="mt-4 max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-slate-300 font-light tracking-wide leading-relaxed">
          Configure tank dimensions, calculate gross and net water volume, estimate required aqua soil bags, determine LED lumens and wattage, and check safe bioload limits instantly.
        </p>
      </section>

      {/* 3. Interactive Tank Planner Component */}
      <TankPlanner />

      {/* 4. Global Footer */}
      <Footer />
    </main>
  );
}
