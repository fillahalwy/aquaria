import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
import WondersSection from "@/components/home/WondersSection";
import ReasonSection from "@/components/home/ReasonSection";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0b1017] text-slate-100 selection:bg-amber-400/30 selection:text-amber-200 flex flex-col justify-between">
      {/* 1. Sticky Navigation Bar */}
      <Navbar transparent={true} />

      {/* 2. Panoramic Hero Banner */}
      <HeroSection />

      {/* 2. Showcase Feature: The Wonders Of Aquascape */}
      <WondersSection />

      {/* 3. Value Proposition: Reason For Choosing Us */}
      <ReasonSection />

      {/* 4. Global Footer */}
      <Footer />
    </main>
  );
}

