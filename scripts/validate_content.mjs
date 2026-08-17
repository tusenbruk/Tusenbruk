import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const contentRoot = path.join(root, "content");
const plates = ["photography", "watches", "motoring", "writing", "carry", "travel"];
const errors = [];
const slugs = new Map();
const published = [];
const syntheticPatterns = [
  [/^##\s+What stays\s*$/im, 'template heading "What stays"'],
  [/^##\s+What grates\s*$/im, 'template heading "What grates"'],
  [/^##\s+(?:The\s+)?thousand uses\s*$/im, 'template heading "The thousand uses"'],
  [/\b(?:the|this) (?:camera|watch|car|pen|object) (?:does not|doesn't) care\b/i, "product personification"],
  [/\b(?:that|this) is the (?:whole )?point\b/i, 'generic conclusion "that is the point"'],
  [/\bin the truest sense\b/i, 'generic conclusion "in the truest sense"'],
  [/\bthe room (?:gets|goes|becomes) (?:a little )?quieter\b/i, "cinematic stage direction"],
];

function error(file, message) {
  errors.push(`${path.relative(root, file)}: ${message}`);
}

function checkAsset(file, asset) {
  if (!asset?.startsWith("/")) return;
  const target = path.join(root, "public", asset.slice(1));
  if (!fs.existsSync(target)) error(file, `missing public asset ${asset}`);
}

for (const plate of plates) {
  const dir = path.join(contentRoot, plate);
  if (!fs.existsSync(dir)) continue;
  for (const name of fs.readdirSync(dir).filter((file) => /\.mdx?$/.test(file))) {
    const file = path.join(dir, name);
    const { data, content } = matter(fs.readFileSync(file, "utf8"));
    if (data.draft) continue;

    const slug = data.slug ?? name.replace(/\.mdx?$/, "");
    const kind = data.kind ?? "portrait";
    published.push({ file, data, content, slug, kind });

    if (slugs.has(slug)) error(file, `duplicate slug also used by ${path.relative(root, slugs.get(slug))}`);
    slugs.set(slug, file);

    if (!data.object) error(file, "published writing requires an object");
    if (kind === "study") error(file, "catalogue studies must remain draft-only");
    if (!['portrait', 'field-note'].includes(kind)) error(file, `unsupported published kind ${kind}`);
    if (kind === "portrait" && !data.subject) error(file, "published portraits require a subject");
    if (data.featured && kind !== "portrait") error(file, "only a portrait can be featured");
    if (data.photo && !data.photoAlt) error(file, "lead photographs require photoAlt");
    if (/^##\s+At a glance\s*$/im.test(content)) {
      error(file, "technical tables belong in frontmatter details and the Register");
    }
    for (const [pattern, label] of syntheticPatterns) {
      if (pattern.test(content)) error(file, `synthetic prose marker: ${label}`);
    }

    checkAsset(file, data.photo);
    checkAsset(file, data.cardImage);
    for (const match of content.matchAll(/!\[[^\]]*\]\((\/[^)\s]+)\)/g)) checkAsset(file, match[1]);
  }
}

const featured = published.filter(({ data }) => data.featured);
if (featured.length !== 1) {
  errors.push(`content: expected exactly one featured published portrait; found ${featured.length}`);
}

if (errors.length) {
  console.error(`Content validation failed (${errors.length}):\n\n${errors.map((item) => `- ${item}`).join("\n")}`);
  process.exit(1);
}

console.log(`Content validation passed: ${published.length} published pieces, 1 featured portrait.`);
