// The lede is the opening of a piece that sits above the lead photograph.
// It ends at whichever comes first: a horizontal rule ("---" on its own line)
// or the first "##" heading. The drop cap in the CSS applies to the lede only.
// If neither exists the whole body is the lede and there is no remainder.
export function splitLede(body: string): { lede: string; remainder: string } {
  const rule = body.match(/\n---\s*\n/);
  const heading = body.match(/\n(?=##\s)/);
  const candidates = [
    // For a rule, skip past the rule itself; for a heading, keep it in the remainder.
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
