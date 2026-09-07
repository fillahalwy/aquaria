"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  Plus, 
  Search, 
  Flame, 
  Clock, 
  Sparkles, 
  Loader2, 
  MessageSquarePlus, 
  Filter 
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PostCard from "@/components/forum/PostCard";
import CreatePostModal from "@/components/forum/CreatePostModal";
import { ForumPost } from "@/types/forum";

const TAG_FILTERS = [
  "All",
  "General",
  "Algae",
  "WaterParams",
  "Equipment",
  "Flora",
  "Fauna",
  "AquascapeSetup",
];

export default function ForumPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "top">("latest");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<ForumPost | null>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedTag && selectedTag !== "All") params.append("tag", selectedTag);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      params.append("sort", sortBy);

      const res = await fetch(`/api/forum?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.threads) {
        setPosts(data.threads);
      }
    } catch (err) {
      console.error("Failed to load forum posts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTag, searchQuery, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchPosts]);

  const handlePostCreatedOrUpdated = (savedPost: ForumPost, isEdit: boolean) => {
    if (isEdit) {
      setPosts((prev) =>
        prev.map((p) => (p.id === savedPost.id ? { ...p, ...savedPost } : p))
      );
    } else {
      setPosts((prev) => [savedPost, ...prev]);
    }
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const openCreateModal = () => {
    if (!session?.user) {
      router.push(`/auth/login?callbackUrl=/forum`);
      return;
    }
    setEditingPost(null);
    setIsModalOpen(true);
  };

  const openEditModal = (post: ForumPost) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#0b1017] text-slate-100 selection:bg-amber-400/30 selection:text-amber-200 flex flex-col justify-between">
      {/* Sticky Navbar */}
      <Navbar transparent={false} />

      {/* Main Forum Content Container */}
      <section className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Banner & Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Aquaria Community
              </span>
            </div>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-normal text-white">
              Aquascape Discussions
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
              Share your tank setups, troubleshoot algae & water parameters, and exchange advice with aquascapers worldwide.
            </p>
          </div>

          {/* New Post Button */}
          <button
            onClick={openCreateModal}
            className="self-start md:self-auto flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-amber-400/20 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Post</span>
          </button>
        </div>

        {/* Filter & Search Bar Controls */}
        <div className="mt-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search discussions, algae problems, flora, gear..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0e1520] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-sans"
              />
            </div>

            {/* Sorting Tabs (Latest / Top) */}
            <div className="flex items-center gap-1 bg-[#0e1520] border border-white/10 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setSortBy("latest")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  sortBy === "latest"
                    ? "bg-amber-400 text-slate-950 font-bold shadow-sm shadow-amber-400/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Latest</span>
              </button>
              <button
                type="button"
                onClick={() => setSortBy("top")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  sortBy === "top"
                    ? "bg-amber-400 text-slate-950 font-bold shadow-sm shadow-amber-400/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Top Upvoted</span>
              </button>
            </div>
          </div>

          {/* Category Tag Pills Carousel / Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
            {TAG_FILTERS.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-400 text-slate-950 font-bold shadow-sm shadow-amber-400/20"
                      : "bg-[#0e1520] hover:bg-white/10 text-slate-300 border border-white/5 hover:text-white"
                  }`}
                >
                  {tag === "All" ? "All Topics" : `#${tag}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Community Feed Stream */}
        <div className="mt-8 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center text-slate-400 space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400 mx-auto" />
              <p className="text-xs tracking-wider uppercase">Loading community discussions...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl bg-[#0e1520] border border-white/[0.08] p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto">
                <MessageSquarePlus className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-sans">
                No Discussions Found
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {searchQuery || selectedTag !== "All"
                  ? "No posts matched your current filter criteria. Try searching with different terms or reset your filters."
                  : "Be the first to share an aquascape question, showcase photo, or advice with the community!"}
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                {(searchQuery || selectedTag !== "All") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedTag("All");
                    }}
                    className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-slate-300 uppercase tracking-wider cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
                <button
                  onClick={openCreateModal}
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-400/20 cursor-pointer"
                >
                  Create First Post
                </button>
              </div>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onEdit={openEditModal}
                onDelete={handlePostDeleted}
              />
            ))
          )}
        </div>
      </section>

      {/* Global Footer */}
      <Footer />

      {/* Create / Edit Post Modal */}
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handlePostCreatedOrUpdated}
        initialData={editingPost}
      />
    </main>
  );
}
