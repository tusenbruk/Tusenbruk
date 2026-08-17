# AGENTS.md — Build instructions for Tusenbruk

You are building **Tusenbruk**, a publication about the relationship between a person and the
objects they *use* — watches, cameras, pens, notebooks, folios, attachés, cars, luggage. Not a
review site. Not a buyer's guide. Portraits of people, seen through their well-used things.

This is a fresh start. Two earlier attempts (on Ghost) never landed. We now copy a proven pattern:
the **CoCCuLiNi / Touchdown Tennessee** stack — Next.js on Vercel, articles as Markdown in the repo,
a Python agent that drafts in the house voice. Lift that structure directly and re-skin it.

## Read order

1. This file — stack, guardrails, milestones.
2. `editorial/tusenbruk-editorial-constitution.md` — **the spine. Read before any content logic.**
3. `editorial/tusenbruk-editorial-voice/SKILL.md` — the canonical voice skill. The `.skill`
   archive beside it is generated from this file.
4. `BUILD-PLAN.md` (this folder) — site map, content model, design system, agent spec, launch steps.
5. `DECISIONS.md` — shared rationale, verification and rollback history for Claude and Codex.

## The reference build

A directly analogous site already runs: **CoCCuLiNi** (and its sister, Touchdown Tennessee). If you
can get access to the CoCCuLiNi repo, **lift its structure file-for-file and reskin** — it is the
same shape with a different beat. The pattern:

- **Next.js 14 (App Router) + TypeScript**, deployed on **Vercel** (auto-deploy on git push).
- **Articles as Markdown** in `content/<category>/*.md` with frontmatter, parsed with `gray-matter`,
  rendered with `react-markdown` + `remark-gfm`. No CMS to launch.
- Static-generated; near-zero hosting cost.
- **A Python publishing agent** that drafts articles with the Claude API and commits them — the
  commit triggers a Vercel deploy.

## Hard guardrails (do not violate)

1. **The person is the product.** Every piece must pass the constitution's **Three Tests**: you
   cannot remove the person; there is a detail only this person could have given; the ending earns
   its silence. Objects without people are catalogues — reject them.
2. **The agent does not invent lived experience.** This is the single most important rule, and the
   one that separates Tusenbruk from CoCCuLiNi. CoCCuLiNi's agent scans public news and writes facts.
   Tusenbruk is about *one real person's real relationship with a real object* — which the agent
   cannot know. The agent only ever drafts **from source material a human supplies** (Ryan's notes,
   an interview transcript, a voice memo, a list of specific details). No invented scratches, no
   invented people, no fabricated detail. If the source lacks a unique detail, the draft fails.
3. **Restraint over reverence.** No hype, no superlatives, no exclamation marks. Objects don't
   deserve worship; they deserve use. Cut any sentence that explains itself.
4. **Photography is real.** Object in use or after use. Never on white. Never arranged. The scratch
   is visible. (See the constitution's photography rule.)
5. **Cost discipline.** Do not wire a paid agent loop until the site renders and reads well. Get the
   prototype right with seed articles first, then run the agent in dry-run, then schedule it.

## First milestone

A clean, well-designed prototype rendering the Tusenbruk brand (Jost + Newsreader,
the plate-white/ultramarine/specimen-red palette) with the existing portraits seeded as Markdown — *before* any paid
agent run. Then stand up the drafting agent in draft-only mode, review against the Three Tests, and
only then schedule it.

_The pleasure of use._
