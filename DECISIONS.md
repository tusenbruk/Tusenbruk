# Tusenbruk — decision log

This is the shared handoff record for Ryan, Claude and Codex. It records material editorial,
design and technical decisions so future sessions can understand why the site is shaped as it is.
It is append-only: correct an earlier entry with a new dated entry rather than silently rewriting
history.

For every material change, record:

- **Decision** — what changed.
- **Why** — the editorial or technical reason.
- **Files** — the main files affected.
- **Verification** — the checks that passed.
- **Rollback** — the smallest safe way to reverse it.
- **Open work** — anything that still requires Ryan, source material or real photography.

Do not store credentials, private interview material or unpublished personal details here.

---

## 2026-08-17 — portraits first

**Decision**

- Published long-form writing is limited to portraits with a real subject and observational field
  notes grounded in the writer's own witnessed scene.
- Ownerless catalogue studies remain in the repository as drafts; they cannot lead the homepage or
  enter the public register.
- Technical specifications move from article endings into structured Register data.
- Exactly one published portrait must carry `featured: true`.

**Why**

The publication's defensible idea is the relationship between a person and an object. Object-only
histories, review tables and buying advice weaken that distinction and contradict the Three Tests.

**Files**

`editorial/tusenbruk-editorial-constitution.md`, `lib/content.ts`, published Markdown in `content/`,
the Register and homepage components, and the content validator.

**Rollback**

Revert this entry's implementation commit. Do not selectively republish catalogue studies without
also revising the constitution; the two models are intentionally incompatible.

## 2026-08-17 — anonymous house voice

**Decision**

Tusenbruk remains the visible author. There is no founder biography or personal byline. Subjects may
be named, initialled or described according to consent; published portraits carry a descriptive
`subject` field so the person cannot disappear at the data layer.

**Why**

The observer should feel interchangeable. The person whose life is being described—not the site
owner—is the human centre of each piece.

**Rollback**

The metadata can later support named contributors, but no personal byline should be introduced as a
side effect of an unrelated change.

## 2026-08-17 — live identity retained

**Decision**

Keep the live Jost + Newsreader identity and the ultramarine, specimen-red and field-green palette.
The older Playfair/Cormorant artwork remains archival brand material, not the active masthead.

**Why**

The live typography feels anonymous, editorial and workmanlike. The older treatment leans closer to
luxury retail, which is narrower than the publication.

**Rollback**

The old assets remain under `brand/`; restoring them is a discrete future redesign.

## 2026-08-17 — illustration is interpretation, not evidence

**Decision**

Illustration may support the manifesto and a story's verified detail, but it must be clearly
illustrative. Documentary photography remains real and primary. Illustrations use loose ink,
limited house colour and human gestures rather than pristine product portraits.

**Why**

This adds warmth without allowing generated imagery to masquerade as a real person's lived
experience.

**Open work**

The Panerai story still needs a real, unarranged photograph in use or immediately after use. The
existing flat lay is not acceptable as documentary evidence and is removed from the published lead.

## 2026-08-17 — mechanical accuracy over decorative completion

**Decision**

The generated bracelet-screw illustration was rejected and removed from both the Rolex article and
the project assets because it depicted an incorrect repair method. It is not being replaced without
an accurate visual reference.

**Why**

An illustration can simplify a verified detail, but it cannot misrepresent how an object works.
Accuracy outranks the desire to give every story a decorative spot.

## 2026-08-17 — implementation record

**Decision**

The portraits-first editorial and design reset was implemented locally as one reviewable change set.
It has not been committed, pushed or deployed.

**Files**

- Editorial pages and published Markdown under `content/`
- Content model and Register rendering in `lib/content.ts` and `app/register/`
- Homepage, article, navigation, photography and responsive styles under `app/` and `components/`
- Content and metadata checks under `scripts/`
- Two retained illustrations under `public/illustrations/`
- Regenerated share cards under `public/cards/`

**Verification**

- `npm run validate:content`: seven published pieces, one featured portrait, no published catalogue
  studies or article specification tables, and required subjects/photo alt text present.
- `npm run validate:metadata`: clean across public photos, illustrations and share cards.
- `npm run build`: production build and TypeScript checks pass; 29 static pages generated.
- Visual review at 1280 × 720 and 390 × 844: no horizontal overflow; mobile navigation targets are
  44px high; the Drawer reveals catalogue cards on touch; article ledes precede lead photographs.

**Rollback**

Once committed, revert the implementation commit as a unit. Before that point, review with
`git diff`; do not discard the binary photo changes independently because they are the metadata-only
privacy pass.

**Open work**

- Supply a real, unarranged Panerai photograph from use or immediately after use.
- Replace any illustration only from an accurate reference when its mechanical detail matters.

## 2026-08-17 — visual accuracy correction and social desk

