import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Markdown from "@/components/Markdown";
import { getAllPosts, getPost, formatDate } from "@/lib/content";
import PlateLabel from "@/components/PlateLabel";
import ShareLink from "@/components/ShareLink";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { getPlate } from "@/lib/plates";

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
  return pageMetadata({
    title: post.title,
    description: post.summary,
    path: `/writing/${post.slug}`,
    image: `/cards/${post.slug}.jpg`,
    imageAlt: `Tusenbruk — ${post.title}`,
    type: "article",
    publishedTime: post.date,
  });
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();
  const { lede, remainder } = splitLede(post.body);

  const url = `${SITE_URL}/writing/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.summary,
        datePublished: post.date,
        dateModified: post.date,
        inLanguage: "en",
        articleSection: getPlate(post.plate).name,
        image: {
          "@type": "ImageObject",
          url: `${SITE_URL}/cards/${post.slug}.jpg`,
          width: 1200,
          height: 630,
        },
        // Tusenbruk is the visible author; there is no personal byline (DECISIONS.md).
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntityOfPage: url,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Writing", item: `${SITE_URL}/writing` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
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
        <Markdown>{lede}</Markdown>
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
          <Markdown>{remainder}</Markdown>
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
