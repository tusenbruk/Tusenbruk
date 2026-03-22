# Tusenbruk — A Thousand Uses

An editorial blog for stories about the things we use, love, and live with. Watches. Cars. Pens. Cameras. Boats.

Built with Next.js 14 + Supabase. Works in demo mode (no database needed) or with a live Supabase backend.

---

## Quick Start (Demo Mode — No Supabase Needed)

```bash
cd Tusenbruk
npm install
npm run dev
```

Open http://localhost:3000. You'll see five sample stories using the built-in demo data. The admin page at `/admin` lets you browse posts and pen names (writes won't persist without Supabase).

---

## Deploy to Production

### Step 1: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project (or use your existing one).
2. Once the project is ready, go to **SQL Editor** in the left sidebar.
3. Paste the contents of `supabase/schema.sql` and click **Run**. This creates the `authors` and `posts` tables.
4. Paste the contents of `supabase/seed.sql` and click **Run**. This loads the five sample stories.
5. Go to **Settings → API** and copy:
   - **Project URL** (looks like `https://abc123.supabase.co`)
   - **anon public** key (the long string under "Project API keys")

### Step 2: Push to GitHub

```bash
cd Tusenbruk
git add -A
git commit -m "Fresh build: Tusenbruk editorial blog"
git remote set-url origin https://github.com/YOUR_USERNAME/tusenbruk.git
git push -u origin main
```

If this is a new repo, create it first at github.com/new (name it `tusenbruk`, private, no template).

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and click **Add New → Project**.
2. Import your `tusenbruk` GitHub repo.
3. Vercel auto-detects Next.js. Leave the defaults.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
5. Click **Deploy**.

Your site will be live at `tusenbruk.vercel.app` (or whatever name Vercel assigns). Every push to `main` triggers a new deploy automatically.

### Step 4: Set Up Supabase RLS (Already Done)

The schema.sql already includes Row Level Security policies:
- **Anyone** can read published posts and author profiles.
- **Authenticated users** can create/edit posts and authors (for future auth layer).

For now, the admin page writes via the anon key, which works because we haven't locked it down further. When you want to add login, we can add Supabase Auth in a later pass.

---

## Project Structure

```
Tusenbruk/
├── app/
│   ├── layout.js          # Site-wide layout (nav, footer)
│   ├── page.js            # Homepage (post list, category filter)
│   ├── globals.css         # All CSS (Monocle-inspired editorial)
│   ├── post/[slug]/page.js # Individual post (Markdown rendered)
│   ├── author/[slug]/page.js # Author profile + their posts
│   ├── admin/page.js       # Write posts, create pen names
│   ├── api/posts/route.js  # POST/GET posts
│   └── api/authors/route.js # POST/GET authors
├── lib/
│   ├── supabase.js        # Supabase client (null if unconfigured)
│   ├── posts.js           # Data access layer (Supabase or demo)
│   └── demo-data.js       # Five sample posts + four pen names
├── supabase/
│   ├── schema.sql         # Table definitions + RLS policies
│   └── seed.sql           # Sample data for Supabase
├── package.json
├── next.config.js
├── jsconfig.json
└── .env.local.example
```

---

## How It Works

**Demo mode:** When `NEXT_PUBLIC_SUPABASE_URL` is not set, the site reads from `lib/demo-data.js`. Posts render, category filters work, author pages work. The admin form appears but writes don't persist across reloads.

**Live mode:** When Supabase credentials are set, all reads and writes go to the database. Posts you write in `/admin` persist and appear on the homepage immediately.

**Pen names:** Each post is written under an "author" — a pen name with a name, bio, location, and avatar. You can create as many as you like from the admin page.

**Markdown:** Post bodies support full Markdown — headings, bold, italic, blockquotes, horizontal rules. Rendered with `marked`.

---

## Next Steps

Once the blog is running, potential additions:
- **Supabase Auth** — protect `/admin` with email/password login
- **Image uploads** — store photos in Supabase Storage, embed in posts
- **Custom domain** — point tusenbruk.com at Vercel
- **RSS feed** — /api/feed route for syndication
- **Comments** — reader discussion on posts
