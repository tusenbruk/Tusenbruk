#!/usr/bin/env python3
"""Tusenbruk X distributor — drafts an X (Twitter) post for each published piece.

Nothing is posted automatically. The script writes drafts to agent/drafts/ as
text files; read one, edit it if you like, and post it with the matching card
image from public/cards/<slug>.jpg.

    python3 agent/x_distributor.py            # draft the newest piece
    python3 agent/x_distributor.py --all      # draft everything not yet drafted

House rules for the drafts themselves: no hashtags, no exclamation marks,
no "new post!" throat-clearing. Title, one line, link.
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, "content")
DRAFTS = os.path.join(ROOT, "agent", "drafts")
BASE = "https://tusenbruk.com"
os.makedirs(DRAFTS, exist_ok=True)

def fm(raw):
    m = re.match(r"(?s)^---\n(.*?)\n---", raw)
    d = {}
    if m:
        for line in m.group(1).splitlines():
            kv = re.match(r"(\w+):\s*(.*)$", line.strip())
            if kv:
                d[kv.group(1)] = kv.group(2).strip().strip('"')
    return d

posts = []
for plate_dir in os.listdir(CONTENT):
    full = os.path.join(CONTENT, plate_dir)
    if not os.path.isdir(full) or plate_dir in ("notes", "pages"):
        continue
    for f in os.listdir(full):
        if not f.endswith(".md"):
            continue
        d = fm(open(os.path.join(full, f)).read())
        if d.get("draft") == "true":
            continue
        posts.append(d)

posts.sort(key=lambda d: d.get("date", ""), reverse=True)
todo = posts if "--all" in sys.argv else posts[:1]

for d in todo:
    slug = d.get("slug", "untitled")
    out = os.path.join(DRAFTS, f"{slug}.txt")
    if os.path.exists(out) and "--force" not in sys.argv:
        print(f"skip (drafted): {slug}")
        continue
    summary = d.get("summary", "")
    # first sentence of the summary, or the whole thing if it's short
    first = re.split(r"(?<=[.!?])\s", summary)[0] if summary else ""
    text = f"{d.get('title')}\n\n{first}\n\n{BASE}/writing/{slug}"
    with open(out, "w") as fh:
        fh.write(text + f"\n\n[attach: public/cards/{slug}.jpg]\n")
    print(f"drafted: {slug}")
