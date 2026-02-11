import ReactMarkdown from "react-markdown";

interface Props { content: string }

export function MarkdownRenderer({ content }: Props) {
  return (
    <div className="prose prose-sm sm:prose-base max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-code:text-primary prose-code:before:content-none prose-code:after:content-none" data-testid="markdown-renderer">
      <ReactMarkdown
        components={{
          h2: ({ children }) => <h2 className="mt-8 mb-3 border-b pb-2 text-xl font-bold">{children}</h2>,
          h3: ({ children }) => <h3 className="mt-6 mb-2 text-lg font-semibold">{children}</h3>,
          p: ({ children }) => <p className="mb-4 leading-7">{children}</p>,
          ul: ({ children }) => <ul className="mb-4 ml-4 list-disc space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="mb-4 ml-4 list-decimal space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-7">{children}</li>,
          pre: ({ children }) => (
            <div className="my-4 overflow-hidden rounded-lg border bg-[#1e1e2e]">
              <div className="flex items-center justify-between bg-muted/80 px-4 py-1.5">
                <span className="text-xs text-muted-foreground">Code</span>
              </div>
              <pre className="overflow-x-auto p-4 text-sm leading-6 text-green-100">{children}</pre>
            </div>
          ),
          code: ({ children, className }) =>
            className
              ? <code className={className}>{children}</code>
              : <code className="rounded bg-primary/10 px-1.5 py-0.5 text-sm font-medium text-primary">{children}</code>,
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
          th: ({ children }) => <th className="px-4 py-2.5 text-left font-semibold">{children}</th>,
          td: ({ children }) => <td className="border-t px-4 py-2.5">{children}</td>,
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-primary/30 bg-primary/5 py-2 pl-4 pr-3 italic">{children}</blockquote>
          ),
          hr: () => <hr className="my-8 border-border" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
