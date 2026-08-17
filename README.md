# Tusenbruk — Central Repository

Single source of truth for everything Tusenbruk: the publication, the brand, the content, and
the plan to relaunch the site. Consolidated 19 June 2026.

Tusenbruk is a publication about the relationship between a person and the objects they *use* —
watches, cameras, pens, notebooks, folios, attachés, cars, luggage. Not reviews. Portraits.

## Where everything lives

| Folder / file | What's in it |
|---|---|
| `AGENTS.md` | Build brief for Claude Code — read first. The stack, guardrails, milestones. |
| `DECISIONS.md` | Shared, append-only rationale and rollback log for Ryan, Claude and Codex. |
| `BUILD-PLAN.md` | Full build plan: site map, content model, design system, agent spec, launch steps. |
| `editorial/` | **The spine.** Editorial constitution + canonical voice skill source and packaged `.skill` archive. |
| `.claude/skills/` | Generated project-level skill used automatically by Claude Code; refresh with `python3 scripts/package_editorial_skill.py`. |
| `social/` | Instagram profile specification, human approval queue, generated carousels, Stories and caption packs. Nothing auto-posts. |
| `brand/` | Logos (svg + hero + primary png) and the old Ghost CSS — now the **design spec** (palette + type). |
| `content-source/` | The raw content to seed the new site (see below). |
| `content-source/ghost-export/` | **The Ghost export — 26 posts (6 published, 20 drafts).** The real article archive. |
| `content-source/instagram/` | Launch social captions + the 5 lead images. |
| `content-source/kit-posts-ready.md` | The "Kit" recommendations queue. |
| `content-source/tusenbruk-ghost-guide.md` | Old Ghost setup notes (reference). |
| `photos/` | **186 MB real photo library**, by object: 911, Defender 90, Leica M11, Leica Q2, Montblanc 149, Rolex GMT — plus loose hero shots. Lead photos for the pieces. |
| `_archive/` | Old code + theme zips, kept out of the way (see below). |

## The content you already have (don't rebuild this)

The Ghost export (`content-source/ghost-export/tusenbruk.ghost.2026-04-06-20-41-06.json`) holds
**26 posts**. Published: *The Rolex you should have bought, The deal watch, The Montblanc 149
Flexnib, Enough Car, First World Car (Defender), The Leica Q2,* plus *About* and *Kit.* Drafts
(20): Leica Q3 43, Leica M11, two Leica lenses, AP Royal Oak (Kasparov), two Porsche 911s,
Defender 90 Puma, Rolex Day-Date, Cartier Santos, two Montblanc pens, two Rimowa cases, Clegg
attaché, Filson briefcase, Hermès planner, Smythson notebook.

**First job for Claude Code:** convert these out of the Ghost JSON into Markdown in
`content/<category>/` — that's the launch library, already written in the house voice.

## `_archive/` — kept, not deleted

- `old-nextjs-supabase-app/` — the abandoned v2 (Next.js + Supabase CMS + admin auth). Its `.git`
  history and `.env.local` (old admin creds) are inside. Reference only; the new build starts fresh.
- `ghost-themes-and-zips/` — old Ghost theme + version snapshots (v121/v122/v130) and two
  hash-named downloads. Superseded; safe to delete once you're sure you don't want them.

## What was removed in the cull

`node_modules/` and `.next/` (regenerable build output), empty `Tusenbruk Uploads/`, and OS
`.DS_Store` files. Took the folder from ~620 MB to ~200 MB. Nothing with unique content was deleted —
old code and themes were archived, not removed.

_The pleasure of use._
