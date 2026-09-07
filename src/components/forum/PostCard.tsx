"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  ArrowBigUp, 
  MessageSquare, 
  Share2, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Check, 
  Loader2 
} from "lucide-react";
import { ForumPost } from "@/types/forum";
import CommentSection from "@/components/forum/CommentSection";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";

interface PostCardProps {
  post: ForumPost;
  onEdit: (post: ForumPost) => void;
  onDelete: (postId: string) => void;
}

function formatRelativeTime(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const isAuthor = session?.user?.id === post.author.id;

  const [upvotesCount, setUpvotesCount] = useState(post.upvotesCount);
  const [hasUpvoted, setHasUpvoted] = useState(post.hasUpvoted);
  const [isVoting, setIsVoting] = useState(false);

  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleVote = async () => {
    if (!session?.user) {
      router.push(`/auth/login?callbackUrl=/forum`);
      return;
    }

    if (isVoting) return;

    // Optimistic UI update
    const previousCount = upvotesCount;
    const previousHasUpvoted = hasUpvoted;

    const nextHasUpvoted = !hasUpvoted;
    const nextCount = nextHasUpvoted ? upvotesCount + 1 : Math.max(0, upvotesCount - 1);

    setHasUpvoted(nextHasUpvoted);
    setUpvotesCount(nextCount);
    setIsVoting(true);

    try {
      const res = await fetch(`/api/forum/${post.id}/vote`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        // Rollback on error
        setHasUpvoted(previousHasUpvoted);
        setUpvotesCount(previousCount);
      } else {
        setUpvotesCount(data.upvotesCount);
        setHasUpvoted(data.hasUpvoted);
      }
    } catch {
      setHasUpvoted(previousHasUpvoted);
      setUpvotesCount(previousCount);
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/forum/${post.id}`, { method: "DELETE" });
      if (res.ok) {
        onDelete(post.id);
      } else {
        alert("Failed to delete post.");
      }
    } catch {
      alert("An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/forum#${post.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <article
      id={post.id}
      className="w-full rounded-2xl bg-[#0e1520] border border-white/[0.08] hover:border-white/15 p-5 sm:p-6 shadow-xl transition-all relative overflow-visible"
    >
      {/* Author and Post Metadata Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar Icon / Initial */}
          <div className="w-10 h-10 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-sm border border-amber-400/30 shrink-0">
            {(post.author.name || post.author.username).charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white font-sans">
                {post.author.name}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                @{post.author.username}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span>{formatRelativeTime(post.createdAt)}</span>
              {post.updatedAt !== post.createdAt && (
                <span className="text-[10px] italic text-slate-600">(edited)</span>
              )}
            </div>
          </div>
        </div>

        {/* Tag Pill & Author Menu */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-amber-300 text-[11px] font-semibold tracking-wider font-mono">
            #{post.tag}
          </span>

          {isAuthor && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Post options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-36 rounded-xl bg-[#070b10] border border-white/15 shadow-2xl p-1 z-30">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(post);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Edit Post</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Title */}
      <h2 className="text-lg sm:text-xl font-bold text-white mb-2 font-sans leading-snug">
        {post.title}
      </h2>

      {/* Post Text Content with Markdown Support */}
      <div className="mb-4">
        <MarkdownRenderer content={post.content} />
      </div>

      {/* Attached Media (Photo or Video) */}
      {post.mediaUrl && (
        <div className="mb-5 rounded-xl overflow-hidden border border-white/10 bg-[#070b10]">
          {post.mediaType === "video" ? (
            <video
              src={post.mediaUrl}
              controls
              className="w-full max-h-[460px] object-cover bg-black"
            />
          ) : (
            <div className="relative w-full h-72 sm:h-96">
              <Image
                src={post.mediaUrl}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      )}

      {/* Action Bar */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Upvote Button */}
          <button
            type="button"
            onClick={handleVote}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              hasUpvoted
                ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold shadow-sm shadow-amber-400/15"
                : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
            }`}
            aria-label="Upvote post"
          >
            <ArrowBigUp className={`w-4 h-4 ${hasUpvoted ? "fill-amber-400 text-amber-400" : ""}`} />
            <span>{upvotesCount}</span>
            <span className="hidden sm:inline font-normal text-[11px] text-slate-400">
              {upvotesCount === 1 ? "Upvote" : "Upvotes"}
            </span>
          </button>

          {/* Comments Toggle Button */}
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
              showComments
                ? "bg-white/15 text-white border border-white/20"
                : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
            }`}
            aria-label="View comments"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">{commentsCount}</span>
            <span className="hidden sm:inline font-normal text-[11px] text-slate-400">
              {commentsCount === 1 ? "Comment" : "Comments"}
            </span>
          </button>
        </div>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          aria-label="Share post link"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-[11px] font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Share</span>
            </>
          )}
        </button>
      </div>

      {/* Expandable Comment Section */}
      {showComments && (
        <CommentSection
          threadId={post.id}
          initialComments={post.comments}
          onCommentCountChange={(count) => setCommentsCount(count)}
        />
      )}
    </article>
  );
}
