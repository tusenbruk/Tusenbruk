// The plate system: every piece carries a plate label in its category colour —
// the only decorative device on the site. Red and green alternate by plate.
export type PlateKey =
  | "photography"
  | "watches"
  | "motoring"
  | "writing"
  | "carry"
  | "travel";

export interface Plate {
  key: PlateKey;
  numeral: string; // roman, lowercase — "Pl. i"
  name: string;
  color: "red" | "green";
  description: string;
}

export const PLATES: Plate[] = [
  { key: "photography", numeral: "i", name: "Photography", color: "red", description: "Cameras and lenses, carried and used." },
  { key: "watches", numeral: "ii", name: "Watches", color: "green", description: "Worn daily, serviced rarely, never polished." },
  { key: "motoring", numeral: "iii", name: "Motoring", color: "green", description: "Cars that are driven, not stored." },
  { key: "writing", numeral: "iv", name: "Writing", color: "red", description: "Pens, notebooks, planners — the analogue desk." },
  { key: "carry", numeral: "v", name: "Carry", color: "green", description: "Luggage, attachés, folios. What travels takes the wear." },
  { key: "travel", numeral: "vi", name: "Travel", color: "red", description: "The places the objects were used." },
];

export const PLATE_ORDER: PlateKey[] = PLATES.map((p) => p.key);

export function getPlate(key: PlateKey): Plate {
  return PLATES.find((p) => p.key === key)!;
}

export function plateLabel(key: PlateKey): string {
  const p = getPlate(key);
  return `Pl. ${p.numeral} — ${p.name}`;
}
