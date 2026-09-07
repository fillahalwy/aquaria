"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { 
  X, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  Bold, 
  Italic, 
  Heading2, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Link as LinkIcon, 
  Upload, 
  Eye, 
  Edit3, 
  Trash2 
} from "lucide-react";
import { ForumPost } from "@/types/forum";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (post: ForumPost, isEdit: boolean) => void;
  initialData?: ForumPost | null;
}

const PRESET_TAGS = [
  "General",
  "Algae",
  "WaterParams",
  "Equipment",
  "Flora",
  "Fauna",
  "AquascapeSetup",
  "Troubleshooting",
];

const SAMPLE_MEDIA = [
  { label: "Nature Aquarium", url: "/images/hero-aquascape.jpg", type: "image" },
  { label: "Dragon Stone", url: "/images/hardscape-aquascape.jpg", type: "image" },
  { label: "Lush Flora", url: "/images/flora-aquascape.jpg", type: "image" },
  { label: "Tetra Biotope", url: "/images/fauna-aquascape.jpg", type: "image" },
];

export default function CreatePostModal(props: CreatePostModalProps) {
  if (!props.isOpen) return null;

  return (
    <PostFormModal
      key={props.initialData ? `edit-${props.initialData.id}` : "new-post"}
      {...props}
    />
  );
}

