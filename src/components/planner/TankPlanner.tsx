"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Calculator, 
  Droplets, 
  Layers, 
  Sun, 
  Wind, 
  Fish, 
  Copy, 
  Check, 
  RotateCcw,
  Sliders,
  Compass
} from "lucide-react";
import { 
  PlannerInputs, 
  calculatePlannerResults, 
  TANK_PRESETS, 
  AQUASCAPE_STYLES 
} from "@/lib/planner";
import TankVisualizer from "@/components/planner/TankVisualizer";

export default function TankPlanner() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("ada-60p");
  const [copied, setCopied] = useState<boolean>(false);

  const [inputs, setInputs] = useState<PlannerInputs>({
    dimensions: { length: 60, width: 30, height: 36 },
    substrateDepth: 4,
    hasCo2: true,
    aquascapeStyle: "nature",
  });

  // Calculate live results
  const results = useMemo(() => calculatePlannerResults(inputs), [inputs]);

  // Handle preset select
  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = TANK_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setInputs((prev) => ({
        ...prev,
        dimensions: { ...preset.dimensions },
      }));
    }
  };

  // Handle custom dimension changes
  const handleDimensionChange = (key: "length" | "width" | "height", value: number) => {
    setSelectedPresetId("custom");
    setInputs((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [key]: Math.max(1, value || 0),
      },
    }));
  };

  // Reset to default
  const handleReset = () => {
    handlePresetSelect("ada-60p");
    setInputs({
      dimensions: { length: 60, width: 30, height: 36 },
      substrateDepth: 4,
      hasCo2: true,
      aquascapeStyle: "nature",
    });
  };

  // Copy Setup Summary to Clipboard
  const handleCopySummary = async () => {
    const summary = `🌿 AQUARIA TANK SETUP SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 Dimensions: ${inputs.dimensions.length} × ${inputs.dimensions.width} × ${inputs.dimensions.height} cm
💧 Water Volume: ${results.grossVolumeLiters}L Gross | ${results.netVolumeLiters}L Net (${results.netVolumeGallons} Gal)
🌱 Substrate Required: ${results.substrateVolumeLiters}L (~${results.substrateBags9L}x 9L bag) for ${inputs.substrateDepth}cm depth
💡 Lighting Target: ${results.targetLumens.toLocaleString()} Lumens (~${results.estimatedWatts}W LED, ${inputs.hasCo2 ? "High-Tech with CO2" : "Low-Tech"})
🔄 Recommended Filtration: ${results.recommendedFlowMinLpH} - ${results.recommendedFlowMaxLpH} L/h (5-10x turnover)
🐟 Bioload Capacity: Max ${results.maxSchoolingFish} schooling fish & ${results.maxDwarfShrimp} dwarf shrimp
━━━━━━━━━━━━━━━━━━━━━━━━━━
Calculated with Aquaria Tank Planner`;

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy summary: ", err);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-14 py-12">
      
      {/* Top Presets Quick Selector Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300 flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            Standard Aquascape Presets
          </label>
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
          {TANK_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={`px-3.5 py-2.5 rounded-xl border text-left transition-all duration-200 ${
                  isSelected
                    ? "bg-amber-400/10 border-amber-400 text-white shadow-md shadow-amber-400/10"
                    : "bg-[#0e1520]/80 border-white/[0.08] text-slate-300 hover:border-white/20 hover:text-white"
                }`}
              >
                <p className="text-xs font-bold truncate">{preset.name}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{preset.subtitle}</p>
              </button>
            );
          })}

          {/* Custom Option Button */}
          <button
            onClick={() => setSelectedPresetId("custom")}
            className={`px-3.5 py-2.5 rounded-xl border text-left transition-all duration-200 ${
              selectedPresetId === "custom"
                ? "bg-amber-400/10 border-amber-400 text-white shadow-md shadow-amber-400/10"
                : "bg-[#0e1520]/80 border-white/[0.08] text-slate-300 hover:border-white/20 hover:text-white"
            }`}
          >
            <p className="text-xs font-bold truncate">Custom Size</p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">Your Choice</p>
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs + Visualizer Left & Calculation Cards Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Controls & Visualizer (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Dimension Controls Panel */}
          <div className="rounded-2xl bg-[#0e1520] border border-white/[0.08] p-6 shadow-xl backdrop-blur-md">
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white mb-5 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              Tank Dimensions & Parameters
            </h3>

            {/* Dimension Sliders & Inputs */}
            <div className="space-y-4">
              {/* Length */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">Length (P)</span>
                  <span className="text-amber-400 font-mono font-bold">{inputs.dimensions.length} cm</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="15"
                    max="200"
                    step="1"
                    value={inputs.dimensions.length}
                    onChange={(e) => handleDimensionChange("length", Number(e.target.value))}
                    className="flex-1 accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min="1"
                    value={inputs.dimensions.length}
                    onChange={(e) => handleDimensionChange("length", Number(e.target.value))}
                    className="w-16 px-2 py-1 rounded-lg bg-[#070b10] border border-white/10 text-xs font-mono text-white text-center focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Width */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">Width / Depth (L)</span>
                  <span className="text-amber-400 font-mono font-bold">{inputs.dimensions.width} cm</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="15"
                    max="100"
                    step="1"
                    value={inputs.dimensions.width}
                    onChange={(e) => handleDimensionChange("width", Number(e.target.value))}
                    className="flex-1 accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min="1"
                    value={inputs.dimensions.width}
                    onChange={(e) => handleDimensionChange("width", Number(e.target.value))}
                    className="w-16 px-2 py-1 rounded-lg bg-[#070b10] border border-white/10 text-xs font-mono text-white text-center focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Height */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">Height (T)</span>
                  <span className="text-amber-400 font-mono font-bold">{inputs.dimensions.height} cm</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="15"
                    max="100"
                    step="1"
                    value={inputs.dimensions.height}
                    onChange={(e) => handleDimensionChange("height", Number(e.target.value))}
                    className="flex-1 accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min="1"
                    value={inputs.dimensions.height}
                    onChange={(e) => handleDimensionChange("height", Number(e.target.value))}
                    className="w-16 px-2 py-1 rounded-lg bg-[#070b10] border border-white/10 text-xs font-mono text-white text-center focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Substrate Thickness */}
              <div className="pt-2 border-t border-white/5">
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">Target Substrate Depth</span>
                  <span className="text-amber-400 font-mono font-bold">{inputs.substrateDepth} cm</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="0.5"
                    value={inputs.substrateDepth}
                    onChange={(e) => setInputs((prev) => ({ ...prev, substrateDepth: Number(e.target.value) }))}
                    className="flex-1 accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="w-16 text-center text-xs font-mono text-slate-400">
                    {inputs.substrateDepth} cm
                  </span>
                </div>
              </div>

              {/* CO2 System Toggle Switch */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Pressurized CO₂ Injection</p>
                  <p className="text-[11px] text-slate-400">
                    {inputs.hasCo2 ? "High-Tech (Target: 45 lm/L)" : "Low-Tech (Target: 25 lm/L)"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setInputs((prev) => ({ ...prev, hasCo2: !prev.hasCo2 }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    inputs.hasCo2 ? "bg-amber-400" : "bg-slate-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                      inputs.hasCo2 ? "translate-x-5" : "translate-x-0 bg-slate-400"
                    }`}
                  />
                </button>
              </div>

              {/* Aquascape Style Selector */}
              <div className="pt-3 border-t border-white/5">
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  Aquascape Style / Layout
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AQUASCAPE_STYLES.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setInputs((prev) => ({ ...prev, aquascapeStyle: style.id }))}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        inputs.aquascapeStyle === style.id
                          ? "bg-amber-400/10 border-amber-400/60 text-white"
                          : "bg-[#070b10] border-white/5 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <p className="text-xs font-bold">{style.name}</p>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Interactive Visualizer Schematic */}
          <TankVisualizer
            dimensions={inputs.dimensions}
            substrateDepth={inputs.substrateDepth}
            hasCo2={inputs.hasCo2}
            netVolumeLiters={results.netVolumeLiters}
            grossVolumeLiters={results.grossVolumeLiters}
          />

        </div>


        {/* Right Column: Real-Time Results Cards (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Header Action Bar */}
          <div className="flex items-center justify-between">
            <h3 className="font-serif-luxury text-2xl font-normal text-white tracking-wide">
              Technical Calculation Breakdown
            </h3>
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-amber-400 hover:text-slate-950 border border-white/10 hover:border-amber-400 transition-all text-xs font-semibold text-slate-200"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Summary</span>
                </>
              )}
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Card 1: Water Volume */}
            <div className="rounded-2xl bg-[#0e1520] border border-white/[0.08] p-5 shadow-lg relative overflow-hidden group hover:border-amber-400/40 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  Water Volume
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  -15% Displacement
                </span>
              </div>
              
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-extrabold font-mono text-white">
                  {results.netVolumeLiters}
                </span>
                <span className="text-sm font-semibold text-slate-400">Net Liters</span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 mt-3 border-t border-white/5">
                <span>Gross: <strong className="text-slate-200 font-mono">{results.grossVolumeLiters} L</strong></span>
                <span>US Gallons: <strong className="text-slate-200 font-mono">{results.netVolumeGallons} Gal</strong></span>
              </div>
            </div>

            {/* Card 2: Substrate Requirement */}
            <div className="rounded-2xl bg-[#0e1520] border border-white/[0.08] p-5 shadow-lg relative overflow-hidden group hover:border-amber-400/40 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-500" />
                  Substrate Base
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {inputs.substrateDepth} cm depth
                </span>
              </div>
              
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-extrabold font-mono text-amber-400">
                  {results.substrateVolumeLiters}
                </span>
                <span className="text-sm font-semibold text-slate-400">Liters Needed</span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 mt-3 border-t border-white/5">
                <span>Standard: <strong className="text-slate-200 font-mono">{results.substrateBags9L} × 9L Bag</strong></span>
                <span>or <strong className="text-slate-200 font-mono">{results.substrateBags3L} × 3L</strong></span>
              </div>
            </div>

            {/* Card 3: Lighting & Energy */}
            <div className="rounded-2xl bg-[#0e1520] border border-white/[0.08] p-5 shadow-lg relative overflow-hidden group hover:border-amber-400/40 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-yellow-400" />
                  Target Lighting
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  {results.lightingClassification} Intensity
                </span>
              </div>
              
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-extrabold font-mono text-white">
                  {results.targetLumens.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-slate-400">Lumens</span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 mt-3 border-t border-white/5">
                <span>Est. LED Wattage: <strong className="text-slate-200 font-mono">~{results.estimatedWatts} W</strong></span>
                <span>Ratio: <strong className="text-slate-200 font-mono">{results.lumensPerLiter} lm/L</strong></span>
              </div>
            </div>

            {/* Card 4: Recommended Filtration */}
            <div className="rounded-2xl bg-[#0e1520] border border-white/[0.08] p-5 shadow-lg relative overflow-hidden group hover:border-amber-400/40 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-emerald-400" />
                  Filter Flow Rate
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  5× - 10× turnover
                </span>
              </div>
              
              <div className="flex items-baseline gap-1.5 mb-1 truncate">
                <span className="text-2xl font-extrabold font-mono text-emerald-400">
                  {results.recommendedFlowMinLpH}–{results.recommendedFlowMaxLpH}
                </span>
                <span className="text-xs font-semibold text-slate-400">L/h</span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 mt-3 border-t border-white/5">
                <span>Canister / HOB rating for crystal water clarity</span>
              </div>
            </div>

          </div>

          {/* Card 5: Bioload & Community Guide (Full Width) */}
          <div className="rounded-2xl bg-[#0e1520] border border-white/[0.08] p-6 shadow-lg hover:border-amber-400/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Fish className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Bioload Safety & Stocking Guide
                </h4>
              </div>
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Safe Ecosystem Capacity
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-[#070b10] border border-white/5">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">Small Schooling Fish</p>
                <p className="text-xl font-bold font-mono text-white">
                  Up to {results.maxSchoolingFish} <span className="text-xs font-normal text-slate-400">fish (e.g. Cardinal Tetras, Rasboras)</span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#070b10] border border-white/5">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">Clean-up Dwarf Shrimp</p>
                <p className="text-xl font-bold font-mono text-emerald-400">
                  Up to {results.maxDwarfShrimp} <span className="text-xs font-normal text-slate-400">shrimp (Neocaridina / Amano)</span>
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
              * Note: Always introduce livestock gradually after the nitrogen cycle is fully established (minimum 3–4 weeks after setup).
            </p>
          </div>

          {/* Showcase Explorer CTA Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#0e1520] to-cyan-500/10 border border-amber-400/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" />
                Ready to find setup inspiration?
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Browse our curated community showcase gallery to see how creators style tanks with {inputs.dimensions.length}×{inputs.dimensions.width}×{inputs.dimensions.height} cm dimensions.
              </p>
            </div>
            <Link
              href="/showcase"
              className="px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 shrink-0"
            >
              Explore Showcase
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
