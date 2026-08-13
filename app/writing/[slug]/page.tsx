import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllPosts, getPost, formatDate } from "@/lib/content";
import PlateLabel from "@/components/PlateLabel";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    openGraph: { title: post.title, description: post.summary, type: "article" },
  };
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  return (
    <article className="post">
      <PlateLabel plate={post.plate} />
      <h1 className="post-title">{post.title}</h1>
      <div className="post-meta">
        {formatDate(post.date)}
        {post.place ? ` · ${post.place}` : ""}
      </div>
      <div className="post-rule" />
      {post.photo && (
        <figure className="post-photo" style={{ margin: "0 0 26px" }}>
          <img src={post.photo} alt={post.photoCaption ?? post.title} />
          {post.photoCaption && <figcaption className="photo-caption">{post.photoCaption}</figcaption>}
        </figure>
      )}
      <div className="post-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
      </div>
      <div className="endmark">
        <div className="square" />
        <div className="line" />
        <div className="tag">Tusenbruk</div>
      </div>
    </article>
  );
}
