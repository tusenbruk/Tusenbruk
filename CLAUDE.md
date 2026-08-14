# Tusenbruk — working guide for Claude Code

Tusenbruk is a publication about the relationship between a person and the objects they use —
watches, cameras, pens, cars, luggage. Not reviews. Portraits. Tagline: *Earn the wear.*

## Stack

- Next.js 14 (App Router) + TypeScript, statically generated. No CMS, no database, no subscriptions.
- Posts are markdown files in `content/<plate>/*.md`, parsed with gray-matter, rendered with react-markdown.
- Deployed on Vercel free tier; every push to `main` on GitHub auto-deploys.
- Design system: the "P. Ryan Welker stationery pack" — Jost + Newsreader, ultramarine `#16306B`,
  specimen red `#B2262C`, field green `#2E6B5E`, plate white. Capitals are always Jost. No bold anywhere.
  Plate labels are the only decorative device on the site.

## The plates (categories)

| Plate | Key | Colour |
|---|---|---|
| Pl. i — Photography | `photography` | red |
| Pl. ii — Watches | `watches` | green |
| Pl. iii — Motoring | `motoring` | green |
| Pl. iv — Writing | `writing` | red |
| Pl. v — Carry | `carry` | green |
| Pl. vi — Travel | `travel` | red |

Defined in `lib/plates.ts`.

## Creating a post

Create `content/<plate>/<slug>.md`:

```markdown
---
title: "The case that was never polished"
slug: the-case-that-was-never-polished
object: "Rolex GMT-Master II 116710LN"
plate: watches
date: 2026-08-13
summary: "One or two sentences for the homepage and index."
photo: /photos/my-lead-photo.jpg
photoCaption: "Pentecost River, 6.40am. Leica M6, Portra 400."
place: "Sydney, Australia"
draft: true
---

Body in markdown. First paragraph gets a drop cap automatically.
```

- `draft: true` keeps it out of the build entirely. Remove the line to publish.
- `featured: true` pins it as the homepage lead (otherwise newest wins).
- `object` is the catalogue name — it groups pieces in `/register` and appears on the
  homepage drawer's flip cards. Reuse the exact string when writing about the same object again.
- `kind: study` marks a catalogue study — an object-history piece with no owner, written from
  the public record and free-licensed photos (attribution in `photoCaption`). Studies exist so
  an object can enter the register before its portrait; the portrait uses the same `object`
  string and a different slug. Portraits (the default) still require Ryan's source material —
  the no-invented-experience rule is absolute either way.
- 18 migrated drafts already sit in `content/` waiting to be finished — each holds an
  interview brief; fill it with real detail and a session drafts the piece.

## After adding or editing a post

```bash
python3 scripts/make_cards.py     # regenerate share cards (public/cards/<slug>.jpg) — commit them
python3 agent/x_distributor.py    # draft an X post into agent/drafts/<slug>.txt (never auto-posts)
```

Vercel never runs Python; cards must be generated locally and committed.

## Sections (all static, all derived from frontmatter)

- `/register` — every object, numbered by first appearance (`object` field groups pieces)
- `/archive` — one line per piece, with client-side search (full text via /search-index.json)
- `/photographs` — every photo on the site, linking to its piece
- Homepage drawer — photo mosaic; tiles flip to a catalogue card, no titles shown

## Adding photos

Originals live in `photos/` (git-ignored, 186 MB library, organized by object). Web copies go in
`public/photos/`. Always resize before committing:

```bash
sips -s format jpeg -s formatOptions 78 --resampleWidth 1600 "photos/<dir>/<file>.JPG" --out "public/photos/<name>.jpg"
```

Then reference as `/photos/<name>.jpg` in frontmatter or markdown body. Never commit an original—
keep the repo lean.

Captions live in metadata: `photoCaption` in frontmatter for the lead photo (place, time, camera,
film — "Pentecost River, 6.40am. Leica M6, Portra 400."). Ryan hands over caption details in any
loose form; normalize them into the frontmatter.

Photography rule: object in use, or after use. Never on white. Never arranged. The scratch is visible.

## Notes

Short observations, dated, no titles — `content/notes/<yyyy-mm-dd>-<slug>.md`:

```markdown
---
date: 2026-08-13
---

One to three sentences. That's the format.
```

The homepage shows the last four.

## Pages

`content/pages/about.md` and `content/pages/kit.md`.

## Voice — hard guardrails

Read `editorial/tusenbruk-editorial-constitution.md` before writing or editing any piece. The
`tusenbruk-editorial-voice` skill has the operational detail. Non-negotiable:

1. **Never invent lived experience.** Draft only from source material Ryan supplies (notes, transcripts,
   voice memos). No invented scratches, people, or details. If the source lacks a unique detail, the draft fails.
2. **The Three Tests**: the person can't be removed; there's a detail only this person could give;
   the ending earns its silence.
3. **Restraint over reverence.** No hype, no superlatives, no exclamation marks. No bold text in posts.

## Publishing

```bash
npm run dev      # preview at localhost:3000
npm run build    # verify the static build passes
git add -A && git commit -m "..." && git push   # push to main → Vercel deploys
```
