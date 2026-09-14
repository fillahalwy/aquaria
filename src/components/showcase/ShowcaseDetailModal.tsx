"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  X,
  Heart,
  MessageSquare,
  Share2,
  Trash2,
  Edit3,
  Sparkles,
  Leaf,
  Fish,
  Sun,
  Wind,
  Layers,
  Box,
  Send,
  Loader2,
  Check,
  Calendar,
  User,
  Info
} from "lucide-react";
import { ShowcaseItem, ShowcaseComment } from "@/types/showcase";

interface ShowcaseDetailModalProps {
  showcaseId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (showcase: ShowcaseItem) => void;
  onDelete?: (showcaseId: string) => void;
}

export default function ShowcaseDetailModal({
  showcaseId,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: ShowcaseDetailModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [, startTransition] = useTransition();

  const [showcase, setShowcase] = useState<ShowcaseItem | null>(null);
  const [comments, setComments] = useState<ShowcaseComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"specs" | "comments">("specs");

  // Fetch full details
  useEffect(() => {
    if (!isOpen || !showcaseId) return;

    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/showcase/${showcaseId}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.showcase) {
          setShowcase(data.showcase);
          setComments(data.showcase.comments || []);
        }
      })
      .catch((err) => console.error("Failed to load showcase detail:", err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, showcaseId]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !showcaseId) return null;

  // Toggle Like
  const handleToggleLike = async () => {
    if (!session?.user) {
      router.push(`/auth/login?callbackUrl=/showcase`);
      return;
    }
    if (!showcase || isLiking) return;

    setIsLiking(true);
    const prevLiked = showcase.hasLiked;
    const prevCount = showcase.likesCount;
    const nextLiked = !prevLiked;
    const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

    setShowcase((prev) =>
      prev ? { ...prev, hasLiked: nextLiked, likesCount: nextCount } : null
    );

    try {
      const res = await fetch(`/api/showcase/${showcase.id}/like`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setShowcase((prev) =>
          prev ? { ...prev, hasLiked: data.hasLiked, likesCount: data.likesCount } : null
        );
      } else {
        // Rollback
        setShowcase((prev) =>
          prev ? { ...prev, hasLiked: prevLiked, likesCount: prevCount } : null
        );
      }
    } catch (err) {
      console.error("Like toggle failed:", err);
      setShowcase((prev) =>
        prev ? { ...prev, hasLiked: prevLiked, likesCount: prevCount } : null
      );
    } finally {
      setIsLiking(false);
    }
  };

  // Submit Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      router.push(`/auth/login?callbackUrl=/showcase`);
      return;
    }
    if (!commentText.trim() || !showcase || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/showcase/${showcase.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      const data = await res.json();
      if (data.success && data.comment) {
        setComments((prev) => [...prev, data.comment]);
        setShowcase((prev) =>
          prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : null
        );
        setCommentText("");
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    if (!showcase) return;
    try {
      const res = await fetch(`/api/showcase/${showcase.id}/comment/${commentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setShowcase((prev) =>
          prev ? { ...prev, commentsCount: Math.max(0, prev.commentsCount - 1) } : null
        );
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  // Delete Showcase Post
  const handleDeleteShowcase = async () => {
    if (!showcase) return;
    if (!confirm("Are you sure you want to delete this showcase tank?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/showcase/${showcase.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        onDelete?.(showcase.id);
        onClose();
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (err) {
      console.error("Failed to delete showcase:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy share link
  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/showcase/${showcaseId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Calculate volume if dimensions format is standard (LxWxH cm)
  const calculateVolume = (dimensionsStr: string) => {
    const match = dimensionsStr.match(/(\d+)\s*[xX*×]\s*(\d+)\s*[xX*×]\s*(\d+)/);
    if (!match) return null;
    const l = parseFloat(match[1]);
    const w = parseFloat(match[2]);
    const h = parseFloat(match[3]);
    const liters = Math.round((l * w * h) / 1000);
    const gallons = (liters * 0.264172).toFixed(1);
    return { liters, gallons };
  };

  const volume = showcase ? calculateVolume(showcase.dimensions) : null;
  const isOwner = session?.user?.id === showcase?.author?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col lg:flex-row bg-[#0b1017] border border-white/15 rounded-3xl overflow-hidden shadow-2xl shadow-black/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-slate-950/80 hover:bg-amber-400 hover:text-slate-950 text-slate-300 border border-white/20 backdrop-blur-md transition-all duration-200 shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {isLoading ? (
          <div className="w-full h-[450px] flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <p className="text-sm font-medium">Loading aquascape details...</p>
          </div>
        ) : !showcase ? (
          <div className="w-full h-[400px] flex flex-col items-center justify-center gap-4 text-slate-400 p-6">
            <Info className="w-10 h-10 text-amber-400" />
            <p className="text-base text-white font-medium">Aquascape tank not found.</p>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-sm font-medium transition"
            >
              Back to Gallery
            </button>
          </div>
        ) : (
          <>
            {/* Left Visual Gallery Stage */}
            <div className="relative w-full lg:w-[54%] min-h-[300px] lg:min-h-full bg-black flex items-center justify-center overflow-hidden shrink-0">
              <Image
                src={showcase.imageUrl}
                alt={showcase.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-contain object-center"
              />

              {/* Bottom Subtle Overlay Badges */}
              <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-black/75 backdrop-blur-md border border-amber-400/40 text-amber-300 shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {showcase.style}
                  </span>
                  {volume && (
                    <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-black/75 backdrop-blur-md border border-cyan-400/30 text-cyan-300 shadow-md">
                      ~{volume.liters} L / {volume.gallons} Gal
                    </span>
                  )}
                </div>

                <span className="px-3 py-1 text-xs font-mono rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-slate-300 shadow-md">
                  {showcase.dimensions}
                </span>
              </div>
            </div>

            {/* Right Information & Interaction Panel */}
            <div className="w-full lg:w-[46%] flex flex-col h-full max-h-[92vh] overflow-hidden bg-slate-900/90 border-t lg:border-t-0 lg:border-l border-white/10">
              {/* Header Info */}
              <div className="p-5 sm:p-6 border-b border-white/10 shrink-0 pr-14">
                <div className="flex items-center gap-3 mb-3">
                  {showcase.author.image ? (
                    <Image
                      src={showcase.author.image}
                      alt={showcase.author.name}
                      width={38}
                      height={38}
                      className="rounded-full object-cover border border-amber-400/40"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-xs font-bold text-amber-300">
                      {showcase.author.name?.charAt(0).toUpperCase() || "A"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {showcase.author.name}
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <span>@{showcase.author.username}</span>
                      <span>·</span>
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{new Date(showcase.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </p>
                  </div>
                </div>

                <h2 className="font-serif-luxury text-xl sm:text-2xl font-semibold text-white tracking-wide leading-tight">
                  {showcase.title}
                </h2>

                {/* Social & Action Toolbar */}
                <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    {/* Like Button */}
                    <button
                      type="button"
                      onClick={handleToggleLike}
                      disabled={isLiking}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        showcase.hasLiked
                          ? "bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-md shadow-rose-500/20"
                          : "bg-slate-800/80 border border-white/10 text-slate-300 hover:text-rose-400 hover:border-rose-500/30"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          showcase.hasLiked ? "fill-rose-500 text-rose-500" : ""
                        }`}
                      />
                      <span>{showcase.likesCount} Likes</span>
                    </button>

                    {/* Share Link Button */}
                    <button
                      type="button"
                      onClick={handleCopyShareLink}
                      className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10 transition"
                      title="Copy link to clipboard"
                    >
                      {copiedLink ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Owner Controls (Edit & Delete) */}
                  {isOwner && (
                    <div className="flex items-center gap-1.5">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => {
                            onEdit(showcase);
                            onClose();
                          }}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-300 hover:bg-amber-500/25 transition flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleDeleteShowcase}
                        disabled={isDeleting}
                        className="p-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 transition"
                        title="Delete showcase"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs Switcher: Specs vs Discussion */}
              <div className="flex items-center border-b border-white/10 bg-slate-950/40 px-6 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("specs")}
                  className={`py-3 px-3 text-xs font-semibold tracking-wider uppercase border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === "specs"
                      ? "border-amber-400 text-amber-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>Setup Specs</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("comments")}
                  className={`py-3 px-3 text-xs font-semibold tracking-wider uppercase border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === "comments"
                      ? "border-amber-400 text-amber-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Discussion ({comments.length})</span>
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar">
                {activeTab === "specs" ? (
                  <div className="space-y-6">
                    {/* Story / Description */}
                    {showcase.description && (
                      <div>
                        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                          Aquascape Overview
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed font-light whitespace-pre-line bg-slate-950/40 p-3.5 rounded-2xl border border-white/5">
                          {showcase.description}
                        </p>
                      </div>
                    )}

                    {/* Technical Parameter Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Dimensions & Volume */}
                      <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/10 flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                          <Box className="w-4 h-4 text-amber-400" />
                          <span className="text-[11px] font-mono uppercase tracking-wider">Dimensions & Volume</span>
                        </div>
                        <p className="text-sm font-semibold text-white font-mono">
                          {showcase.dimensions}
                        </p>
                        {volume && (
                          <p className="text-xs text-amber-300/90 mt-0.5 font-mono">
                            ~{volume.liters} Liters ({volume.gallons} Gal)
                          </p>
                        )}
                      </div>

                      {/* Lighting */}
                      <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/10 flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                          <Sun className="w-4 h-4 text-amber-400" />
                          <span className="text-[11px] font-mono uppercase tracking-wider">Lighting System</span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-slate-200">
                          {showcase.lighting || "Standard LED setup"}
                        </p>
                      </div>

                      {/* CO2 System */}
                      <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/10 flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                          <Wind className="w-4 h-4 text-cyan-400" />
                          <span className="text-[11px] font-mono uppercase tracking-wider">CO2 Injection</span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-slate-200">
                          {showcase.co2System || "Low-tech / Non-CO2"}
                        </p>
                      </div>

                      {/* Hardscape */}
                      <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/10 flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                          <Layers className="w-4 h-4 text-amber-500" />
                          <span className="text-[11px] font-mono uppercase tracking-wider">Hardscape & Base</span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-slate-200">
                          {showcase.hardscape || "Natural aquatic substrate"}
                        </p>
                      </div>
                    </div>

                    {/* Flora Species Section */}
                    {showcase.plants && showcase.plants.length > 0 && (
                      <div>
                        <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2.5">
                          <Leaf className="w-3.5 h-3.5" />
                          <span>Aquatic Flora ({showcase.plants.length})</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {showcase.plants.map((plant, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 rounded-xl text-xs bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 font-medium flex items-center gap-1.5"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              {plant}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fauna Species Section */}
                    {showcase.fauna && showcase.fauna.length > 0 && (
                      <div>
                        <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-2.5">
                          <Fish className="w-3.5 h-3.5" />
                          <span>Aquatic Fauna ({showcase.fauna.length})</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {showcase.fauna.map((fauna, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 rounded-xl text-xs bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 font-medium flex items-center gap-1.5"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                              {fauna}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Discussion / Comments Tab */
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No comments yet.</p>
                        <p className="text-xs text-slate-600 mt-1">Be the first to share your thoughts on this aquascape!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {comments.map((comm) => (
                          <div
                            key={comm.id}
                            className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/5 flex gap-3 group"
                          >
                            {comm.author.image ? (
                              <Image
                                src={comm.author.image}
                                alt={comm.author.name}
                                width={30}
                                height={30}
                                className="rounded-full object-cover shrink-0 h-7 w-7 border border-white/10"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-amber-300 shrink-0">
                                {comm.author.name?.charAt(0).toUpperCase() || "A"}
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-xs font-semibold text-slate-200 truncate">
                                    {comm.author.name}
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    @{comm.author.username}
                                  </span>
                                </div>

                                {session?.user?.id === comm.author.id && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(comm.id)}
                                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition p-1"
                                    title="Delete comment"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              <p className="text-xs sm:text-sm text-slate-300 mt-1 whitespace-pre-line leading-relaxed">
                                {comm.content}
                              </p>
                              
                              <span className="text-[10px] text-slate-500 mt-1.5 block">
                                {new Date(comm.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Comment Input Bar (Always active or visible) */}
              <form
                onSubmit={handleAddComment}
                className="p-4 border-t border-white/10 bg-slate-950/80 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    session?.user
                      ? "Write a comment or question about this tank..."
                      : "Sign in to join the conversation..."
                  }
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || isSubmittingComment}
                  className="p-2.5 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium shadow-md shrink-0"
                >
                  {isSubmittingComment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