**Decision**

- Remove the About panorama, Panerai cuff illustration and homepage Tank spot. No generated image
  depicting a named object or mechanical action remains in the published site.
- Correct the PAM00914 copy: it has hours and minutes only, not small seconds. Unsupported strap,
  crown-guard and cuff claims are removed rather than replaced.
- Articles without a qualifying documentary photograph receive an intentional text-only share card.
- Social distribution begins as a human-reviewed Instagram desk under `social/`: profile spec,
  queue, manifesto, 4:5 carousels, Stories, captions and alt text. Nothing posts automatically.

**Why**

Mechanical accuracy outranks decorative completion. Social posts are another editorial surface, so
they must be grounded in the same lived details and real photography as the articles.

**Files**

`content/pages/about.md`, `content/watches/the-deal-watch.md`, `app/page.tsx`,
`components/TankSpot.tsx`, `scripts/make_cards.py`, `scripts/make_social_assets.py`, `social/`,
article metadata and the native share control.

**Verification**

Run `npm run social:assets`, `npm run validate:social`, `npm run validate:content`,
`npm run validate:metadata` and `npm run build` before deployment.

**Rollback**

Revert the implementation commit. Do not restore the rejected illustrations independently; their
removal is an accuracy correction, not a stylistic preference.

**Open work**

- Supply a real, unarranged Panerai photograph and confirm the remaining lived details before its
  social queue item can leave `hold`.
- Keep Instagram publishing manual until the review queue produces consistently good posts.

## 2026-08-17 — visual accuracy corrections: three assets removed, no replacements

**Decision**

Identifiable objects and mechanical actions require a named reference and a reliable visual
source before they can be illustrated. Manufacturer material — technical diagrams, dated official
photography — should be the source for any illustration depicting a specific mechanism. Where
accuracy cannot be established, the piece runs with real photography if it exists, or with the
space left quiet. It does not run with a plausible-looking invention.

Three assets were removed under this standard, none replaced:

- The About-page use panorama (`public/illustrations/about-use-panorama.jpg`) — a generated
  composite of hands winding a watch, closing a case and writing with a pen. No single reference
  grounded any of the three gestures, and stitched together they implied a documentary moment that
  never happened.
- The Panerai crown-guard illustration (`public/illustrations/panerai-cuff-catch.jpg`) and its
  `cardImage` reference in "The deal watch" — depicting how a cuff catches the lever-lock guard
  without ever being checked against the PAM914's actual guard geometry. The existing
  `public/photos/panerai-8giorni.jpg` was not substituted as a replacement lead photograph: it is
  an arranged flat-lay and fails the site's own photography rule (object in use, or after use;
  never arranged).
- The homepage Tank spot illustration (`components/TankSpot.tsx`) — a generic wristwatch case and
  dial construction with no named reference model. With a real Cartier Tank Louis named in the
  Kit, an invented case shape on the homepage risked reading as documentation of a specific watch
  it was never drawn from.

**Why**

Stylisation may simplify appearance, but it must not change where parts sit, what connects to
what, or how a hand or tool interacts with an object — the standard already applied when the
bracelet-screw illustration was removed. None of these three had a named reference behind the
mechanical claim it made. A drawing that only resembles a category of object stops being
acceptable the moment a reader could mistake it for documentation of a specific one.

**Files**

- `content/pages/about.md`, `content/watches/the-deal-watch.md` — illustration references removed
- `public/illustrations/about-use-panorama.jpg`, `public/illustrations/panerai-cuff-catch.jpg` —
  deleted
- `components/TankSpot.tsx` — deleted; `app/page.tsx`, `app/globals.css` — homepage Notes section
  simplified to a single column in its place
- `content/writing/the-montblanc-149-flexnib.md` — lead-photo `photoAlt` corrected to describe
  only what `public/photos/l1011050.jpg` actually shows (the pen resting across handwritten pages;
  the flex nib is not in frame). The later nib photograph and its caption are unchanged and accurate.
- `scripts/make_cards.py` — the share-card generator now draws an intentionally designed,
  text-only card (plate-white, ultramarine rules, plate label, title, red square, "Tusenbruk") for
  any piece with no `photo` or `cardImage`, rather than leaving an empty photographic layout;
  `public/cards/the-deal-watch.jpg` regenerated under this path

**Verification**

- `npm run validate:content`, `python3 scripts/make_cards.py`, `npm run validate:metadata`,
  `npm run build` all pass.
- The regenerated text-only card for "The deal watch" was reviewed visually: two ultramarine
  rules, plate label, title and the red-square wordmark, reading as a complete card rather than a
  blank photograph.
- Repo-wide search for `illustrations/` and `TankSpot` returns no live references — only this
  log's own historical entries, which are correctly append-only.

**Rollback**

