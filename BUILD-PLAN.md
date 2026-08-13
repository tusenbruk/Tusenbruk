# Tusenbruk — Build Plan

Hand this, plus `AGENTS.md` and `source/`, to Claude Code. It mirrors the proven CoCCuLiNi /
Touchdown Tennessee build, adapted to Tusenbruk's voice and content model.

---

## 1. The decision in one line

Stop fighting Ghost. Build a **Next.js + TypeScript** site, articles as **Markdown in the repo**,
deploy on **Vercel** (auto-deploy on push), draft articles with a **Python + Claude agent** that
works only from human-supplied source material. Free core stack until traffic is large.

---

## 2. Stack (copy CoCCuLiNi exactly)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) + TypeScript | Static-generated |
| Content | Markdown in `content/<category>/*.md` | `gray-matter` frontmatter, `react-markdown` + `remark-gfm` |
| Hosting | Vercel (Hobby tier) | Auto-deploy on push to `main` |
| Repo | GitHub, private, `tusenbruk` | Push triggers deploy |
| Domain | `tusenbruk.com` (already referenced in IG captions) | Point DNS at Vercel; nail SSL before announcing |
| Agent | Python + Claude API | Drafts from human seeds; commits Markdown |
| Fonts | Playfair Display (display) + Source Serif 4 (body) | Already chosen — see design system below |

