import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageFormatterProps {
  content: string;
}

function MessageFormatter({ content }: MessageFormatterProps) {
  return (
    <div className="text-[16px] leading-8 text-zinc-800 dark:text-zinc-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mt-6 mb-3 first:mt-0 pb-2 border-b border-zinc-200 dark:border-zinc-800">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mt-5 mb-2 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[15px] font-semibold text-zinc-800 dark:text-zinc-100 mt-4 mb-2 first:mt-0">
              {children}
            </h3>
          ),
          // Paragraphs
          p: ({ children }) => (
            <p className="mb-5 last:mb-0 tracking-wide">
              {children}
            </p>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className="mb-4 space-y-2 last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 space-y-2 list-decimal list-outside ml-5 last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="relative pl-5 before:content-['•'] before:absolute before:left-0 before:text-violet-400 before:font-bold in-[ol]:pl-0 in-[ol]:before:content-none">
              {children}
            </li>
          ),
          // Code blocks
          code: ({ className, children }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-violet-600 dark:text-violet-300 text-[13px] font-mono border border-zinc-200 dark:border-zinc-700/50">
                  {children}
                </code>
              );
            }
            return (
              <code className="text-[13px] font-mono text-zinc-800 dark:text-zinc-300">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <div className="relative group mb-4">
              <div className="absolute top-0 left-0 right-0 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-t-lg border-b border-zinc-300 dark:border-zinc-700/50 flex items-center px-3 gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
              </div>
              <pre className="bg-zinc-100 dark:bg-zinc-900 rounded-lg pt-10 pb-4 px-4 overflow-x-auto border border-zinc-200 dark:border-zinc-800 text-[13px]">
                {children}
              </pre>
            </div>
          ),
          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className="relative pl-4 my-4 text-zinc-500 dark:text-zinc-400 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-linear-to-b before:from-violet-500 before:to-purple-600 before:rounded-full">
              {children}
            </blockquote>
          ),
          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 underline decoration-violet-400/30 hover:decoration-violet-500 dark:hover:decoration-violet-300 underline-offset-2 transition-colors"
            >
              {children}
            </a>
          ),
          // Strong/Bold
          strong: ({ children }) => (
            <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{children}</strong>
          ),
          // Emphasis/Italic
          em: ({ children }) => (
            <em className="italic text-zinc-700 dark:text-zinc-200">{children}</em>
          ),
          // Horizontal rule
          hr: () => (
            <hr className="my-6 border-0 h-px bg-linear-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent" />
          ),
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-zinc-100 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left font-medium border-b border-zinc-200 dark:border-zinc-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800/50">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}





export default MessageFormatter;
