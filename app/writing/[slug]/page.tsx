import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllPosts, getPost, formatDate } from "@/lib/content";
import PlateLabel from "@/components/PlateLabel";
import ShareLink from "@/components/ShareLink";

function splitLede(body: string): { lede: string; remainder: string } {
  const rule = body.match(/\n---\s*\n/);
  const heading = body.match(/\n(?=##\s)/);
  const candidates = [
    rule?.index == null ? null : { index: rule.index, end: rule.index + rule[0].length },
    heading?.index == null ? null : { index: heading.index, end: heading.index + 1 },
  ].filter((value): value is { index: number; end: number } => value !== null);

  if (candidates.length === 0) return { lede: body, remainder: "" };
  const first = candidates.sort((a, b) => a.index - b.index)[0];
  return {
    lede: body.slice(0, first.index).trim(),
    remainder: body.slice(first.end).trim(),
  };
}

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug);
  if (!post) return {};
  const card = `/cards/${post.slug}.jpg`;
  const canonical = `/writing/${post.slug}`;
  const cardAlt = `Tusenbruk — ${post.title}`;
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: post.summary,
      url: canonical,
      type: "article",
      siteName: "Tusenbruk",
      locale: "en_AU",
      publishedTime: post.date,
      images: [{ url: card, width: 1200, height: 630, alt: cardAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: [{ url: card, alt: cardAlt }],
    },
  };
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();
  const { lede, remainder } = splitLede(post.body);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    image: {
      "@type": "ImageObject",
      url: `https://tusenbruk.com/cards/${post.slug}.jpg`,
      width: 1200,
      height: 630,
    },
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
        {post.kind === "field-note" ? " · Field note" : ""}
        {post.kind === "essay" ? " · Essay" : ""}
      </div>
      {post.subject && <div className="post-subject">Portrait — {post.subject}</div>}
      <div className="post-rule" />
      <div className="post-body post-lede">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{lede}</ReactMarkdown>
      </div>
      {post.photo && (
        <figure className="post-photo">
          <span className="post-photo-frame">
            <Image
              src={post.photo}
              alt={post.photoAlt ?? post.title}
              fill
              priority
              sizes="(max-width: 720px) calc(100vw - 40px), 655px"
            />
          </span>
          {post.photoCaption && <figcaption className="photo-caption">{post.photoCaption}</figcaption>}
        </figure>
      )}
      {remainder && (
        <div className="post-body post-remainder">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{remainder}</ReactMarkdown>
        </div>
      )}
      <ShareLink title={post.title} path={`/writing/${post.slug}`} />
      <div className="endmark">
        <div className="square" />
        <div className="line" />
        <div className="tag">Tusenbruk</div>
      </div>
    </article>
  );
}
