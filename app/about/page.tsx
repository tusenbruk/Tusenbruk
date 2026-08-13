import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPage } from "@/lib/pages";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  const page = getPage("about");
  if (!page) return null;
  return (
    <article className="post">
      <div className="plate red">About</div>
      <h1 className="post-title">{page.title}</h1>
      <div className="post-rule" />
      <div className="post-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.body}</ReactMarkdown>
      </div>
    </article>
  );
}
