# Tusenbruk — Next.js

A private community for those who use, love, and trade the objects that carry their stories.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add Supabase credentials
Copy `.env.local.example` to `.env.local` and fill in your values:
```bash
cp .env.local.example .env.local
```

Get your values from: Supabase Dashboard → Settings → API
- `NEXT_PUBLIC_SUPABASE_URL` — your Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your anon/public key

### 3. Run locally
```bash
npm run dev
```
Visit http://localhost:3000

### 4. Deploy to Vercel
Push to GitHub — Vercel will auto-deploy.

Add the two environment variables in:
Vercel Dashboard → Your Project → Settings → Environment Variables

## Project Structure

```
tusenbruk/
├── app/
│   ├── layout.js        # Root layout, fonts, metadata
│   ├── page.js          # Main page (all components)
│   └── globals.css      # All styles
├── lib/
│   └── supabase.js      # Supabase client (ready to use)
├── .env.local.example   # Environment variable template
└── next.config.js
```

## Next Steps (Supabase Integration)

When ready to add real auth and data:

1. **Auth** — use `createClient()` from `lib/supabase.js` to sign users in
2. **Membership requests** — save form submissions to a `membership_requests` table
3. **Posts** — replace static `POSTS` array with live Supabase queries
4. **Offers** — store private offers in a `offers` table with RLS policies
5. **Vault** — add a `vault_items` table for the asset register feature

## Supabase Tables (future)

```sql
-- Membership requests
create table membership_requests (
  id uuid default gen_random_uuid() primary key,
  name text, email text, interests text,
  story text, referral text,
  created_at timestamp default now()
);

-- Posts / stories
create table posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  category text, title text, caption text,
  character_notes text, for_sale boolean,
  price text, created_at timestamp default now()
);
```