function PostFormModal({
  onClose,
  onSuccess,
  initialData,
}: CreatePostModalProps) {
  const isEdit = !!initialData;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [tag, setTag] = useState(
    initialData
      ? PRESET_TAGS.includes(initialData.tag)
        ? initialData.tag
        : "Custom"
      : "General"
  );
  const [customTag, setCustomTag] = useState(
    initialData && !PRESET_TAGS.includes(initialData.tag) ? initialData.tag : ""
  );
  const [isCustomTag, setIsCustomTag] = useState(
    initialData ? !PRESET_TAGS.includes(initialData.tag) : false
  );

  const [mediaUrl, setMediaUrl] = useState(initialData?.mediaUrl || "");
  const [mediaType, setMediaType] = useState<"image" | "video">(
    (initialData?.mediaType as "image" | "video") || "image"
  );
  const [mediaFileName, setMediaFileName] = useState("");

  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Insert markdown helpers into textarea
  const insertMarkdown = (before: string, after: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;
    const selectedText = previousText.substring(start, end) || placeholder;

    const replacement = `${before}${selectedText}${after}`;
    const newContent = previousText.substring(0, start) + replacement + previousText.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  // Handle local media file upload with client-side image compression
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (20MB for video, 15MB for image)
    const isVid = file.type.startsWith("video/");
    const maxSize = isVid ? 20 * 1024 * 1024 : 15 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File is too large. Maximum size is ${isVid ? "20MB" : "15MB"}.`);
      return;
    }

    setMediaType(isVid ? "video" : "image");
    setMediaFileName(file.name);

    if (isVid) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        setMediaUrl(result);
      };
      reader.readAsDataURL(file);
    } else {
      // Compress image client side
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const rawResult = uploadEvent.target?.result as string;
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_DIMENSION = 1280;
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
            const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
            setMediaUrl(compressedDataUrl);
          } else {
            setMediaUrl(rawResult);
          }
        };
        img.onerror = () => {
          setMediaUrl(rawResult);
        };
        img.src = rawResult;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearMedia = () => {
    setMediaUrl("");
    setMediaFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || title.trim().length < 3) {
      setError("Please enter a title (minimum 3 characters).");
      return;
    }

    if (!content.trim() || content.trim().length < 5) {
      setError("Please write body text (minimum 5 characters).");
      return;
    }

    const finalTag = (isCustomTag ? customTag.trim() : tag) || "General";

    setIsLoading(true);

    try {
      const url = isEdit ? `/api/forum/${initialData.id}` : "/api/forum";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          tag: finalTag,
          mediaUrl: mediaUrl.trim() || undefined,
          mediaType: mediaUrl.trim() ? mediaType : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save post.");
        setIsLoading(false);
        return;
      }

      onSuccess(data.thread, isEdit);
      onClose();
    } catch {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0e1520] border border-white/10 rounded-2xl shadow-2xl p-5 sm:p-7 relative overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white font-sans">
              {isEdit ? "Edit Community Post" : "Create Community Post"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Post Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* 1. Title Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Title <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How to balance lighting & CO2 to prevent Black Beard Algae?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b10] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-sans"
            />
          </div>

          {/* 2. Tags Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Category Tag <span className="text-amber-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomTag(!isCustomTag)}
                className="text-[11px] text-amber-400 hover:underline cursor-pointer"
              >
                {isCustomTag ? "Choose from presets" : "+ Custom Tag"}
              </button>
            </div>

            {isCustomTag ? (
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400 text-xs font-mono">#</span>
                <input
                  type="text"
                  required
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="Enter custom tag (e.g. NanoTankSetup)"
                  className="w-full pl-7 pr-3.5 py-2 rounded-xl bg-[#070b10] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-sans"
                />
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TAGS.map((t) => {
                  const isSelected = tag === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTag(t)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-400 text-slate-950 font-bold shadow-sm shadow-amber-400/20"
                          : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5"
                      }`}
                    >
                      #{t}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Body Text (Markdown Supported) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Body Text <span className="text-amber-400">*</span>
                </label>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 font-mono">
                  Markdown
                </span>
              </div>

              {/* Write vs Preview Tabs */}
              <div className="flex items-center gap-1 bg-[#070b10] p-0.5 rounded-lg border border-white/10 text-[11px]">
                <button
                  type="button"
                  onClick={() => setEditorTab("write")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    editorTab === "write"
                      ? "bg-amber-400 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Write</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab("preview")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    editorTab === "preview"
                      ? "bg-amber-400 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {/* Markdown Toolbar (Visible on Write Tab) */}
            {editorTab === "write" && (
              <div className="flex items-center gap-1 p-1 bg-[#070b10] border border-white/10 rounded-t-xl border-b-0 text-slate-300 flex-wrap">
                <button
                  type="button"
                  onClick={() => insertMarkdown("**", "**", "bold text")}
                  className="p-1.5 hover:bg-white/10 hover:text-amber-400 rounded transition-colors"
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("*", "*", "italic text")}
                  className="p-1.5 hover:bg-white/10 hover:text-amber-400 rounded transition-colors"
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("### ", "", "Heading")}
                  className="p-1.5 hover:bg-white/10 hover:text-amber-400 rounded transition-colors"
                  title="Heading"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("> ", "", "Quote")}
                  className="p-1.5 hover:bg-white/10 hover:text-amber-400 rounded transition-colors"
                  title="Blockquote"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("`", "`", "code")}
                  className="p-1.5 hover:bg-white/10 hover:text-amber-400 rounded transition-colors"
                  title="Inline Code"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("- ", "", "List item")}
                  className="p-1.5 hover:bg-white/10 hover:text-amber-400 rounded transition-colors"
                  title="Bullet List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("1. ", "", "List item")}
                  className="p-1.5 hover:bg-white/10 hover:text-amber-400 rounded transition-colors"
                  title="Numbered List"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("[", "](https://example.com)", "Link title")}
                  className="p-1.5 hover:bg-white/10 hover:text-amber-400 rounded transition-colors"
                  title="Add Link"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Editor Area */}
            {editorTab === "write" ? (
              <textarea
                ref={textareaRef}
                required
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your experience, parameters, or questions with markdown formatting (e.g. **bold**, *italic*, ### headings, lists)..."
                className="w-full px-3.5 py-2.5 rounded-b-xl rounded-t-none bg-[#070b10] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-sans resize-none"
              />
            ) : (
              <div className="w-full p-4 rounded-xl bg-[#070b10] border border-white/10 min-h-[160px] max-h-64 overflow-y-auto">
                {content.trim() ? (
                  <MarkdownRenderer content={content} />
                ) : (
                  <p className="text-xs text-slate-500 italic">No content to preview yet. Switch to &apos;Write&apos; tab to add content.</p>
                )}
              </div>
            )}
          </div>

          {/* 4. Upload Media (Optional) */}
          <div className="pt-2 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Upload Media
                </label>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Optional
                </span>
              </div>

              {mediaUrl && (
                <button
                  type="button"
                  onClick={handleClearMedia}
                  className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Media</span>
                </button>
              )}
            </div>

            {/* Media Upload & URL Controls */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {/* File Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="media-file-input"
                />
                <label
                  htmlFor="media-file-input"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 font-medium transition-colors cursor-pointer shrink-0"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>{mediaFileName ? "Change File" : "Upload File"}</span>
                </label>

                {/* Direct URL Input */}
                <input
                  type="text"
                  value={mediaUrl.startsWith("data:") ? `Local file: ${mediaFileName || "uploaded"}` : mediaUrl}
                  onChange={(e) => {
                    setMediaUrl(e.target.value);
                    setMediaFileName("");
                  }}
                  disabled={mediaUrl.startsWith("data:")}
                  placeholder="Or paste image/video URL (e.g. https://...)"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#070b10] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-sans disabled:opacity-75"
                />
              </div>

              {/* Sample Presets */}
              <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 pt-0.5">
                <span>Quick Aquascape Presets:</span>
                {SAMPLE_MEDIA.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => {
                      setMediaUrl(s.url);
                      setMediaType(s.type as "image" | "video");
                      setMediaFileName("");
                    }}
                    className="text-amber-400/90 hover:text-amber-300 underline underline-offset-2 cursor-pointer"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Media Live Preview */}
            {mediaUrl && (
              <div className="mt-3 relative rounded-xl overflow-hidden border border-white/10 bg-black/40 h-44 w-full flex items-center justify-center">
                {mediaType === "image" ? (
                  <Image
                    src={mediaUrl}
                    alt="Media attachment preview"
                    fill
                    className="object-cover"
                    unoptimized={mediaUrl.startsWith("data:")}
                  />
                ) : (
                  <video
                    src={mediaUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEdit ? "Update Post" : "Publish Post"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
