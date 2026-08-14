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
  const card = `/cards/${post.slug}.jpg`;
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/writing/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.date,
      images: [{ url: card, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: [card],
    },
  };
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    image: `https://tusenbruk.com/cards/${post.slug}.jpg`,
    author: { "@type": "Organization", name: "Tusenbruk" },
    publisher: { "@type": "Organization", name: "Tusenbruk", url: "https://tusenbruk.com" },
    mainEntityOfPage: `https://tusenbruk.com/writing/${post.slug}`,
  };

  return (
    <article className="post">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PlateLabel plate={post.plate} />
      <h1 className="post-title">{post.title}</h1>
      <div className="post-meta">
        {formatDate(post.date)}
        {post.place ? ` · ${post.place}` : ""}
        {post.kind === "study" ? " · Catalogue study" : ""}
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
