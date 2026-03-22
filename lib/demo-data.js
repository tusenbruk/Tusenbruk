// Demo data — used when Supabase is not connected.
// Once Supabase is live, this file is ignored.

export const AUTHORS = [
  {
    id: '1',
    slug: 'marcus-lindqvist',
    name: 'Marcus Lindqvist',
    bio: 'Horologist by habit, not by trade. Believes the best watch is the one you forget to take off. Based in Stockholm, usually running late.',
    location: 'Stockholm',
    avatar_letter: 'M',
    avatar_color: '#2d5a7b',
  },
  {
    id: '2',
    slug: 'eleanor-braun',
    name: 'Eleanor Braun',
    bio: 'Cars are architecture that moves. Drives a 1974 2002 tii in Inka Orange. Prefers patina to polish, original paint to perfection.',
    location: 'Munich',
    avatar_letter: 'E',
    avatar_color: '#7b4a2d',
  },
  {
    id: '3',
    slug: 'hamish-mackay',
    name: 'Hamish Mackay',
    bio: 'Pen collector, reluctant car restorer, mining financier. The nib shaped by one hand over thirty years is worth more than any New Old Stock.',
    location: 'Edinburgh',
    avatar_letter: 'H',
    avatar_color: '#4a2d7b',
  },
  {
    id: '4',
    slug: 'sofia-andersen',
    name: 'Sofia Andersen',
    bio: 'Photographer and sailor. Shoots Leica, sails a 1968 Hallberg-Rassy. Believes the best things in life show their age honestly.',
    location: 'Bergen',
    avatar_letter: 'S',
    avatar_color: '#2d7b5a',
  },
]

export const CATEGORIES = [
  { slug: 'watches', name: 'Watches', icon: '⌚' },
  { slug: 'cars', name: 'Cars', icon: '🚗' },
  { slug: 'pens', name: 'Pens', icon: '✒️' },
  { slug: 'cameras', name: 'Cameras', icon: '📷' },
  { slug: 'boats', name: 'Boats', icon: '⛵' },
]

