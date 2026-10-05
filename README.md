# Manazil website

Landing page for the Manazil app at manazilapp.com. Next.js 14, Tailwind CSS and Framer Motion.

```
npm install
npm run dev
```

The privacy policy text lives in `content/privacy.md` and must match the one inside the app.

## Admin (`/admin`)

Edit content without releasing a new version of the app or redeploying the site:

| Section | What it changes |
| --- | --- |
| Occasion messages | Eid and special-day reminders (`occasions` table, read by the app) |
| Daily content | Pin a verse, hadith or dua for a date (`daily_content`, read by the app) |
| Site content | Announcement banner, App Store / Google Play links, FAQ |
| Verse Finder | Activity log written by the `transcribe` edge function (`finder_logs`) |

### Setup, once

1. Run `supabase/admin.sql` in the Supabase SQL editor.
2. Supabase → Authentication → Users → add your user, then run
   `insert into public.admins (user_id) values ('<that user's UID>');`
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel (see `.env.example`) and redeploy.
4. Redeploy the edge function so Verse Finder activity is logged:
   `supabase functions deploy transcribe --project-ref kffjoxlcxkrqtdmnjujz`

Every table is protected by row-level security: the public can only read what the site and app need, and only users listed in `admins` can write.
