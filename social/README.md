# Tusenbruk social desk

This folder turns a published piece into a reviewable social pack. Nothing posts automatically.

## Profile

The intended Instagram profile is recorded in `profile.json`. The avatar source and upload-ready
JPEG live in `brand/`.

## Queue

`queue.json` is the approval record. Each item is `draft`, `ready`, `published` or `hold`.
`hold` is a hard stop: the asset generator will not create a pack for it.

Every caption follows the same order:

1. One detail only this person or witnessed scene could supply.
2. The relationship in two or three restrained sentences.
3. The article title and link-in-bio direction.
4. No more than three precise hashtags.

## Generate

```bash
npm run social:assets
npm run validate:social
```

Each publishable article receives:

- `01-photo.jpg` — 1080 × 1350, the complete documentary photograph in an editorial frame.
- `02-detail.jpg` — 1080 × 1350, the human detail in type.
- `03-read.jpg` — 1080 × 1350, title and reading direction.
- `story.jpg` — 1080 × 1920.
- `caption.txt` and `alt.txt`.

The manifesto is a five-slide carousel. Generated files live under `output/` and contain no camera
metadata. Re-run the generator after changing queue copy or replacing photography.

## Publishing rule

Review the pack, mark it `ready`, then publish by hand. Direct API publishing remains deferred until
the manual packs are consistently right. Credentials belong in environment variables, never here.
