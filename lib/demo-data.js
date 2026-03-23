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
  { slug: 'watches', name: 'Watches', icon: '\u{231A}' },
  { slug: 'cars', name: 'Cars', icon: '\u{1F697}' },
  { slug: 'pens', name: 'Pens', icon: '\u{2712}\u{FE0F}' },
  { slug: 'cameras', name: 'Cameras', icon: '\u{1F4F7}' },
]

export const POSTS = [
  {
    id: '1',
    slug: 'submariner-thirty-years',
    title: 'Submariner. 30 Years. Every Country I\'ve Been To.',
    excerpt: 'The bezel faded in Patagonia. The crown chipped in Morocco. That\'s the whole story, right there on your wrist.',
    cover_image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1400&q=80&fit=crop',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1526045431048-f857369baa09?w=1200&q=80&fit=crop',
        caption: 'The bezel insert, faded from black to tropical grey-green. Thirty years of salt air and sun.',
        position: 'wide',
      },
      {
        url: 'https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=1000&q=80&fit=crop',
        caption: 'Crown detail. The chip from Fez has oxidized to match the rest. You have to know where to look.',
        position: 'inline',
      },
      {
        url: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=1200&q=80&fit=crop',
        caption: 'Original bracelet, stretched and honest. Every link tells the story of somewhere.',
        position: 'wide',
      },
    ],
    body: `The bezel faded in Patagonia. The crown chipped in Morocco. That's the whole story, right there on your wrist.

I bought this Submariner \u2014 a ref. 1680, "Red Sub" \u2014 in 1994 from a retired Navy diver in Gothenburg. He'd worn it for twenty years before me. The tritium had already turned cream. The bezel insert was fading from black to a ghostly grey-green that Rolex collectors now call "tropical." I didn't know any of that language then. I just knew it felt right.

## The First Decade

The first ten years were the roughest on the watch. I was consulting in mining, moving between sites in South America, West Africa, and the Australian outback. The Submariner came everywhere. It collected scratches the way a passport collects stamps \u2014 each one from a specific moment, a specific place.

The deepest scratch on the case, running from 2 o'clock to 4 o'clock, happened on a mine site in Guinea in 1997. I caught it on a steel beam climbing out of a pit. I remember the sound. I remember the heat. I remember looking at the scratch later that night and thinking: *well, that's the watch now.*

## Morocco, 2009

The crown chip happened in Fez. I was reaching through a narrow doorway in the medina and caught the crown on the stone frame. A tiny crescent of steel, gone. I felt it happen. I looked at the crown under a streetlight that evening and saw the chip \u2014 bright metal against the brushed surface.

Fifteen years later, the chip has oxidized to match the rest. You have to know where to look. But I know.

## What a Watch Becomes

This is not a collector's piece. The value, if we must talk about value, is in what the watch *has become* rather than what it *once was*. Every tropical bezel and honest scratch tells a story that cannot be manufactured, replicated, or restored.

The watch is worth what someone would pay for it. But to me, it is worth every country I've been to.

**Character notes:** Rolex ref. 1680 \u00B7 tropical ghost bezel \u00B7 crown chip, Morocco 2009 \u00B7 cream lume \u00B7 original bracelet, stretched and honest.`,
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
    excerpt: 'Family car since 1979. Not restored \u2014 preserved. The dent on the rear quarter happened in Istanbul, 1982. It stays.',
    cover_image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&q=80&fit=crop',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&q=80&fit=crop',
        caption: 'Inka Orange. The colour BMW mixed for exactly three years, 1971 to 1974.',
        position: 'wide',
      },
      {
        url: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=1000&q=80&fit=crop',
        caption: 'Original paint, thinned on the roof and bonnet. It no longer shouts; it glows.',
        position: 'inline',
      },
    ],
    body: `Family car since 1979. Not restored \u2014 preserved. The dent on the rear quarter happened in Istanbul, 1982. It stays.

My father bought this car new in Munich. Inka Orange \u2014 the colour BMW mixed for exactly three years, 1971 to 1974. It was the family car for the drive from Munich to Istanbul in the summer of 1982, and it has been in the family ever since.

## The Dent

The dent on the rear left quarter panel happened in Istanbul. My father was parking near the Spice Bazaar and a delivery truck backed into the car. A small argument in three languages. No insurance paperwork. Just a dent.

That dent has been there for forty-four years. Every mechanic, every body shop, every well-meaning friend has offered to pull it out. The answer has always been the same: *it stays.*

The dent is Istanbul. The dent is 1982. The dent is my father arguing with a truck driver while my mother held my hand and tried not to laugh. Removing the dent would be removing the story.

## Original Paint

The paint has thinned on the roof and bonnet. There are stone chips on the front valance from four decades of autobahn driving. The orange has softened \u2014 it no longer shouts; it glows.

I have been offered extraordinary sums for this car. The 2002 tii market has gone where markets go. But the people offering money want to restore it. They want to strip it, repaint it, make it "correct." They want to remove every mark that makes this car *this car*.

No.

## What Original Means

Original doesn't mean perfect. Original means: *this is what happened.* Every scratch, every fade, every dent is a chapter. The car is a forty-four-year autobiography written in Inka Orange.

**Character notes:** Inka Orange \u00B7 matching numbers \u00B7 original Sahara Beige interior \u00B7 127,000 km \u00B7 no respray \u00B7 Istanbul dent, 1982.`,
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
    cover_image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=1400&q=80&fit=crop',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80&fit=crop',
        caption: 'The 149. Cap posted, ready to write. Brass showing on the clip from thirty years of pocket carry.',
        position: 'wide',
      },
      {
        url: 'https://images.unsplash.com/photo-1517697471339-4aa32003c11a?w=1000&q=80&fit=crop',
        caption: 'Two hands, thirty years apart, written into the same nib.',
        position: 'inline',
      },
    ],
    body: `My father's Montblanc 149. The nib oblique from three decades of daily use. No other writer would find it comfortable. That is the point.

## Inheritance

The pen arrived in a shoebox with other effects after my father died in 2022. No case. No papers. Just the pen, cap posted, ink dried in the converter. It smelled of his study \u2014 tobacco and old books and something I have never been able to name.

I cleaned it. Flushed the converter with cool water until it ran clear. Filled it with Pilot Iroshizuku Shin-kai, a deep blue-black that felt appropriate.

And then I tried to write.

## The Nib

The nib fought me. The tines had been worn, over thirty years of daily use, into an oblique that matched my father's hand exactly. His grip, his angle, his pressure. The pen had become an extension of his hand \u2014 and his hand was not my hand.

For the first six months, every letter felt wrong. Too much feedback on the upstroke. Not enough ink on the cross-stroke. The nib was arguing with me.

I kept writing.

## Adaptation

Slowly \u2014 so slowly I could not identify when it happened \u2014 the nib began to change. Not dramatically. A few microns of iridium, worn differently by a different hand at a different angle. My father's oblique softening toward my own.

The pen now writes beautifully for me. But it still carries his oblique underneath mine, like a palimpsest. Two hands, thirty years apart, written into the same nib.

No pen shop could create this. No custom grind could replicate it. This is time, pressure, and ink on iridium. This is what a thousand uses looks like.

**Character notes:** Montblanc 149 \u00B7 sprung oblique medium nib \u00B7 brass showing on clip \u00B7 cap micro-scratched \u00B7 1994.`,
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
    excerpt: 'Brassing to every edge. Vulcanite worn warm. Rangefinder still spot-on. A camera with a good life \u2014 looking for its next chapter.',
    cover_image: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=1400&q=80&fit=crop',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1495745966610-2a67f2297e5e?w=1200&q=80&fit=crop',
        caption: 'Natural brassing at every edge. Chrome worn through to the brass body beneath. Proof, not damage.',
        position: 'wide',
      },
      {
        url: 'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=1000&q=80&fit=crop',
        caption: 'The double-stroke advance lever. Two strokes per frame. It slows you down. It makes you present.',
        position: 'inline',
      },
      {
        url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80&fit=crop',
        caption: 'Sixty-eight years old. The rangefinder patch is still bright, still accurate.',
        position: 'wide',
      },
    ],
    body: `Brassing to every edge. Vulcanite worn warm. Rangefinder still spot-on. A camera with a good life \u2014 looking for its next chapter.

## What Brassing Means

Brassing is what happens when the chrome plating on a Leica wears through to the brass body beneath. It happens at the edges first \u2014 the corners of the top plate, the film advance lever, the base plate where it slides in and out of bags.

To some, brassing is damage. To me, brassing is proof.

Proof that the camera was used. Proof that it left the shelf, left the display case, left the collector's vault. Proof that someone loaded film into it ten thousand times, advanced the lever a hundred thousand times, pressed the shutter while looking at something they wanted to remember.

## This M3

This M3 was made in 1956 \u2014 a double-stroke model, meaning the film advance lever requires two strokes per frame. Leica fixed this "inefficiency" in later models. But the double stroke has a rhythm that single-stroke cameras lack. Load, advance, advance, compose, shoot. It slows you down. It makes you present.

The previous owner was a press photographer in Hamburg. He shot this camera professionally from 1956 to 1978. Twenty-two years. That is where the brassing comes from \u2014 not from carelessness, but from work.

## The Rangefinder

The extraordinary thing about this camera is the rangefinder. Sixty-eight years old, and the patch is still bright, still accurate. I had it checked by a technician in Bergen last year. He said it was within tolerance. He also said he'd never seen an M3 this well-used that was still this accurate.

Good engineering survives good use. That is the Leica promise, and this camera keeps it.

**Character notes:** Leica M3 double stroke \u00B7 1956 \u00B7 natural brassing \u00B7 original vulcanite \u00B7 RF bright and accurate \u00B7 Hamburg press camera, 1956\u20131978.`,
    category: 'cameras',
    author_id: '4',
    published: true,
    published_at: '2026-03-12T14:00:00Z',
    reading_time: 4,
  },
]

