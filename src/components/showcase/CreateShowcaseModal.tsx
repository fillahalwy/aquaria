"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Upload,
  Loader2,
  Sparkles,
  Leaf,
  Fish,
  Sun,
  Wind,
  Layers,
  Box,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  HelpCircle,
  Image as ImageIcon
} from "lucide-react";
import { ShowcaseItem, ShowcaseSpan } from "@/types/showcase";

interface CreateShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (showcase: ShowcaseItem, isEdit: boolean) => void;
  initialData?: ShowcaseItem | null;
}

const STYLE_OPTIONS = [
  "Nature Aquarium",
  "Iwagumi",
  "Dutch Style",
  "Biotope",
  "Jungle Style",
  "Nano Paludarium",
  "Wabi-Kusa",
  "Custom / Other",
];

const PRESET_PLANTS = [
  "Rotala Rotundifolia 'H'ra'",
  "Hemianthus Callitrichoides 'Cuba'",
  "Micranthemum 'Monte Carlo'",
  "Glossostigma Elatinoides",
  "Anubias Nana Petite",
  "Bucephalandra Brownie Ghost",
  "Eleocharis Mini",
  "Staurogyne Repens",
  "Java Moss (Taxiphyllum)",
  "Fissidens Fontanus",
];

const PRESET_FAUNA = [
  "Cardinal Tetra (P. axelrodi)",
  "Neon Tetra",
  "Harlequin Rasbora",
  "Chili Rasbora (Boraras brigittae)",
  "Otocinclus Affinis",
  "Amano Shrimp (C. multidentata)",
  "Neocaridina Blue Dream",
  "Crystal Red Shrimp",
  "Corydoras Pygmaeus",
  "German Blue Ram",
];

const SAMPLE_PRESET_IMAGES = [
  { label: "Misty Mountains", url: "/images/hero-aquascape.jpg" },
  { label: "Dragon Rock Canyon", url: "/images/hardscape-aquascape.jpg" },
  { label: "Primeval Emerald", url: "/images/flora-aquascape.jpg" },
  { label: "River Biotope", url: "/images/fauna-aquascape.jpg" },
  { label: "Mineral Substrate", url: "/images/substrate-aquascape.jpg" },
];

export default function CreateShowcaseModal(props: CreateShowcaseModalProps) {
  if (!props.isOpen) return null;

  return (
    <ShowcaseFormModal
      key={props.initialData ? `edit-${props.initialData.id}` : "new-showcase"}
      {...props}
    />
  );
}

