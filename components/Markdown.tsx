import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MarkdownImage from "./MarkdownImage";

// The one place article and page markdown is rendered.
export default function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ img: MarkdownImage }}>
      {children}
    </ReactMarkdown>
  );
}
