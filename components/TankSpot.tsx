// A spot illustration in the ligne claire manner — one object, clean ink line,
// flat colour, no shading. Drawn in-house; the register's quiet mascot.
export default function TankSpot() {
  return (
    <div className="spot" aria-hidden="true">
      <svg viewBox="0 0 120 190" width="86" height="136" xmlns="http://www.w3.org/2000/svg">
        {/* strap above */}
        <path
          d="M44 6 h32 l-3 40 h-26 z"
          fill="#f4f2ed"
          stroke="#16306b"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M47 20 h26 M46 32 h28" stroke="#16306b" strokeWidth="1.2" />
        {/* case — the brancards */}
        <rect x="30" y="46" width="60" height="86" rx="6" fill="#ffffff" stroke="#16306b" strokeWidth="3" />
        <path d="M38 46 v86 M82 46 v86" stroke="#16306b" strokeWidth="2.5" />
        {/* dial */}
        <rect x="42" y="58" width="36" height="62" fill="#ffffff" stroke="#16306b" strokeWidth="1.6" />
        {/* rail track */}
        <rect x="47" y="64" width="26" height="50" fill="none" stroke="#16306b" strokeWidth="0.9" />
        {/* numeral ticks */}
        <path
          d="M60 60 v6 M60 112 v6 M45 89 h6 M69 89 h6 M50 63 l2 5 M70 63 l-2 5 M50 115 l2-5 M70 115 l-2-5"
          stroke="#16306b"
          strokeWidth="1.1"
        />
        {/* hands, blued — house ultramarine */}
        <path d="M60 89 l-7 -13 M60 89 l10 4" stroke="#16306b" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="60" cy="89" r="2.2" fill="#16306b" />
        {/* crown with cabochon */}
        <rect x="90" y="84" width="7" height="10" rx="2" fill="#ffffff" stroke="#16306b" strokeWidth="2" />
        <circle cx="100" cy="89" r="3.4" fill="#b2262c" stroke="#16306b" strokeWidth="1.4" />
        {/* strap below */}
        <path
          d="M41 132 h38 l3 40 h-44 z"
          fill="#f4f2ed"
          stroke="#16306b"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M43 146 h34 M44 158 h32" stroke="#16306b" strokeWidth="1.2" />
        {/* buckle stub */}
        <path d="M50 172 h20 v8 h-20 z" fill="#ffffff" stroke="#16306b" strokeWidth="2" />
      </svg>
      <div className="spot-caption">Obj. — the one on the wrist</div>
    </div>
  );
}