Revert this entry's implementation commit. Any future illustration for these three spots needs a
named reference — a manufacturer diagram, a dated product photograph, or Ryan's own reference
shot — before it is drawn.

**Open work**

- A real, unarranged Panerai photograph (crown guard, in use or immediately after) is still needed
  before "The deal watch" carries a lead image again.
- The About page and the homepage Notes section remain without illustration until an accurate
  reference exists for either.

## 2026-08-17 — Instagram relaunch

**Decision**

- Update `@tusenbruk` with the prepared monogram avatar and the portraits-first bio.
- Publish the five-slide manifesto carousel as the sole public launch post.
- Archive the three earlier posts rather than deleting them.
- Keep all article packs in `draft` and the Panerai pack on `hold` until each is reviewed.

**Why**

The account should introduce the publication before distributing individual stories. Archiving is
reversible and preserves the earlier material while removing inconsistent crops, hashtags and the
staged Panerai image from the public grid.

**Verification**

- The public profile shows the new avatar, new bio and one public post.
- The manifesto is live at `https://www.instagram.com/tusenbruk/p/DcHvmiLH5aH/`.
- The three previous posts appear in the archive and were not deleted.
- `social/queue.json` records the manifesto as `published`; all other status gates remain intact.

**Rollback**

Restore individual posts from Instagram's archive. Revert the avatar or bio in Edit Profile. Do not
change queue statuses without also recording what was restored or unpublished.

## 2026-08-17 — the pleasure of use and the anti-synthetic pass

**Decision**

- Replace “Earn the wear” with “The pleasure of use” as the public tagline. Keep “Use is the proof”
  as an editorial principle and “A thousand uses” as the meaning behind the name.
- Make `editorial/tusenbruk-editorial-voice/SKILL.md` the canonical, editable skill source and
  generate the portable `.skill` archive from it.
- Add an explicit anti-synthetic editing pass: no product personification, prestige metaphors,
  slogan stacks, generic revelations, repeated review headings, unsupported universals or tidy
  morals.
- Apply that pass to all seven published pieces and the About page without adding lived detail.
- Archive the first manifesto post and replace it with the corrected five-slide version.

**Why**

“Earn” made wear sound like a test. Tusenbruk is interested in the ordinary pleasure of continuing
to use something. The published articles had also begun to share a visible generated scaffold:
“What stays”, “What grates”, “The thousand uses”, followed by an explained conclusion. Repetition
was weakening otherwise useful human details.

**Files**

The canonical voice skill and its packager under `editorial/` and `scripts/`; the constitution,
About page, published Markdown, global metadata, footer, share-card generator, social profile and
queue, brand SVGs and generated cards.

**Verification**

- The canonical skill passes `quick_validate.py` and the `.skill` archive builds from it.
- Content, social and metadata validation pass; the production build generates all 29 pages.
- The public Instagram profile shows the new bio and one corrected manifesto post at
  `https://www.instagram.com/tusenbruk/p/DcHz30ZEpZf/`.
- The previous manifesto is archived, not deleted.

**Rollback**

Revert this implementation commit and reinstall the prior `.skill` archive. The old manifesto can
be restored from Instagram's archive, but doing so would also restore the retired tagline.

## 2026-08-17 — fixtures of a life, and the self-implication that earns it

**Decision**

- Deepen the constitution's opening beyond "not a collector's resource" into a positive claim:
  these are functional objects, designed to disappear into a life rather than be preserved apart
  from one, and that use is what lets them end up holding a piece of it. "The scratch is where the
  memory lives" replaces "they accumulate evidence" as the load-bearing line.
- Restore, and make explicit, the self-implication principle that the source-rule and
  anti-synthetic passes had thinned to a fragment. The writer's own complicity — one sentence,
  once, admitting he has his own version of whatever attachment the piece is noticing — is now a
  named, checkable requirement in both the constitution and the skill, not a residual trait of
  "knowing restraint."
- Restore two structural sections to the canonical skill that this morning's anti-synthetic
  rewrite had dropped entirely: **The persona** (the writer as debonair, amused, quietly sad about
  a receding world, never making a speech about it) and **The undertow** (who gets implicated,
  never a complaint about other people, never nostalgia as an argument, never a prescription).
  Restore **Design IQ** as the mechanical reason a well-made object earns fixture status.
  Today's genuinely good additions — the non-negotiable source rule, the anti-synthetic pass, the
  editing sequence — are kept as-is and merged in, not reverted.
- Add one new anti-synthetic pattern: a "reverent memory-claim" (an object "holds" or "carries" a
  life) with no self-implication anywhere in the piece to pay for it. Add one new editing-sequence
  step to check for it.

**Why**