export const SHOP_ITEMS = [
  {
    id: '1',
    name: 'Rolex Submariner Date 126610LN',
    note: 'The current production Sub. 41mm, ceramic bezel, 70-hour power reserve. Still the benchmark. Buy it, wear it every day, and never look back.',
    category: 'watches',
    price: 'AUD 15,350',
    url: 'https://www.rolex.com/watches/submariner',
    active: true,
    sort_order: 1,
  },
  {
    id: '2',
    name: 'Cartier Tank Must',
    note: 'The watch that looks good on every wrist in every room. Steel case, blue hands, leather strap. Dress it up or down. A century of good design.',
    category: 'watches',
    price: 'AUD 5,200',
    url: 'https://www.cartier.com/watches/tank',
    active: true,
    sort_order: 2,
  },
  {
    id: '3',
    name: 'Montblanc Meisterst\u00FCck 149',
    note: 'The 149 is the benchmark fountain pen. Heavy, balanced, and the nib breaks in to your hand over years. Buy it once.',
    category: 'pens',
    price: 'AUD 1,290',
    url: 'https://www.montblanc.com/meisterstuck-149',
    active: true,
    sort_order: 3,
  },
  {
    id: '4',
    name: 'Pilot Custom 823 (Amber)',
    note: 'Vacuum fill, 14k nib, enormous ink capacity. The serious writer\'s pen. Half the price of the 149 and arguably a better writer out of the box.',
    category: 'pens',
    price: 'AUD 490',
    url: 'https://www.pilotpen.com.au',
    active: true,
    sort_order: 4,
  },
  {
    id: '5',
    name: 'Leica Q3 43',
    note: 'Fixed 43mm lens. Full-frame sensor. The camera you grab when you walk out the door. No lens to choose, no excuses. Just shoot.',
    category: 'cameras',
    price: 'AUD 9,600',
    url: 'https://leica-camera.com/q3-43',
    active: true,
    sort_order: 5,
  },
  {
    id: '6',
    name: 'Leica M11',
    note: 'The rangefinder. Manual focus, deliberate photography. Not for everyone \u2014 for the people who want to slow down and see.',
    category: 'cameras',
    price: 'AUD 13,500',
    url: 'https://leica-camera.com/m11',
    active: true,
    sort_order: 6,
  },
]
