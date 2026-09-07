"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Send, Loader2, MessageSquare, AlertCircle } from "lucide-react";
import { ForumComment } from "@/types/forum";

interface CommentSectionProps {
  threadId: string;
  initialComments?: ForumComment[];
  onCommentCountChange?: (count: number) => void;
}

function formatRelativeTime(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function CommentSection({
  threadId,
  initialComments,
  onCommentCountChange,
}: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<ForumComment[]>(initialComments || []);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!initialComments);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialComments) {
      const fetchComments = async () => {
        setIsFetching(true);
        try {
          const res = await fetch(`/api/forum/${threadId}`);
          const data = await res.json();
          if (data.success && data.thread?.comments) {
            setComments(data.thread.comments);
          }
        } catch (err) {
          console.error("Failed to load comments:", err);
        } finally {
          setIsFetching(false);
        }
      };
      fetchComments();
    }
  }, [threadId, initialComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/forum/${threadId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to post comment.");
        setIsLoading(false);
        return;
      }

      const updated = [...comments, data.comment];
      setComments(updated);
      setNewComment("");
      if (onCommentCountChange) {
        onCommentCountChange(updated.length);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-4 mt-4 border-t border-white/5 space-y-4">
      {/* Comments List */}
      <div className="space-y-3">
        {isFetching ? (
          <div className="py-4 text-center text-xs text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-amber-400" />
            <span>Loading discussion...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>No comments yet. Be the first to start the conversation!</span>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-3 rounded-xl bg-[#070b10]/60 border border-white/5 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-[10px]">
                    {(comment.author.name || comment.author.username).charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-slate-200">
                    {comment.author.name}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    @{comment.author.username}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {formatRelativeTime(comment.createdAt)}
                </span>
              </div>
              <p className="text-xs text-slate-300 pl-8 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Comment Input or Login Prompt */}
      {session?.user ? (
        <form onSubmit={handleSubmit} className="flex gap-2 items-end pt-1">
          <textarea
            rows={2}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment or helpful advice..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-[#070b10] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-sans resize-none"
          />
          <button
            type="submit"
            disabled={isLoading || !newComment.trim()}
            className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all shadow-sm shadow-amber-400/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            aria-label="Send reply"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      ) : (
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center text-xs text-slate-400">
          <span>Want to join the discussion? </span>
          <Link
            href="/auth/login?callbackUrl=/forum"
            className="text-amber-400 font-bold hover:underline ml-1"
          >
            Sign in to comment
          </Link>
        </div>
      )}
    </div>
  );
}
