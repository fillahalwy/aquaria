"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed font-sans ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg sm:text-xl font-bold text-white mt-4 mb-2 first:mt-0 font-sans border-b border-white/10 pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base sm:text-lg font-bold text-white mt-3.5 mb-1.5 first:mt-0 font-sans">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm sm:text-base font-semibold text-amber-300/90 mt-3 mb-1 first:mt-0 font-sans">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0 text-slate-300 leading-relaxed">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-amber-200/90">
              {children}
            </em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-amber-400 pl-3.5 py-1 my-2.5 text-slate-400 italic bg-white/[0.02] rounded-r-lg">
              {children}
            </blockquote>
          ),
          code: ({ children, className: codeClass }) => {
            const isBlock = codeClass?.includes("language-");
            if (isBlock) {
              return <code className="block text-slate-200 font-mono text-xs">{children}</code>;
            }
            return (
              <code className="bg-[#070b10] text-amber-300 font-mono text-[11px] px-1.5 py-0.5 rounded border border-white/10">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-[#070b10] border border-white/10 p-3.5 rounded-xl overflow-x-auto my-3 text-xs text-slate-200 font-mono">
              {children}
            </pre>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-2 pl-1 text-slate-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-2 pl-1 text-slate-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-slate-300">
              <span className="text-slate-300">{children}</span>
            </li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 underline underline-offset-2 hover:text-amber-300 transition-colors"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="border-white/10 my-4" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