export const POSTS = [
  {
    id: '1',
    slug: 'submariner-thirty-years',
    title: 'Submariner. 30 Years. Every Country I\'ve Been To.',
    excerpt: 'The bezel faded in Patagonia. The crown chipped in Morocco. That\'s the whole story, right there on your wrist.',
    body: `The bezel faded in Patagonia. The crown chipped in Morocco. That's the whole story, right there on your wrist.

I bought this Submariner — a ref. 1680, "Red Sub" — in 1994 from a retired Navy diver in Gothenburg. He'd worn it for twenty years before me. The tritium had already turned cream. The bezel insert was fading from black to a ghostly grey-green that Rolex collectors now call "tropical." I didn't know any of that language then. I just knew it felt right.

## The First Decade

The first ten years were the roughest on the watch. I was consulting in mining, moving between sites in South America, West Africa, and the Australian outback. The Submariner came everywhere. It collected scratches the way a passport collects stamps — each one from a specific moment, a specific place.

The deepest scratch on the case, running from 2 o'clock to 4 o'clock, happened on a mine site in Guinea in 1997. I caught it on a steel beam climbing out of a pit. I remember the sound. I remember the heat. I remember looking at the scratch later that night and thinking: *well, that's the watch now.*

## Morocco, 2009

The crown chip happened in Fez. I was reaching through a narrow doorway in the medina and caught the crown on the stone frame. A tiny crescent of steel, gone. I felt it happen. I looked at the crown under a streetlight that evening and saw the chip — bright metal against the brushed surface.

Fifteen years later, the chip has oxidized to match the rest. You have to know where to look. But I know.

## What a Watch Becomes

This is not a collector's piece. The value, if we must talk about value, is in what the watch *has become* rather than what it *once was*. Every tropical bezel and honest scratch tells a story that cannot be manufactured, replicated, or restored.

The watch is worth what someone would pay for it. But to me, it is worth every country I've been to.

**Character notes:** Rolex ref. 1680 · tropical ghost bezel · crown chip, Morocco 2009 · cream lume · original bracelet, stretched and honest.`,
    category: 'watches',
    author_id: '1',
    published: true,
    published_at: '2026-03-20T08:00:00Z',
    reading_time: 4,
  },
  {
    id: '2',
    slug: '2002-tii-munich-to-istanbul',
    title: '1974 BMW 2002 tii. Munich to Istanbul. Original Paint.',
    excerpt: 'Family car since 1979. Not restored — preserved. The dent on the rear quarter happened in Istanbul, 1982. It stays.',
    body: `Family car since 1979. Not restored — preserved. The dent on the rear quarter happened in Istanbul, 1982. It stays.

My father bought this car new in Munich. Inka Orange — the colour BMW mixed for exactly three years, 1971 to 1974. It was the family car for the drive from Munich to Istanbul in the summer of 1982, and it has been in the family ever since.

## The Dent

The dent on the rear left quarter panel happened in Istanbul. My father was parking near the Spice Bazaar and a delivery truck backed into the car. A small argument in three languages. No insurance paperwork. Just a dent.

That dent has been there for forty-four years. Every mechanic, every body shop, every well-meaning friend has offered to pull it out. The answer has always been the same: *it stays.*

The dent is Istanbul. The dent is 1982. The dent is my father arguing with a truck driver while my mother held my hand and tried not to laugh. Removing the dent would be removing the story.

## Original Paint

The paint has thinned on the roof and bonnet. There are stone chips on the front valance from four decades of autobahn driving. The orange has softened — it no longer shouts; it glows.

I have been offered extraordinary sums for this car. The 2002 tii market has gone where markets go. But the people offering money want to restore it. They want to strip it, repaint it, make it "correct." They want to remove every mark that makes this car *this car*.

No.

## What Original Means

Original doesn't mean perfect. Original means: *this is what happened.* Every scratch, every fade, every dent is a chapter. The car is a forty-four-year autobiography written in Inka Orange.

**Character notes:** Inka Orange · matching numbers · original Sahara Beige interior · 127,000 km · no respray · Istanbul dent, 1982.`,
    category: 'cars',
    author_id: '2',
    published: true,
    published_at: '2026-03-18T10:00:00Z',
    reading_time: 4,
  },
  {
    id: '3',
    slug: 'thirty-years-one-nib',
    title: 'Thirty Years. One Nib. Shaped Entirely to My Hand.',
    excerpt: 'My father\'s Montblanc 149. The nib oblique from three decades of daily use. No other writer would find it comfortable.',
    body: `My father's Montblanc 149. The nib oblique from three decades of daily use. No other writer would find it comfortable. That is the point.

## Inheritance

The pen arrived in a shoebox with other effects after my father died in 2022. No case. No papers. Just the pen, cap posted, ink dried in the converter. It smelled of his study — tobacco and old books and something I have never been able to name.

I cleaned it. Flushed the converter with cool water until it ran clear. Filled it with Pilot Iroshizuku Shin-kai, a deep blue-black that felt appropriate.

And then I tried to write.

## The Nib

The nib fought me. The tines had been worn, over thirty years of daily use, into an oblique that matched my father's hand exactly. His grip, his angle, his pressure. The pen had become an extension of his hand — and his hand was not my hand.

For the first six months, every letter felt wrong. Too much feedback on the upstroke. Not enough ink on the cross-stroke. The nib was arguing with me.

I kept writing.

## Adaptation

Slowly — so slowly I could not identify when it happened — the nib began to change. Not dramatically. A few microns of iridium, worn differently by a different hand at a different angle. My father's oblique softening toward my own.

The pen now writes beautifully for me. But it still carries his oblique underneath mine, like a palimpsest. Two hands, thirty years apart, written into the same nib.

No pen shop could create this. No custom grind could replicate it. This is time, pressure, and ink on iridium. This is what a thousand uses looks like.

**Character notes:** Montblanc 149 · sprung oblique medium nib · brass showing on clip · cap micro-scratched · 1994.`,
    category: 'pens',
    author_id: '3',
    published: true,
    published_at: '2026-03-15T12:00:00Z',
    reading_time: 4,
  },
  {
    id: '4',
    slug: 'leica-m3-honest-brass',
    title: 'Leica M3 DS, 1956. Brassed, Honest, Shooting Beautifully.',
    excerpt: 'Brassing to every edge. Vulcanite worn warm. Rangefinder still spot-on. A camera with a good life — looking for its next chapter.',
    body: `Brassing to every edge. Vulcanite worn warm. Rangefinder still spot-on. A camera with a good life — looking for its next chapter.

## What Brassing Means

Brassing is what happens when the chrome plating on a Leica wears through to the brass body beneath. It happens at the edges first — the corners of the top plate, the film advance lever, the base plate where it slides in and out of bags.

To some, brassing is damage. To me, brassing is proof.

Proof that the camera was used. Proof that it left the shelf, left the display case, left the collector's vault. Proof that someone loaded film into it ten thousand times, advanced the lever a hundred thousand times, pressed the shutter while looking at something they wanted to remember.

## This M3

This M3 was made in 1956 — a double-stroke model, meaning the film advance lever requires two strokes per frame. Leica fixed this "inefficiency" in later models. But the double stroke has a rhythm that single-stroke cameras lack. Load, advance, advance, compose, shoot. It slows you down. It makes you present.

The previous owner was a press photographer in Hamburg. He shot this camera professionally from 1956 to 1978. Twenty-two years. That is where the brassing comes from — not from carelessness, but from work.

## The Rangefinder

The extraordinary thing about this camera is the rangefinder. Sixty-eight years old, and the patch is still bright, still accurate. I had it checked by a technician in Bergen last year. He said it was within tolerance. He also said he'd never seen an M3 this well-used that was still this accurate.

Good engineering survives good use. That is the Leica promise, and this camera keeps it.

**Character notes:** Leica M3 double stroke · 1956 · natural brassing · original vulcanite · RF bright and accurate · Hamburg press camera, 1956–1978.`,
    category: 'cameras',
    author_id: '4',
    published: true,
    published_at: '2026-03-12T14:00:00Z',
    reading_time: 4,
  },
  {
    id: '5',
    slug: 'hallberg-rassy-teak-silver',
    title: '1968 Hallberg-Rassy 35. The Teak Is Original. Silver-Grey.',
    excerpt: 'The cockpit repair is from a knockdown off Shetland in 2004. I show everyone that repair first. It is the best part of the boat.',
    body: `The cockpit repair is from a knockdown off Shetland in 2004. I show everyone that repair first. It is the best part of the boat.

## Teak

The teak deck on this boat is original. Fifty-eight years old. It has gone from the warm honey colour of new teak to the silver-grey that only comes from decades of salt, sun, and weather.

People ask me if I'm going to re-teak the deck. They say it would "bring the boat back to life." But the boat is alive. The silver teak is not death — it is maturity. It is the colour of a boat that has been somewhere and come back.

## The Knockdown

In August 2004, I was sailing single-handed from Bergen to Lerwick when a storm system moved in faster than forecast. Sixty knots. The boat was knocked down — beam-ends, mast in the water, cockpit submerged.

The cockpit coaming cracked. The starboard winch was torn from its mount. I was clipped on, which is why I am writing this and not at the bottom of the North Sea.

I limped into Lerwick and spent three weeks repairing the cockpit. The new teak doesn't match the old. The epoxy line is visible. The repair is not pretty.

It is the best part of the boat.

## Showing the Repair

When someone comes aboard for the first time, I show them the cockpit repair before anything else. I tell them about the knockdown, the sixty knots, the three weeks in Lerwick. I point to the epoxy line and the mismatched teak.

This is what I want them to understand: *this boat survived.* It did not survive by being perfect. It survived by being strong, and then by being repaired, honestly, with the marks showing.

That is what Tusenbruk means to me. A thousand uses. A thing that earns its story.

**Character notes:** Original teak deck · silver-patinated · cockpit repair 2004 (structural) · verdigris bronze fittings · Bergen home port.`,
    category: 'boats',
    author_id: '4',
    published: true,
    published_at: '2026-03-10T09:00:00Z',
    reading_time: 4,
  },
]
