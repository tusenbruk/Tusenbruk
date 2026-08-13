import Link from "next/link";
import { PlateKey, getPlate } from "@/lib/plates";

export default function PlateLabel({ plate, link = true }: { plate: PlateKey; link?: boolean }) {
  const p = getPlate(plate);
  const label = `Pl. ${p.numeral} — ${p.name}`;
  if (!link) return <span className={`plate ${p.color}`}>{label}</span>;
  return (
    <Link href={`/plates/${p.key}`} className={`plate ${p.color}`}>
      {label}
    </Link>
  );
}
