# Tusenbruk — working guide for Claude Code

Tusenbruk is a publication about the relationship between a person and the objects they use —
watches, cameras, pens, cars, luggage. Not reviews. Portraits. Tagline: *The pleasure of use.*

Before material editorial, design or architecture work, read `DECISIONS.md`. Append an entry when a
change establishes or reverses a durable decision; include the reason, verification and rollback.

For editorial work, read `editorial/tusenbruk-editorial-voice/SKILL.md`. It is canonical. After
changing it, run `python3 scripts/package_editorial_skill.py` and reinstall the resulting
`editorial/tusenbruk-editorial-voice.skill` in Cowork if needed. The same command refreshes the
project-level `.claude/skills/tusenbruk-editorial-voice/SKILL.md` used by Claude Code.

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
photoAlt: "A scratched watch clasp resting against a workbench edge."
photoCaption: "Pentecost River, 6.40am. Leica M6, Portra 400."
subject: "A Sydney builder"
place: "Sydney, Australia"
draft: true
---

Body in markdown. First paragraph gets a drop cap automatically.
```

- `draft: true` keeps it out of the build entirely. Remove the line to publish.
- Exactly one published portrait carries `featured: true`; the build fails if it is missing or
  duplicated.
- `object` is the catalogue name — it groups pieces in `/register` and appears on the
  homepage drawer's flip cards. Reuse the exact string when writing about the same object again.
- `subject` is required for every published portrait. It can be a consented name, initials or a
  descriptive identity. `photoAlt` is required whenever `photo` is present.
- Ownerless catalogue studies may remain as `draft: true` research dossiers, but are never a
  publishable article type. `kind: field-note` is reserved for witnessed, observational scenes.
- `kind: essay` is a publishable argument grounded in real, referenced examples — no single
  subject or object, so `subject` and `object` are not required and it doesn't enter `/register`.
  It's the only kind allowed to make a comparative case (a portrait never tells the reader what to
  buy; an essay can argue, provided every claim is still real and sourced).
- 18 migrated drafts already sit in `content/` waiting to be finished — each holds an
  interview brief; fill it with real detail and a session drafts the piece.

## After adding or editing a post

```bash
python3 scripts/make_cards.py     # regenerate share cards (public/cards/<slug>.jpg) — commit them
npm run social:assets             # regenerate Instagram carousel, Story, caption and alt-text packs
npm run validate:social           # check every queued asset and its dimensions
python3 agent/x_distributor.py    # legacy X draft; never posts automatically
```

Vercel never runs Python; cards and social packs must be generated locally and committed. Social
approval lives in `social/queue.json`. A `hold` is a hard stop and must never be bypassed by an
automated publisher.

## Sections (all static, all derived from frontmatter)

- `/register` — every object, numbered by first appearance (`object` field groups pieces)
- `/archive` — one line per piece, with client-side search (full text via /search-index.json)
- `/photographs` — every photo on the site, linking to its piece
- Homepage drawer — photo mosaic; tiles flip on hover and show a persistent catalogue card on touch

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

`content/pages/about.md`. Buying guides and price-led recommendation pages are out of scope.

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
