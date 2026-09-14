"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Heart, 
  MessageSquare, 
  Maximize2, 
  Sparkles, 
  Leaf, 
  Fish,
  Layers
} from "lucide-react";
import { ShowcaseItem } from "@/types/showcase";

interface ShowcaseCardProps {
  showcase: ShowcaseItem;
  onOpenDetail: (showcase: ShowcaseItem) => void;
  onLikeUpdate?: (id: string, newCount: number, hasLiked: boolean) => void;
}

export default function ShowcaseCard({
  showcase,
  onOpenDetail,
  onLikeUpdate,
}: ShowcaseCardProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [likesCount, setLikesCount] = useState(showcase.likesCount);
  const [hasLiked, setHasLiked] = useState(showcase.hasLiked);
  const [isLiking, setIsLiking] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Handle Like action
  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!session?.user) {
      router.push(`/auth/login?callbackUrl=/showcase`);
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    // Optimistic update
    const prevLiked = hasLiked;
    const prevCount = likesCount;
    const nextLiked = !prevLiked;
    const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

    setHasLiked(nextLiked);
    setLikesCount(nextCount);
    onLikeUpdate?.(showcase.id, nextCount, nextLiked);

    try {
      const res = await fetch(`/api/showcase/${showcase.id}/like`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setLikesCount(data.likesCount);
        setHasLiked(data.hasLiked);
        onLikeUpdate?.(showcase.id, data.likesCount, data.hasLiked);
      } else {
        // Rollback
        setHasLiked(prevLiked);
        setLikesCount(prevCount);
        onLikeUpdate?.(showcase.id, prevCount, prevLiked);
      }
    } catch (err) {
      console.error("Failed to toggle showcase like:", err);
      // Rollback
      setHasLiked(prevLiked);
      setLikesCount(prevCount);
      onLikeUpdate?.(showcase.id, prevCount, prevLiked);
    } finally {
      setIsLiking(false);
    }
  };

  // Determine span class
  const spanClasses = {
    normal: "col-span-1 row-span-1 min-h-[340px] md:min-h-[380px]",
    tall: "col-span-1 row-span-1 md:row-span-2 min-h-[380px] md:min-h-[520px]",
    wide: "col-span-1 md:col-span-2 row-span-1 min-h-[340px] md:min-h-[380px]",
  }[showcase.sizeSpan || "normal"];

  const topPlants = showcase.plants.slice(0, 2);
  const topFauna = showcase.fauna.slice(0, 2);

  return (
    <article
      onClick={() => onOpenDetail(showcase)}
      className={`group relative rounded-3xl overflow-hidden cursor-pointer border border-white/10 hover:border-amber-400/50 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between bg-slate-900/60 backdrop-blur-sm ${spanClasses}`}
    >
      {/* Background Showcase Image */}
      <div className="absolute inset-0 z-0 bg-slate-950 overflow-hidden">
        <Image
          src={showcase.imageUrl}
          alt={showcase.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        {/* Soft luxury vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/20 group-hover:via-slate-950/30 transition-colors duration-500" />
      </div>

      {/* Top Bar Badges */}
      <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Style Badge */}
          <span className="px-3 py-1 text-[11px] font-medium tracking-wide uppercase rounded-full bg-slate-950/70 backdrop-blur-md border border-amber-400/30 text-amber-300 shadow-sm flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {showcase.style || "Nature Aquarium"}
          </span>

          {/* Dimensions Pill */}
          <span className="px-2.5 py-1 text-[11px] font-mono rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-slate-300">
            {showcase.dimensions}
          </span>
        </div>

        {/* Quick View Expand Icon */}
        <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-slate-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-amber-400 hover:text-slate-950">
          <Maximize2 className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="relative z-10 p-4 sm:p-5 flex flex-col justify-end gap-3 mt-auto">
        {/* Flora / Fauna Quick Pills (if any) */}
        {(topPlants.length > 0 || topFauna.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            {topPlants.map((plant, idx) => (
              <span
                key={`plant-${idx}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-emerald-950/60 backdrop-blur-md border border-emerald-500/20 text-emerald-300"
              >
                <Leaf className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[110px]">{plant}</span>
              </span>
            ))}
            {topFauna.map((fauna, idx) => (
              <span
                key={`fauna-${idx}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-cyan-950/60 backdrop-blur-md border border-cyan-500/20 text-cyan-300"
              >
                <Fish className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                <span className="truncate max-w-[110px]">{fauna}</span>
              </span>
            ))}
          </div>
        )}

        {/* Showcase Title */}
        <h3 className="font-serif-luxury text-lg sm:text-xl font-medium tracking-wide text-white group-hover:text-amber-300 transition-colors line-clamp-2">
          {showcase.title}
        </h3>

        {/* Hardscape subtitle preview if available */}
        {showcase.hardscape && (
          <p className="text-xs text-slate-400 line-clamp-1 flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-amber-400/70 shrink-0" />
            <span className="truncate">{showcase.hardscape}</span>
          </p>
        )}

        {/* Creator & Social Actions Footer */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
          {/* Creator Profile */}
          <div className="flex items-center gap-2 min-w-0">
            {showcase.author.image ? (
              <Image
                src={showcase.author.image}
                alt={showcase.author.name}
                width={26}
                height={26}
                className="rounded-full object-cover border border-amber-400/40 shrink-0"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-[11px] font-bold text-amber-300 shrink-0">
                {showcase.author.name?.charAt(0).toUpperCase() || "A"}
              </div>
            )}
            <span className="text-xs text-slate-300 font-medium truncate">
              {showcase.author.name}
            </span>
          </div>

          {/* Likes & Comments Counters */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Like Button */}
            <button
              type="button"
              onClick={handleToggleLike}
              disabled={isLiking}
              aria-label="Like showcase tank"
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${
                hasLiked
                  ? "bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-sm shadow-rose-500/20"
                  : "bg-black/50 border border-white/10 text-slate-300 hover:text-rose-400 hover:border-rose-500/30"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-transform ${
                  hasLiked ? "fill-rose-500 text-rose-500 scale-110" : ""
                }`}
              />
              <span>{likesCount}</span>
            </button>

            {/* Comments Counter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-black/40 px-2 py-1 rounded-full border border-white/5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>{showcase.commentsCount}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
