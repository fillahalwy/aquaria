"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Sparkles,
  Plus,
  Search,
  SlidersHorizontal,
  Flame,
  Clock,
  MessageSquare,
  Loader2,
  Box,
  Leaf,
  Fish,
  Layers,
  Heart,
  RotateCcw
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ShowcaseCard from "@/components/showcase/ShowcaseCard";
import ShowcaseDetailModal from "@/components/showcase/ShowcaseDetailModal";
import CreateShowcaseModal from "@/components/showcase/CreateShowcaseModal";
import { ShowcaseItem } from "@/types/showcase";

const STYLE_FILTERS = [
  "All Styles",
  "Nature Aquarium",
  "Iwagumi",
  "Dutch Style",
  "Biotope",
  "Jungle Style",
  "Nano Paludarium",
];

const SIZE_FILTERS = [
  { label: "All Sizes", value: "all" },
  { label: "Nano (< 45cm)", value: "nano" },
  { label: "Medium (45-75cm)", value: "medium" },
  { label: "Large (> 75cm)", value: "large" },
];

export default function ShowcasePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [showcases, setShowcases] = useState<ShowcaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("All Styles");
  const [selectedSize, setSelectedSize] = useState("all");
  const [selectedSpan, setSelectedSpan] = useState<"all" | "normal" | "tall" | "wide">("all");
  const [sortBy, setSortBy] = useState<"popular" | "latest" | "comments">("popular");

  // Modals state
  const [activeDetailId, setActiveDetailId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingShowcase, setEditingShowcase] = useState<ShowcaseItem | null>(null);

  // Fetch showcases
  const fetchShowcases = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStyle && selectedStyle !== "All Styles") {
        params.append("style", selectedStyle);
      }
      if (selectedSize && selectedSize !== "all") {
        params.append("sizeCategory", selectedSize);
      }
      if (selectedSpan && selectedSpan !== "all") {
        params.append("span", selectedSpan);
      }
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }
      params.append("sort", sortBy);

      const res = await fetch(`/api/showcase?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.showcases) {
        setShowcases(data.showcases);
      }
    } catch (err) {
      console.error("Failed to load showcase gallery:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStyle, selectedSize, selectedSpan, searchQuery, sortBy]);

  // Debounce search/filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchShowcases();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchShowcases]);

  // Statistics calculation for hero pills
  const stats = useMemo(() => {
    const totalLikes = showcases.reduce((acc, curr) => acc + curr.likesCount, 0);
    const plantSet = new Set<string>();
    const faunaSet = new Set<string>();
    showcases.forEach((item) => {
      item.plants?.forEach((p) => plantSet.add(p.toLowerCase()));
      item.fauna?.forEach((f) => faunaSet.add(f.toLowerCase()));
    });
    return {
      totalShowcases: showcases.length,
      totalLikes,
      uniquePlants: plantSet.size,
      uniqueFauna: faunaSet.size,
    };
  }, [showcases]);

  // Handlers
  const handleOpenDetail = (item: ShowcaseItem) => {
    setActiveDetailId(item.id);
    setIsDetailModalOpen(true);
  };

  const handleOpenCreate = () => {
    if (!session?.user) {
      router.push(`/auth/login?callbackUrl=/showcase`);
      return;
    }
    setEditingShowcase(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (item: ShowcaseItem) => {
    setEditingShowcase(item);
    setIsCreateModalOpen(true);
  };

  const handleShowcaseCreatedOrUpdated = (savedItem: ShowcaseItem, isEdit: boolean) => {
    if (isEdit) {
      setShowcases((prev) =>
        prev.map((item) => (item.id === savedItem.id ? { ...item, ...savedItem } : item))
      );
    } else {
      setShowcases((prev) => [savedItem, ...prev]);
    }
  };

  const handleShowcaseDeleted = (deletedId: string) => {
    setShowcases((prev) => prev.filter((item) => item.id !== deletedId));
  };

  const handleLikeUpdate = (id: string, newCount: number, hasLiked: boolean) => {
    setShowcases((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, likesCount: newCount, hasLiked } : item
      )
    );
  };

  const handleResetFilters = () => {
    setSelectedStyle("All Styles");
    setSelectedSize("all");
    setSelectedSpan("all");
    setSearchQuery("");
    setSortBy("popular");
  };

  const hasActiveFilters =
    selectedStyle !== "All Styles" ||
    selectedSize !== "all" ||
    selectedSpan !== "all" ||
    searchQuery.trim().length > 0 ||
    sortBy !== "popular";

  return (
    <div className="min-h-screen bg-[#0b1017] text-slate-100 flex flex-col justify-between selection:bg-amber-400/30 selection:text-amber-200">
      {/* Global Navigation Bar */}
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* 1. Hero Header */}
        <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 md:p-12 mb-10 border border-white/10 bg-gradient-to-br from-slate-900 via-[#0d1622] to-slate-950 shadow-2xl shadow-black/50">
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-medium tracking-wide uppercase mb-4">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Curated Community Showcase</span>
              </div>

              <h1 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-normal tracking-wide text-white leading-tight">
                Masterpiece Aquascape Gallery
              </h1>

              <p className="mt-3 text-sm sm:text-base text-slate-400 font-light leading-relaxed">
                Discover world-class planted aquarium layouts, technical lighting parameters, CO2 injection setups, and verified flora/fauna architectures from aquascapers worldwide.
              </p>

              {/* Statistics Pill Counters */}
              <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/10 flex items-center gap-2 text-xs">
                  <Box className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold text-white">{stats.totalShowcases}</span>
                  <span className="text-slate-400">Tanks</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/10 flex items-center gap-2 text-xs">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span className="font-semibold text-white">{stats.totalLikes}</span>
                  <span className="text-slate-400">Likes</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/10 flex items-center gap-2 text-xs">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-white">{stats.uniquePlants}</span>
                  <span className="text-slate-400">Flora Species</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/10 flex items-center gap-2 text-xs">
                  <Fish className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-semibold text-white">{stats.uniqueFauna}</span>
                  <span className="text-slate-400">Fauna Species</span>
                </div>
              </div>
            </div>

            {/* CTA Button: Share Showcase */}
            <div className="shrink-0">
              <button
                type="button"
                onClick={handleOpenCreate}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-sm tracking-wide transition-all duration-300 shadow-lg shadow-amber-400/25 hover:shadow-amber-400/40 hover:scale-[1.02] flex items-center justify-center gap-2.5"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span>Submit Your Tank</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Search & Multi-Filter Control Bar */}
        <div className="space-y-4 mb-8">
          {/* Top Filter Row: Search Input + Sorting Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, flora (e.g. Rotala), fauna, or creator..."
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-900/90 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sorting Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900/90 border border-white/10 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setSortBy("popular")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                  sortBy === "popular"
                    ? "bg-amber-400 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Popular</span>
              </button>

              <button
                type="button"
                onClick={() => setSortBy("latest")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                  sortBy === "latest"
                    ? "bg-amber-400 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Latest</span>
              </button>

              <button
                type="button"
                onClick={() => setSortBy("comments")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                  sortBy === "comments"
                    ? "bg-amber-400 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Discussed</span>
              </button>
            </div>
          </div>

          {/* Secondary Filter Chips Row: Style & Tank Sizes */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {/* Style Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {STYLE_FILTERS.map((styleName) => (
                <button
                  key={styleName}
                  type="button"
                  onClick={() => setSelectedStyle(styleName)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                    selectedStyle === styleName
                      ? "bg-amber-400/20 border border-amber-400/60 text-amber-300 shadow-sm shadow-amber-500/10"
                      : "bg-slate-900/60 border border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/20"
                  }`}
                >
                  {styleName}
                </button>
              ))}
            </div>

            {/* Size Dropdown / Buttons & Reset */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5">
                {SIZE_FILTERS.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => setSelectedSize(size.value)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                      selectedSize === size.value
                        ? "bg-slate-800 text-amber-300 border border-amber-400/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Showcase Gallery Grid */}
        {isLoading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[340px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl border border-white/5 bg-slate-900/40 animate-pulse flex flex-col justify-end p-6"
              >
                <div className="w-24 h-4 bg-slate-800 rounded-full mb-3" />
                <div className="w-3/4 h-6 bg-slate-800 rounded-xl mb-4" />
                <div className="w-full h-8 bg-slate-800/60 rounded-xl" />
              </div>
            ))}
          </div>
        ) : showcases.length === 0 ? (
          /* Empty Search / Filter State */
          <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
            <Box className="w-12 h-12 text-amber-400/60 mb-3" />
            <h3 className="font-serif-luxury text-xl font-medium text-white mb-1">
              No Showcase Found
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              We couldn&apos;t find any aquascapes matching your current filters or search terms.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
              >
                Clear Filters
              </button>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 text-xs font-semibold transition"
              >
                Submit New Tank
              </button>
            </div>
          </div>
        ) : (
          /* Bento / Masonry Gallery Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[380px] grid-flow-dense">
            {showcases.map((showcase) => (
              <ShowcaseCard
                key={showcase.id}
                showcase={showcase}
                onOpenDetail={handleOpenDetail}
                onLikeUpdate={handleLikeUpdate}
              />
            ))}
          </div>
        )}
      </main>

      {/* 4. Global Footer */}
      <Footer />

      {/* 5. Detail Lightbox Modal */}
      <ShowcaseDetailModal
        showcaseId={activeDetailId}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setActiveDetailId(null);
        }}
        onEdit={handleOpenEdit}
        onDelete={handleShowcaseDeleted}
      />

      {/* 6. Create / Edit Modal */}
      <CreateShowcaseModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingShowcase(null);
        }}
        onSuccess={handleShowcaseCreatedOrUpdated}
        initialData={editingShowcase}
      />
    </div>
  );
}
