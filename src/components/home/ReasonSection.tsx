"use client";

import { useState } from "react";
import Link from "next/link";
import { Users2, Sparkles, Calculator } from "lucide-react";

export default function ReasonSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const reasons = [
    {
      id: "community",
      href: "/forum",
      icon: Users2,
      title: "ACTIVE COMMUNITY",
      description:
        "Discuss water chemistry, diagnose algae issues, and exchange expertise with thousands of passionate aquascapers in our Q&A Forum.",
    },
    {
      id: "showcase",
      href: "/showcase",
      icon: Sparkles,
      title: "SHOWCASE YOUR TANK",
      description:
        "Upload your signature aquascape setups, share complete gear and flora-fauna specs, and gain appreciation from a global community.",
    },
    {
      id: "planner",
      href: "/planner",
      icon: Calculator,
      title: "AUTOMATED PLANNER",
      description:
        "Calculate net water volume, required substrate depth, LED lumens and wattage, plus schooling fish bioload in seconds.",
    },
  ];

  return (
    <section className="relative z-10 py-24 px-4 sm:px-8 lg:px-14 max-w-7xl mx-auto text-center">
      
      {/* Section Heading */}
      <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-normal text-white mb-16 tracking-wide">
        Platform Built for Aquascapers
      </h2>

      {/* 3 Column Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto mb-20 items-stretch">
        {reasons.map((item, index) => {
          const Icon = item.icon;
          const isHovered = hoveredIndex === index;
          return (
            <Link 
              key={item.id}
              href={item.href} 
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              {/* Minimalist Outline Icon */}
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                <Icon 
                  className={`w-12 h-12 stroke-[1.25] transition-colors duration-300 ${
                    isHovered ? "text-amber-400" : "text-slate-200 group-hover:text-amber-400"
                  }`} 
                />
              </div>
              
              {/* Title */}
              <h3 
                className={`text-xs sm:text-sm font-bold tracking-[0.18em] uppercase mb-4 transition-colors duration-300 ${
                  isHovered ? "text-amber-400" : "text-slate-200 group-hover:text-amber-400"
                }`}
              >
                {item.title}
              </h3>
              
              {/* Pill Capsule Description */}
              <div 
                className={`pill-capsule w-full mt-auto transition-all duration-300 ${
                  isHovered ? "border-amber-400/70 text-white bg-[#0e1520]/80 shadow-lg shadow-amber-400/5 -translate-y-1" : ""
                }`}
              >
                {item.description}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Accent Line & Dynamic Hover-Following Indicator */}
      <div className="max-w-5xl mx-auto relative pt-8 border-t border-slate-800/80">
        <div 
          className={`hidden md:flex absolute -top-[1.5px] w-1/3 justify-center transition-all duration-300 ease-out pointer-events-none ${
            hoveredIndex === null ? "opacity-0" : "opacity-100"
          }`}
          style={{
            left: `${(hoveredIndex ?? 0) * 33.333}%`,
          }}
        >
          <div className="w-28 sm:w-36 h-[3px] bg-amber-400 rounded-full shadow-sm shadow-amber-400/50" />
        </div>
      </div>
    </section>
  );
}
