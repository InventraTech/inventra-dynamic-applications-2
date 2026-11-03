import ReactMarkdown, { type Components } from "react-markdown";

interface MarkdownMessageProps {
    content: string;
}

const markdownComponents: Components = {
    h1: ({ children }) => <h3 className="mb-2 mt-4 font-k2d text-lg font-bold text-ink first:mt-0">{children}</h3>,
    h2: ({ children }) => <h4 className="mb-2 mt-4 font-k2d text-base font-bold text-ink first:mt-0">{children}</h4>,
    h3: ({ children }) => <h5 className="mb-2 mt-3 font-k2d text-sm font-bold text-ink first:mt-0">{children}</h5>,
    p: ({ children }) => <p className="my-2 whitespace-pre-wrap wrap-anywhere font-k2d text-sm leading-relaxed first:mt-0 last:mb-0 sm:text-base">{children}</p>,
    ul: ({ children }) => <ul className="my-2 list-disc space-y-1 ps-6 marker:text-brand">{children}</ul>,
    ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 ps-6 marker:text-brand">{children}</ol>,
    li: ({ children }) => <li className="wrap-anywhere font-k2d text-sm leading-relaxed sm:text-base">{children}</li>,
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    blockquote: ({ children }) => <blockquote className="my-3 border-s-2 border-sidebar-divider ps-4 text-history-muted">{children}</blockquote>,
    code: ({ children }) => <code className="rounded bg-history-card-header px-1 py-0.5 font-mono text-sm">{children}</code>,
    pre: ({ children }) => <pre className="my-3 max-w-full overflow-x-auto rounded-xl bg-history-card-header p-3 font-mono text-sm">{children}</pre>,
    hr: () => <hr className="my-3 border-history-border" />,
    a: ({ children, href, title }) => href
        ? <a href={href} title={title} target="_blank" rel="noreferrer" className="font-semibold text-link underline decoration-1 underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">{children}</a>
        : <>{children}</>,
    img: () => null,
};

export default function MarkdownMessage({ content }: MarkdownMessageProps) {
    return <ReactMarkdown skipHtml components={markdownComponents}>{content}</ReactMarkdown>;
}
