'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // Estilo de syntax highlighting

interface DocViewerProps {
  content: string;
  title?: string;
}

export default function DocViewer({ content, title }: DocViewerProps) {
  return (
    <div className="doc-viewer">
      {title && (
        <div className="mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
        </div>
      )}

      <div className="prose prose-lg prose-slate max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
          components={{
            // Customizar componentes de Markdown
            h1: ({ children }) => (
              <h1 className="text-4xl font-bold text-gray-900 mt-8 mb-4 border-b-2 border-primary pb-2">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-3xl font-bold text-gray-800 mt-8 mb-4">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-2xl font-semibold text-gray-700 mt-6 mb-3">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-xl font-semibold text-gray-700 mt-4 mb-2">
                {children}
              </h4>
            ),
            p: ({ children }) => (
              <p className="text-gray-700 leading-relaxed mb-4">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-2 mb-4 ml-4">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-gray-700 leading-relaxed">
                {children}
              </li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-primary bg-gray-50 pl-4 py-2 my-4 italic text-gray-600">
                {children}
              </blockquote>
            ),
            code: ({ className, children }) => {
              const isInline = !className;

              if (isInline) {
                return (
                  <code className="bg-gray-100 text-red-600 px-2 py-1 rounded text-sm font-mono">
                    {children}
                  </code>
                );
              }

              return (
                <code className={className}>
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                {children}
              </pre>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gray-50">
                {children}
              </thead>
            ),
            tbody: ({ children }) => (
              <tbody className="divide-y divide-gray-200 bg-white">
                {children}
              </tbody>
            ),
            tr: ({ children }) => (
              <tr className="hover:bg-gray-50 transition-colors">
                {children}
              </tr>
            ),
            th: ({ children }) => (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-300">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                {children}
              </td>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-primary hover:text-primary/80 underline transition-colors"
                target={href?.startsWith('http') ? '_blank' : undefined}
                rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {children}
              </a>
            ),
            hr: () => (
              <hr className="my-8 border-t-2 border-gray-200" />
            ),
            strong: ({ children }) => (
              <strong className="font-bold text-gray-900">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="italic text-gray-800">
                {children}
              </em>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      <style jsx global>{`
        .doc-viewer {
          @apply bg-white rounded-lg shadow-sm border border-gray-200 p-8;
        }

        /* Estilos adicionales para syntax highlighting */
        .hljs {
          @apply bg-gray-900 text-gray-100;
        }

        /* Mejorar el espaciado de listas anidadas */
        .prose ul ul,
        .prose ul ol,
        .prose ol ul,
        .prose ol ol {
          @apply mt-2 ml-4;
        }

        /* Ajustar checkboxes de tasks */
        .prose input[type="checkbox"] {
          @apply mr-2;
        }
      `}</style>
    </div>
  );
}