Dependencies to start: `next`, `react`, `react-dom`, `react-markdown`, `remark-gfm`, `gray-matter`,
`typescript`, `@types/*`. (No `react-simple-maps` — that was CoCCuLiNi's mine map; Tusenbruk has no map.)

---

## 3. Site architecture

```
app/
  page.tsx              Home — featured lede (one portrait) + latest grid
  [category]/           Category hubs: /watches /cameras /pens /notebooks /folios /cars /luggage
  article/[slug]/       The piece (renders Markdown body, lead photo, subject + object line)
  about/                What Tusenbruk is (drawn from the constitution, public-facing)
  submit/               "Tell us about your object" — mailto + the kind of detail we want
  contact/              mailto: to a real inbox
  layout.tsx, globals.css, sitemap.ts, robots.ts
components/
  Header, Footer, Wordmark, ArticleCard, PullQuote, SubjectLine, PhotoFigure
content/<category>/     Article markdown (the agent writes here)
lib/
  content.ts            Markdown loader / frontmatter parser (copy from CoCCuLiNi, adapt fields)
  categories.ts         The coverage map (below) — names, taglines, order
public/
  brand/                logo + wordmark
  photos/               lead photos
```

### The coverage map (`lib/categories.ts`)

The constitution names the beat: **watches, cameras, pens, notebooks, folios, attachés, cars,
luggage.** Treat these as the category set (CoCCuLiNi's "minerals" equivalent). Suggest launching
with the ones we have content for and adding the rest as pieces arrive. A catch-all `desk` /
`everyday-carry` category absorbs anything off-list.

---

## 4. Content model (article frontmatter)

Adapt CoCCuLiNi's schema. Tusenbruk drops `heat`/`takeaway`/`sources` (no conviction meter, rarely
sourced) and adds the fields that enforce the Three Tests:

```yaml
---
title: "The watch everyone should have bought and nobody did"
slug: rolex-gmt-the-one-you-should-have-bought
category: watches
date: 2026-03-12
byline: Tusenbruk                 # neutral house byline; a named byline only when Ryan writes editorial
subject: "A Sydney builder"       # the PERSON — named, initialled, or described. Never absent.
object: "Rolex GMT-Master II ref. 16710 on a Jubilee"   # the exact thing — reference, year, finish
summary: "One-sentence framing of the relationship, not the spec."
pullquote: "The kind of thing that looks better after a few years of living in it."  # optional
photo: /photos/rolex.jpg          # in-use or after-use only
tags: [rolex, gmt-master, steel]
featured: true                    # sets the home lede
status: published                 # draft | published
---
Body in Markdown…
```

**`subject` and `object` are required.** A piece without a named person fails Test One at the data
layer — the loader should flag any published piece missing `subject`.

---

## 5. Design system (already decided — lift from the old Ghost CSS)

The previous Ghost code-injection file is now obsolete as a platform, but it **is** the finished
design spec. Translate it into `globals.css` / Tailwind tokens:

**Palette**

| Token | Hex | Use |
|---|---|---|
| `--tb-ink` | `#1a1814` | Body text |
| `--tb-navy` | `#1c2b40` | Headings, accent |
| `--tb-red` | `#8c2418` | Sparing accent |
| `--tb-denim` | `#3a5a7a` | Links |
| `--tb-khaki` | `#b8a882` | Warm detail |
| `--tb-mid` | `#8c8880` | Labels / captions |
| `--tb-rule` | `#d8d4cc` | Dividers |
| `--tb-canvas` | `#f5f3ee` | Page background |

**Type**

- Display / headings: **Playfair Display** 600 (titles), 400 (sub-heads), navy, letter-spacing −0.01em.
- Body: **Source Serif 4** 300, ink, ~15px / 1.75 line-height on article pages.
- Labels / tags / captions: Source Serif 4 300, 10px, uppercase, letter-spacing 0.15em, `--tb-mid`.
- Header: canvas background, 2px ink bottom rule. Links denim, hover navy.

Use the existing `tusenbruk-logo.svg` for the wordmark. Editorial layout, generous whitespace, real
photos full-bleed where they earn it. No template look — wire the brand in from day one (a CoCCuLiNi
lesson: a generic theme reads as a generic site).

---

## 6. The agent — adapted, not copied

CoCCuLiNi's agent scans world news and writes sourced fact. **Tusenbruk's cannot work that way** —
the product is one real person's lived relationship with a thing, which no agent can know. So the
agent is a **drafter and editor, not a reporter.** Ryan supplies the raw material; the agent shapes
it into the house voice and guards the standard.

### Phase 1 — single drafting agent (`tusenbruk-agent.py`)

The input is the **Assignment Desk** (`assignments.yml`) — the human-in-the-loop. Ryan drops in an
assignment with the source material:

```yaml
assignments:
  - subject: "A Sydney builder"
    object: "Rolex GMT-Master II ref. 16710, Jubilee bracelet, bought 2009"
    category: watches
    angle: "the one you should have bought — value through use, not condition"
    source: |        # the raw material — interview notes, a voice-memo transcript, Ryan's bullets
      - Wears it on site every day; the bezel's got a ding from a scaffold clamp.
      - Nearly sold it in 2015 to fund the extension; didn't; glad.
      - Keeps perfect-ish time, gains a couple minutes, never serviced.
    status: pending   # only `pending` items run; agent stamps `done` + slug + date
```

Each run, for each pending assignment:

1. **Draft.** Call the Claude API to write the piece in the Tusenbruk voice (Coggins / Hainey /
   Harford, per the skill), strictly from the supplied `source`. No invented detail.
2. **Self-review against the Three Tests.** Can the person be removed? Is there a detail only this
   person could have given? Does the ending earn its silence? Plus: no fabricated fact, restraint
   over reverence, length 800–1,400 words.
3. **Write file.** Draft-only by default → `article-drafts/<slug>.md` for review. `--publish` writes
   to `content/<category>/` (commit to deploy) and stamps the queue.

```bash
python tusenbruk-agent.py --from-queue            # draft pending assignments (review first)
python tusenbruk-agent.py --from-queue --publish  # file them + stamp the queue
python tusenbruk-agent.py --once rolex-gmt-...     # a single assignment
```

### Phase 2 — split into a fleet (later)

| Agent | Job |
|---|---|
| **Writer** | Turn one assignment's source material into a voice-true draft |
| **Verifier** | Independent second pass: enforce the Three Tests; can block publication. Keep separate from the Writer so it has no incentive to pass weak work |
| **Editor** | Set the home lede, de-dupe, commit, deploy |
| **Distributor** | Auto-post new pieces to Instagram / X (the IG captions show the format) |

The **Verifier** is what makes "earn the wear" structural rather than aspirational.

### Guardrails (in code / prompts)

- **No source, no detail, no publish.** A draft with no unique human detail is rejected, not softened.
- The agent never names a real person without Ryan's say-so — `subject` is exactly what Ryan wrote.
- Secrets (`ANTHROPIC_API_KEY`, any social API keys) live in environment variables, never in the repo.
- Cost ceiling per run. Articles cost roughly $0.01–0.03 each. Start in dry-run.

---

## 7. Source kit — what we already have (in this folder)

This **is** the best source folder. Recommend Claude Code consolidate the editorial/brand assets into
`source/` and `public/brand/` on first commit. Current contents and their role:

| File | Role |
|---|---|
| `tusenbruk-editorial-constitution.md` | **The spine.** The standard every piece is held against. → `source/` |
| `tusenbruk-editorial-voice` skill (installed) | The voice in operational detail — the agent's drafting prompt is built from this |
| `tusenbruk-logo.svg` | Wordmark — Playfair + Cormorant; → `public/brand/` |
| `tusenbruk-ghost-code-injection.html` | **Obsolete as platform, but the finished design spec** (palette + type) — translate to `globals.css` |
| `instagram/captions.md` | The 5 existing pieces + the distribution voice for the social agent |
| `instagram/*.jpeg/.JPG` | Lead photos for the 5 seed articles (rolex, panerai, montblanc, porsche, defender) |
| `_archive/` | Prior IG captions doc — reference only |

### The 5 seed articles (migrate first)

From `instagram/captions.md`, these already exist (published on the old Ghost site):

1. **The Rolex you should have bought** — Rolex GMT-Master II (steel, Jubilee) · `rolex.jpeg`
2. **The deal watch** — Panerai PAM914 · `panerai.jpeg`
3. **The Montblanc 149 Flexnib** — Montblanc 149 custom flex nib · `montblanc.JPG`
4. **Enough Car** — Porsche 911 · `porsche.jpeg`
5. **First, World Car** — Land Rover Defender · `defender.jpeg`

**Action for Ryan:** export the full article text for these 5 from the old Ghost site (Ghost admin →
Export, or copy the published HTML/Markdown). Drop them in `content/<category>/` as the first seed.
If the text is gone, the agent can re-draft each from Ryan's notes + the captions — but the original
prose is preferable.

---

## 8. Launch sequence (free until traffic is large)

1. **GitHub** — create private repo `tusenbruk` (use `ryan@watauga.co`). `git init` → push.
2. **Vercel** — sign up with GitHub, import `tusenbruk`, deploy. Live `tusenbruk.vercel.app` URL in
   ~1 min. Every push to `main` now auto-deploys.
3. **Domain** — point `tusenbruk.com` DNS at Vercel (A `@` → `76.76.21.21`, CNAME `www` →
   `cname.vercel-dns.com`; trust the Vercel dashboard's exact values). Pick one primary, redirect the
   other. **Wait for the SSL padlock on both apex and www before announcing** — the classic launch-day trap.
4. **Email** — forward `desk@tusenbruk.com` (or similar) to a real inbox for `/contact` + `/submit`.
5. **Instagram / X** — distribution by hand to launch; wire the agent later.
6. **Anthropic API key** *(later)* — only when turning the agent on. Set a monthly spend cap.
7. **Analytics / SEO** *(later, free)* — Vercel Analytics, Google Search Console, `sitemap.xml`.

**Minimum to be live:** steps 1–3 + the 5 seed articles rendering well.

---

## 9. Build order for Claude Code

1. Scaffold Next.js + TS, wire fonts + palette + wordmark (brand visible immediately).
2. Build `lib/content.ts`, `lib/categories.ts`, the home / category / article pages, Header/Footer.
3. Migrate the 5 seed articles to Markdown with photos. Make them read well on mobile.
4. `about`, `submit`, `contact`. Sitemap + robots.
5. Push → Vercel → domain → SSL. **Launch on the seed content.**
6. *Only then:* build `tusenbruk-agent.py` + `assignments.yml`, run dry-run, review against the
   Three Tests, schedule once the output reliably earns the wear.

---

## 10. Open questions for Ryan

- **Categories at launch:** all 8, or just watches / cars / pens where we have content?
- **Byline:** house byline `Tusenbruk` by default, with a named byline when you write the editorial?
- **Subjects:** named real people, initials, or descriptive ("A Sydney builder")? Affects how the
  agent renders `subject` and what consent you need.
- **Old Ghost content:** can you export the 5 published pieces, or should the agent re-draft from notes?
- **Cadence:** how often will you feed the Assignment Desk? Sets the publishing rhythm.
