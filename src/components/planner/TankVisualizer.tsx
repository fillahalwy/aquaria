"use client";

import { TankDimensions } from "@/lib/planner";

interface TankVisualizerProps {
  dimensions: TankDimensions;
  substrateDepth: number;
  hasCo2: boolean;
  netVolumeLiters: number;
  grossVolumeLiters: number;
}

export default function TankVisualizer({
  dimensions,
  substrateDepth,
  hasCo2,
  netVolumeLiters,
  grossVolumeLiters,
}: TankVisualizerProps) {
  const { length, width, height } = dimensions;

  // Calculate proportional visual heights
  const substratePercentage = Math.min(35, Math.max(8, (substrateDepth / height) * 100));
  const waterPercentage = 88; // 88% filled water line

  return (
    <div className="relative w-full rounded-2xl bg-[#070b10] border border-white/[0.08] p-6 flex flex-col items-center justify-between overflow-hidden shadow-2xl">
      {/* Background ambient lighting */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-cyan-500/10 via-emerald-500/5 to-transparent pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="w-full flex items-center justify-between mb-6 z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-semibold tracking-widest uppercase text-slate-300">
            Live Tank Schematic
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-amber-400 font-mono font-bold">
            {length} × {width} × {height} cm
          </span>
          {hasCo2 && (
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider">
              CO₂ High-Tech
            </span>
          )}
        </div>
      </div>

      {/* Tank 3D/Glass Model Container */}
      <div className="relative w-full max-w-sm my-6 py-4 flex flex-col items-center justify-center">
        {/* Dimension Label: Top (Length) */}
        <div className="w-full flex items-center justify-center gap-2 text-[11px] font-mono text-slate-400 mb-2">
          <span className="w-12 h-[1px] bg-slate-700" />
          <span className="text-slate-300 font-semibold">{length} cm (Length)</span>
          <span className="w-12 h-[1px] bg-slate-700" />
        </div>

        {/* The Glass Aquarium Box */}
        <div className="relative w-full h-56 sm:h-64 rounded-xl border-2 border-cyan-400/30 bg-[#0e1622]/60 backdrop-blur-md overflow-hidden shadow-inner flex flex-col justify-end">
          {/* Glass Rim highlight */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400/40 via-white/50 to-cyan-400/40" />

          {/* Water Fill Layer */}
          <div 
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cyan-900/30 via-cyan-600/15 to-cyan-400/10 transition-all duration-500"
            style={{ height: `${waterPercentage}%` }}
          >
            {/* Water Surface Line */}
            <div className="w-full h-1 bg-gradient-to-r from-cyan-300/40 via-white/60 to-cyan-300/40 opacity-80" />
            
            {/* Shimmering Water Light Rays */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-300/10 to-transparent pointer-events-none" />

            {/* Pearling / Bubble Animation effect */}
            <div className="absolute bottom-16 left-1/4 w-1.5 h-1.5 rounded-full bg-white/40 animate-ping" />
            <div className="absolute bottom-24 right-1/3 w-1 h-1 rounded-full bg-cyan-200/50 animate-pulse" />
          </div>

          {/* Substrate Soil Base Layer */}
          <div 
            className="relative w-full bg-gradient-to-t from-[#120f0c] via-[#1c1813] to-[#2b241c] border-t border-amber-900/40 transition-all duration-300 flex items-center justify-between px-3"
            style={{ height: `${substratePercentage}%` }}
          >
            {/* Granular Texture Accent */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:6px_6px]" />
            <span className="relative z-10 text-[10px] font-mono font-medium text-amber-200/70 tracking-wider">
              Aqua Soil: {substrateDepth} cm
            </span>
            <span className="relative z-10 text-[9px] font-mono text-amber-400/80">
              ~{((length * width * substrateDepth) / 1000).toFixed(1)} L
            </span>
          </div>

          {/* Side Glare Reflections */}
          <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
        </div>

        {/* Height and Width Indicators */}
        <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 px-1">
          <span>Height: {height} cm</span>
          <span>Width / Depth: {width} cm</span>
        </div>
      </div>

      {/* Bottom Summary Bar inside visualizer */}
      <div className="w-full pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs z-10">
        <div>
          <span className="text-slate-400 text-[11px]">Gross Volume: </span>
          <span className="text-white font-bold font-mono">{grossVolumeLiters} L</span>
        </div>
        <div>
          <span className="text-slate-400 text-[11px]">Net Water: </span>
          <span className="text-amber-400 font-bold font-mono">{netVolumeLiters} L</span>
        </div>
      </div>
    </div>
  );
}