function ShowcaseFormModal({
  onClose,
  onSuccess,
  initialData,
}: CreateShowcaseModalProps) {
  const isEdit = !!initialData;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialData?.title || "");
  const [style, setStyle] = useState(initialData?.style || "Nature Aquarium");
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [sizeSpan, setSizeSpan] = useState<ShowcaseSpan>(initialData?.sizeSpan || "normal");
  const [dimensions, setDimensions] = useState(initialData?.dimensions || "60x30x36 cm");
  const [lighting, setLighting] = useState(initialData?.lighting || "");
  const [co2System, setCo2System] = useState(initialData?.co2System || "");
  const [hardscape, setHardscape] = useState(initialData?.hardscape || "");

  // Plants tag chips
  const [plants, setPlants] = useState<string[]>(initialData?.plants || []);
  const [currentPlantInput, setCurrentPlantInput] = useState("");

  // Fauna tag chips
  const [fauna, setFauna] = useState<string[]>(initialData?.fauna || []);
  const [currentFaunaInput, setCurrentFaunaInput] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Image Upload handler with client compression
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError("Image file is too large (maximum 15MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const rawResult = uploadEvent.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIMENSION = 1440;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIMENSION) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setImageUrl(compressedDataUrl);
        } else {
          setImageUrl(rawResult);
        }
      };
      img.onerror = () => {
        setImageUrl(rawResult);
      };
      img.src = rawResult;
    };
    reader.readAsDataURL(file);
  };

  // Add Plant Chip
  const handleAddPlant = (plantName?: string) => {
    const target = plantName || currentPlantInput.trim();
    if (target && !plants.includes(target)) {
      setPlants((prev) => [...prev, target]);
      setCurrentPlantInput("");
    }
  };

  const handleRemovePlant = (index: number) => {
    setPlants((prev) => prev.filter((_, i) => i !== index));
  };

  // Add Fauna Chip
  const handleAddFauna = (faunaName?: string) => {
    const target = faunaName || currentFaunaInput.trim();
    if (target && !fauna.includes(target)) {
      setFauna((prev) => [...prev, target]);
      setCurrentFaunaInput("");
    }
  };

  const handleRemoveFauna = (index: number) => {
    setFauna((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculate volume helper
  const calculateVolume = (dimensionsStr: string) => {
    const match = dimensionsStr.match(/(\d+)\s*[xX*×]\s*(\d+)\s*[xX*×]\s*(\d+)/);
    if (!match) return null;
    const l = parseFloat(match[1]);
    const w = parseFloat(match[2]);
    const h = parseFloat(match[3]);
    const liters = Math.round((l * w * h) / 1000);
    return liters;
  };

  const estimatedLiters = calculateVolume(dimensions);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || title.trim().length < 3) {
      setError("Please provide a title with at least 3 characters.");
      return;
    }

    if (!imageUrl.trim()) {
      setError("Please upload an image or select a preset photo of your tank.");
      return;
    }

    if (!dimensions.trim()) {
      setError("Please specify tank dimensions (e.g. 60x30x36 cm).");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        title: title.trim(),
        style,
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim(),
        sizeSpan,
        dimensions: dimensions.trim(),
        lighting: lighting.trim() || undefined,
        co2System: co2System.trim() || undefined,
        hardscape: hardscape.trim() || undefined,
        plants,
        fauna,
      };

      const url = isEdit ? `/api/showcase/${initialData.id}` : "/api/showcase";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit showcase.");
      }

      onSuccess(data.showcase, isEdit);
      onClose();
    } catch (err: unknown) {
      console.error("Error submitting showcase:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#0b1017] border border-white/15 rounded-3xl overflow-hidden shadow-2xl shadow-black/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div>
            <h3 className="font-serif-luxury text-xl sm:text-2xl font-medium text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              {isEdit ? "Edit Showcase Setup" : "Share Your Aquascape Showcase"}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Inspire the global community with your tank specs, flora, and hardscape architecture.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="p-2 rounded-full bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Photo Upload / Preset Selector */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              Aquascape Photography *
            </label>

            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden aspect-[16/9] border border-amber-400/40 bg-black/60 group">
                <Image
                  src={imageUrl}
                  alt="Showcase preview"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-semibold hover:bg-amber-300 transition"
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="px-4 py-2 rounded-xl bg-rose-500/80 text-white text-xs font-semibold hover:bg-rose-500 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 hover:border-amber-400/60 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 transition text-center"
                >
                  <Upload className="w-10 h-10 text-amber-400 mb-2" />
                  <p className="text-sm font-semibold text-white">
                    Click to upload tank photo
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports high-res PNG, JPG, WEBP (auto-optimized)
                  </p>
                </div>

                {/* Preset test photos */}
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 mb-2 block font-medium">
                    Or select a preset showcase image to test:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {SAMPLE_PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className="group relative rounded-xl overflow-hidden aspect-[4/3] border border-white/10 hover:border-amber-400 transition"
                      >
                        <Image
                          src={preset.url}
                          alt={preset.label}
                          fill
                          className="object-cover group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition flex items-end p-1.5">
                          <span className="text-[10px] text-white font-medium truncate">
                            {preset.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* 2. Title & Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Aquascape Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Whispering Mountain Stream"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Aquascape Style *
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400 transition"
              >
                {STYLE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-slate-900 text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Dimensions & Display Span */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Dimensions (L×W×H cm) *
              </label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="e.g. 60x30x36 cm"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition font-mono"
                required
              />
              {estimatedLiters && (
                <p className="text-[11px] text-amber-300 mt-1 font-mono">
                  Calculated Volume: ~{estimatedLiters} Liters
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Gallery Card Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["normal", "tall", "wide"] as ShowcaseSpan[]).map((span) => (
                  <button
                    key={span}
                    type="button"
                    onClick={() => setSizeSpan(span)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border text-center capitalize transition ${
                      sizeSpan === span
                        ? "bg-amber-400/20 border-amber-400 text-amber-300"
                        : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {span === "normal" ? "Standard" : span}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Technical Specs: Lighting, CO2, Hardscape */}
          <div className="space-y-4 pt-2 border-t border-white/10">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5" />
              <span>Technical Equipment Specifications</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Lighting Unit & Photoperiod
                </label>
                <input
                  type="text"
                  value={lighting}
                  onChange={(e) => setLighting(e.target.value)}
                  placeholder="e.g. Chihiros WRGB II 8h/day"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  CO2 Injection System
                </label>
                <input
                  type="text"
                  value={co2System}
                  onChange={(e) => setCo2System(e.target.value)}
                  placeholder="e.g. Pressurized 2 bps inline"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Hardscape & Substrate
                </label>
                <input
                  type="text"
                  value={hardscape}
                  onChange={(e) => setHardscape(e.target.value)}
                  placeholder="e.g. Seiryu Stone + Amazonia"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>
          </div>

          {/* 5. Flora (Plants) Tag Input */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5" />
              <span>Aquatic Flora (Plants)</span>
            </h4>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={currentPlantInput}
                onChange={(e) => setCurrentPlantInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddPlant();
                  }
                }}
                placeholder="Type plant name and press Enter (e.g. Rotala H'ra)"
                className="flex-1 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition"
              />
              <button
                type="button"
                onClick={() => handleAddPlant()}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-medium transition"
              >
                Add Plant
              </button>
            </div>

            {/* Plants Chips */}
            {plants.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-slate-950/50 border border-white/5">
                {plants.map((plant, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs bg-emerald-950/60 border border-emerald-500/30 text-emerald-200"
                  >
                    <span>{plant}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePlant(idx)}
                      className="hover:text-rose-400 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] text-slate-500">Popular:</span>
              {PRESET_PLANTS.slice(0, 5).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleAddPlant(p)}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition"
                >
                  + {p}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Fauna (Livestock) Tag Input */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Fish className="w-3.5 h-3.5" />
              <span>Aquatic Fauna (Fish & Shrimp)</span>
            </h4>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={currentFaunaInput}
                onChange={(e) => setCurrentFaunaInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFauna();
                  }
                }}
                placeholder="Type fauna name and press Enter (e.g. Cardinal Tetra)"
                className="flex-1 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
              />
              <button
                type="button"
                onClick={() => handleAddFauna()}
                className="px-3.5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-medium transition"
              >
                Add Fauna
              </button>
            </div>

            {/* Fauna Chips */}
            {fauna.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-slate-950/50 border border-white/5">
                {fauna.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs bg-cyan-950/60 border border-cyan-500/30 text-cyan-200"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFauna(idx)}
                      className="hover:text-rose-400 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] text-slate-500">Popular:</span>
              {PRESET_FAUNA.slice(0, 5).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => handleAddFauna(f)}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 transition"
                >
                  + {f}
                </button>
              ))}
            </div>
          </div>

          {/* 7. Tank Story / Description */}
          <div className="pt-2 border-t border-white/10">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Aquascape Story & Care Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your design philosophy, maintenance routine, challenges faced, or age of this layout..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>
        </form>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-white/10 bg-slate-900/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs sm:text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 text-xs sm:text-sm font-semibold transition shadow-lg shadow-amber-400/20 flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Showcase...</span>
              </>
            ) : (
              <span>{isEdit ? "Update Showcase" : "Publish Showcase"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
