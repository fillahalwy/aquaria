"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
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
  AlertCircle
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CreateShowcaseModal from "@/components/showcase/CreateShowcaseModal";
import { ShowcaseItem, ShowcaseComment } from "@/types/showcase";

export default function ShowcaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const [showcase, setShowcase] = useState<ShowcaseItem | null>(null);
  const [comments, setComments] = useState<ShowcaseComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/showcase/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.showcase) {
          setShowcase(data.showcase);
          setComments(data.showcase.comments || []);
        } else {
          setError(data.error || "Aquascape showcase not found.");
        }
      })
      .catch((err) => {
        if (isMounted) setError("Failed to load showcase setup.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleToggleLike = async () => {
    if (!session?.user) {
      router.push(`/auth/login?callbackUrl=/showcase/${id}`);
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
      const res = await fetch(`/api/showcase/${id}/like`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setShowcase((prev) =>
          prev ? { ...prev, hasLiked: data.hasLiked, likesCount: data.likesCount } : null
        );
      } else {
        setShowcase((prev) =>
          prev ? { ...prev, hasLiked: prevLiked, likesCount: prevCount } : null
        );
      }
    } catch {
      setShowcase((prev) =>
        prev ? { ...prev, hasLiked: prevLiked, likesCount: prevCount } : null
      );
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      router.push(`/auth/login?callbackUrl=/showcase/${id}`);
      return;
    }
    if (!commentText.trim() || !showcase || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/showcase/${id}/comment`, {
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

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/showcase/${id}/comment/${commentId}`, {
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

  const handleDeleteShowcase = async () => {
    if (!confirm("Are you sure you want to delete this showcase tank?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/showcase/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        router.push("/showcase");
      }
    } catch (err) {
      console.error("Failed to delete showcase:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

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
    <div className="min-h-screen bg-[#0b1017] text-slate-100 flex flex-col justify-between selection:bg-amber-400/30 selection:text-amber-200">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Top Back Navigation Bar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/showcase"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Showcase Gallery</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-xs font-medium text-slate-300 transition"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>

            {isOwner && showcase && (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-300 hover:bg-amber-500/25 text-xs font-medium transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Setup</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeleteShowcase}
                  disabled={isDeleting}
                  className="p-2 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 text-xs transition"
                  title="Delete setup"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="w-full h-[500px] flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
            <p className="text-sm font-medium">Loading aquascape masterpiece...</p>
          </div>
        ) : error || !showcase ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-white mb-2">Showcase Not Found</h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">{error || "This aquascape could not be found."}</p>
            <Link
              href="/showcase"
              className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-semibold text-xs hover:bg-amber-300 transition"
            >
              Explore Other Tanks
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Visual Header & Tank Stage */}
            <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-black shadow-2xl">
              <div className="relative w-full aspect-[16/9] max-h-[640px]">
                <Image
                  src={showcase.imageUrl}
                  alt={showcase.title}
                  fill
                  priority
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1017] via-black/20 to-transparent" />
              </div>

              {/* Badges Overlay */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-black/80 backdrop-blur-md border border-amber-400/40 text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      {showcase.style}
                    </span>
                    {volume && (
                      <span className="px-3 py-1 text-xs font-mono rounded-full bg-black/80 backdrop-blur-md border border-cyan-400/30 text-cyan-300">
                        ~{volume.liters} Liters / {volume.gallons} Gal
                      </span>
                    )}
                    <span className="px-3 py-1 text-xs font-mono rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-slate-300">
                      {showcase.dimensions}
                    </span>
                  </div>

                  <h1 className="font-serif-luxury text-2xl sm:text-4xl font-semibold text-white tracking-wide">
                    {showcase.title}
                  </h1>
                </div>

                {/* Like Button on Banner */}
                <button
                  type="button"
                  onClick={handleToggleLike}
                  disabled={isLiking}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold backdrop-blur-md transition-all ${
                    showcase.hasLiked
                      ? "bg-rose-500/90 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600"
                      : "bg-black/70 border border-white/20 text-slate-200 hover:text-rose-400 hover:border-rose-500/40"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${showcase.hasLiked ? "fill-white" : ""}`} />
                  <span>{showcase.likesCount} Likes</span>
                </button>
              </div>
            </div>

            {/* Main Content Layout: Specs (Left 2/3) + Discussion (Right 1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Specs & Lore Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Creator Card */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {showcase.author.image ? (
                      <Image
                        src={showcase.author.image}
                        alt={showcase.author.name}
                        width={44}
                        height={44}
                        className="rounded-full object-cover border border-amber-400/40"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-sm font-bold text-amber-300">
                        {showcase.author.name?.charAt(0).toUpperCase() || "A"}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-semibold text-white">{showcase.author.name}</h3>
                      <p className="text-xs text-slate-400">@{showcase.author.username}</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(showcase.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>

                {/* Description / Story */}
                {showcase.description && (
                  <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400">
                      Aquascape Story & Care Notes
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed font-light whitespace-pre-line">
                      {showcase.description}
                    </p>
                  </div>
                )}

                {/* Technical Setup Grid */}
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-5">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Box className="w-4 h-4" />
                    <span>Technical Architecture & Equipment</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-mono uppercase mb-1">
                        <Box className="w-3.5 h-3.5 text-amber-400" />
                        <span>Dimensions & Tank Size</span>
                      </div>
                      <p className="text-sm font-semibold text-white font-mono">{showcase.dimensions}</p>
                      {volume && (
                        <p className="text-xs text-amber-300 font-mono mt-0.5">~{volume.liters} L (~{volume.gallons} Gallons)</p>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-mono uppercase mb-1">
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                        <span>Lighting System</span>
                      </div>
                      <p className="text-sm text-slate-200">{showcase.lighting || "Standard LED setup"}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-mono uppercase mb-1">
                        <Wind className="w-3.5 h-3.5 text-cyan-400" />
                        <span>CO2 Injection</span>
                      </div>
                      <p className="text-sm text-slate-200">{showcase.co2System || "Low-tech non-CO2 setup"}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-mono uppercase mb-1">
                        <Layers className="w-3.5 h-3.5 text-amber-500" />
                        <span>Hardscape Materials</span>
                      </div>
                      <p className="text-sm text-slate-200">{showcase.hardscape || "Natural substrate & stone"}</p>
                    </div>
                  </div>
                </div>

                {/* Flora Catalog */}
                {showcase.plants && showcase.plants.length > 0 && (
                  <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                      <Leaf className="w-4 h-4" />
                      <span>Aquatic Flora Species ({showcase.plants.length})</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {showcase.plants.map((plant, idx) => (
                        <span
                          key={idx}
                          className="px-3.5 py-1.5 rounded-xl text-xs bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 font-medium flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {plant}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fauna Catalog */}
                {showcase.fauna && showcase.fauna.length > 0 && (
                  <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      <Fish className="w-4 h-4" />
                      <span>Aquatic Fauna Population ({showcase.fauna.length})</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {showcase.fauna.map((fauna, idx) => (
                        <span
                          key={idx}
                          className="px-3.5 py-1.5 rounded-xl text-xs bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 font-medium flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          {fauna}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Discussion Column */}
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col h-full max-h-[700px]">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-400" />
                      <span>Community Discussion ({comments.length})</span>
                    </h3>
                  </div>

                  {/* Comment Input */}
                  <form onSubmit={handleAddComment} className="mb-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={
                          session?.user
                            ? "Add your comment or question..."
                            : "Sign in to post comments..."
                        }
                        className="w-full pl-4 pr-12 py-3 rounded-2xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                      />
                      <button
                        type="submit"
                        disabled={!commentText.trim() || isSubmittingComment}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 disabled:opacity-40 transition"
                      >
                        {isSubmittingComment ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Comments Thread */}
                  <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                    {comments.length === 0 ? (
                      <div className="text-center py-10 text-slate-500">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-xs">No comments yet. Start the conversation!</p>
                      </div>
                    ) : (
                      comments.map((comm) => (
                        <div
                          key={comm.id}
                          className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2 group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {comm.author.image ? (
                                <Image
                                  src={comm.author.image}
                                  alt={comm.author.name}
                                  width={24}
                                  height={24}
                                  className="rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-amber-300">
                                  {comm.author.name?.charAt(0).toUpperCase() || "A"}
                                </div>
                              )}
                              <span className="text-xs font-semibold text-slate-200 truncate">
                                {comm.author.name}
                              </span>
                            </div>

                            {session?.user?.id === comm.author.id && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(comm.id)}
                                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                            {comm.content}
                          </p>

                          <span className="text-[10px] text-slate-500 block font-mono">
                            {new Date(comm.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Edit Modal */}
      {showcase && (
        <CreateShowcaseModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={(updated) => {
            setShowcase(updated);
            setIsEditModalOpen(false);
          }}
          initialData={showcase}
        />
      )}
    </div>
  );
}
