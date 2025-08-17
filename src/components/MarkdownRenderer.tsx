'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
        components={{
          // Custom styling for code blocks
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <code className={`${className} block`} {...props}>
                {children}
              </code>
            ) : (
              <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
          // Custom styling for headings
          h1({ children }) {
            return <h1 className="text-2xl font-bold mb-4 text-foreground">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mb-3 text-foreground">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-semibold mb-2 text-foreground">{children}</h3>;
          },
          h4({ children }) {
            return <h4 className="text-md font-semibold mb-2 text-foreground">{children}</h4>;
          },
          // Custom styling for paragraphs
          p({ children }) {
            return <p className="mb-3 text-muted-foreground leading-relaxed">{children}</p>;
          },
          // Custom styling for lists
          ul({ children }) {
            return <ul className="list-disc list-inside mb-3 text-muted-foreground space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside mb-3 text-muted-foreground space-y-1">{children}</ol>;
          },
          li({ children }) {
            return <li className="text-muted-foreground">{children}</li>;
          },
          // Custom styling for blockquotes
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary pl-4 py-2 mb-3 bg-muted/20 rounded-r">
                {children}
              </blockquote>
            );
          },
          // Custom styling for tables
          table({ children }) {
            return (
              <div className="overflow-x-auto mb-3">
                <table className="min-w-full border-collapse border border-border">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-muted">{children}</thead>;
          },
          th({ children }) {
            return (
              <th className="border border-border px-3 py-2 text-left font-semibold text-foreground">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border border-border px-3 py-2 text-muted-foreground">
                {children}
              </td>
            );
          },
          // Custom styling for links
          a({ children, href }) {
            return (
              <a 
                href={href} 
                className="text-primary hover:text-primary/80 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
          // Custom styling for strong/bold
          strong({ children }) {
            return <strong className="font-bold text-foreground">{children}</strong>;
          },
          // Custom styling for emphasis/italic
          em({ children }) {
            return <em className="italic text-foreground">{children}</em>;
          },
          // Custom styling for horizontal rules
          hr() {
            return <hr className="border-t border-border my-6" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