The morning's rewrite fixed a real problem — AI-tell scaffolding, slogan stacks, explained
emotion — but in tidying that noise it also compressed the Coggins voice from five distinct moves
to "exact objects, knowing restraint, no fuss," and dropped self-implication specifically. The
effect showed up in a single line: "(Your correspondent would have ticked the S box, and knows
it.)" survived the pass as "(Your correspondent would have ticked the S box.)" — the joke's shell
kept, the self-implication that made it Coggins rather than a stray opinion cut. That's the
mechanism this entry restores, and it matters more now than before the constitution's opening
changed: "these objects hold the memory of a life" is one sentence away from a greeting card
without it. Self-implication is the toll booth, not decoration.

**Files**

`editorial/tusenbruk-editorial-constitution.md` (opening section rewritten; self-implication added
as a named Voice principle), `editorial/tusenbruk-editorial-voice/SKILL.md` (canonical source:
persona, undertow and Design IQ restored and updated for the fixture framing; one new
anti-synthetic pattern; one new editing-sequence step), `.claude/skills/tusenbruk-editorial-voice/SKILL.md`
and `editorial/tusenbruk-editorial-voice.skill` (both regenerated from the canonical source via
`scripts/package_editorial_skill.py`).

**Verification**

- `.claude/skills/tusenbruk-editorial-voice/SKILL.md` and the unzipped `.skill` archive both diff
  clean against the canonical source.
- `npm run validate:content`, `npm run validate:metadata` and `npm run build` all pass; no
  published piece was touched, so no article needed re-drafting for this change.

**Rollback**

Revert this entry's implementation commit and regenerate the `.skill` archive from the reverted
source. No published article content changes with this entry — a rollback affects only the
constitution and the skill's guidance for future drafts.

**Open work**

- None of the seven published pieces were rewritten against the restored self-implication
  principle. A light pass — not a full rewrite — would bring them in line: most already have the
  observed-fact discipline the anti-synthetic pass wanted; what's missing in most is the one
  admitting sentence.

## 2026-08-17 — a fourth kind: the essay, and where prescription is allowed to live

**Decision**

- Add `kind: essay` as a fourth, publishable article kind alongside portrait, field-note and
  (draft-only) study. An essay argues across real, referenced examples rather than following one
  person's use of one object; it does not require `subject` or `object`, is not eligible for
  `featured`, and is excluded from `/register`, which catalogues objects rather than arguments.
- Publish the first one: "The watch you're supposed to buy," arguing that a Submariner bought as a
  professional's default deserves the same consideration a GMT-Master or Sea-Dweller buyer already
  gave their purchase — referencing the published "The Rolex you should have bought" as its worked
  example, and drawing its Sea-Dweller 116600 facts from the existing draft study of the same
  reference.

**Why**

Ryan asked to expand "The Rolex you should have bought" with a critical case against buying a
Submariner by default — a real, worthwhile argument, but a direct prescription ("buy this instead")
inside a portrait would have broken two rules this project hardened only hours earlier: "never a
prescription" and "never a complaint about other people." A portrait's whole discipline is staying
inside one person's real, sourced relationship with one object; grafting a category-wide argument
onto it would have compromised both the piece and the rule.

The right fix wasn't to bend the portrait rule — it was to notice that Tusenbruk didn't yet have a
publishable format for an argument at all, and give it one with a narrower, explicit license: an
essay is the only kind allowed to make a comparative case, provided every claim in it is still real
and checkable, exactly as everywhere else on the site.

**Files**

`lib/content.ts` (kind type extended; Register excludes essays), `scripts/validate_content.mjs`
(essay added to publishable kinds; `object` no longer required for it), `app/writing/[slug]/page.tsx`
(dateline shows "· Essay"), `CLAUDE.md` (kind documented), `content/watches/the-watch-youre-supposed-to-buy.md`
(new).

**Verification**

- `npm run validate:content`: 8 published pieces, 1 featured portrait.
- `python3 scripts/make_cards.py`: text-only fallback card generated and reviewed — two-line title
  wraps and centres correctly.
- `npm run validate:metadata` and `npm run build` both pass; 30 static pages generated.
- Checked locally: the essay does not appear in `/register`; it leads `/writing` and `/archive` on
  date as normal; the homepage still features "The Rolex you should have bought" and does not pick
  the essay as a secondary (same plate as the featured piece, by the existing secondary-selection
  rule); both inline images (the reused GMT-Master photo, the reused Sea-Dweller reference photo)
  load and link correctly; the cross-reference link to the Rolex piece resolves.

**Rollback**

Revert this entry's implementation commit. Removing `kind: essay` from the validator's allowed list
would immediately fail `validate:content` on this piece, which is the intended trip-wire if the
essay format is ever misused for something a portrait or study should have been instead.

**Open work**

- Only one essay exists so far. If more are written, the canonical skill should get its own short
  section on the format once the pattern is clearer than a single example can show.
