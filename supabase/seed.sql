-- ═══════════════════════════════════════════════
-- TUSENBRUK — Seed Data
-- Run after schema.sql to populate initial content.
-- ═══════════════════════════════════════════════

-- Authors (pen names)
insert into public.authors (id, slug, name, bio, location, avatar_letter, avatar_color) values
  ('a1000000-0000-0000-0000-000000000001', 'marcus-lindqvist', 'Marcus Lindqvist', 'Horologist by habit, not by trade. Believes the best watch is the one you forget to take off. Based in Stockholm, usually running late.', 'Stockholm', 'M', '#2d5a7b'),
  ('a1000000-0000-0000-0000-000000000002', 'eleanor-braun', 'Eleanor Braun', 'Cars are architecture that moves. Drives a 1974 2002 tii in Inka Orange. Prefers patina to polish, original paint to perfection.', 'Munich', 'E', '#7b4a2d'),
  ('a1000000-0000-0000-0000-000000000003', 'hamish-mackay', 'Hamish Mackay', 'Pen collector, reluctant car restorer, mining financier. The nib shaped by one hand over thirty years is worth more than any New Old Stock.', 'Edinburgh', 'H', '#4a2d7b'),
  ('a1000000-0000-0000-0000-000000000004', 'sofia-andersen', 'Sofia Andersen', 'Photographer and sailor. Shoots Leica, sails a 1968 Hallberg-Rassy. Believes the best things in life show their age honestly.', 'Bergen', 'S', '#2d7b5a')
on conflict (slug) do nothing;

-- Posts
insert into public.posts (slug, title, excerpt, body, category, author_id, published, published_at, reading_time) values
  ('submariner-thirty-years', 'Submariner. 30 Years. Every Country I''ve Been To.', 'The bezel faded in Patagonia. The crown chipped in Morocco. That''s the whole story, right there on your wrist.', 'The bezel faded in Patagonia...', 'watches', 'a1000000-0000-0000-0000-000000000001', true, now() - interval '2 days', 4),
  ('2002-tii-munich-to-istanbul', '1974 BMW 2002 tii. Munich to Istanbul. Original Paint.', 'Family car since 1979. Not restored — preserved. The dent on the rear quarter happened in Istanbul, 1982. It stays.', 'Family car since 1979...', 'cars', 'a1000000-0000-0000-0000-000000000002', true, now() - interval '4 days', 4),
  ('thirty-years-one-nib', 'Thirty Years. One Nib. Shaped Entirely to My Hand.', 'My father''s Montblanc 149. The nib oblique from three decades of daily use. No other writer would find it comfortable.', 'My father''s Montblanc 149...', 'pens', 'a1000000-0000-0000-0000-000000000003', true, now() - interval '7 days', 4),
  ('leica-m3-honest-brass', 'Leica M3 DS, 1956. Brassed, Honest, Shooting Beautifully.', 'Brassing to every edge. Vulcanite worn warm. Rangefinder still spot-on.', 'Brassing to every edge...', 'cameras', 'a1000000-0000-0000-0000-000000000004', true, now() - interval '10 days', 4),
  ('hallberg-rassy-teak-silver', '1968 Hallberg-Rassy 35. The Teak Is Original. Silver-Grey.', 'The cockpit repair is from a knockdown off Shetland in 2004. I show everyone that repair first.', 'The cockpit repair is from a knockdown...', 'boats', 'a1000000-0000-0000-0000-000000000004', true, now() - interval '12 days', 4)
on conflict (slug) do nothing;
