# 🎬 CyberSense — Video Section Plan (v2)
**File:** `videoplan.md`  
**Feature:** YouTube Video Library — full feature across Admin + User pages  
**Last Updated:** 2026-05-27

---

## 1. Feature Overview

A fully dynamic video library for the CyberSense platform. Videos are managed by the Admin and surfaced to students in two places: a dedicated **Videos page** accessible from the sidebar, and a **Quick Watch** teaser section on the Home dashboard — mirroring the existing "Quick Learn" widget.

### Key Rules
- ✅ Videos play **embedded on the website** (YouTube iframe) — no redirects
- ✅ Videos must be **under 5 minutes** (enforced by admin input + duration badge on cards)
- ✅ Admin can **add, remove, and toggle** videos
- ✅ **Inline expand** when student clicks play (card expands, grid intact)
- ✅ **8 videos** across 4 categories aligned to the syllabus

---

## 2. Syllabus Alignment

| Module | Game Mode | Core Topic | Video Category |
|---|---|---|---|
| Module 1 | Chat Simulator | Cyberbullying — harassment, blackmail, doxxing, phishing DMs | 🔴 Cyberbullying Awareness |
| Module 2 | Rapid Sorter | Threat Recognition — safe vs. threatening messages | 🟣 Phishing & Social Engineering |
| Module 3 | Network Defense | Account Security — 2FA, block/report, privacy settings | 🔵 Account Security & Privacy |
| Bonus | — | General digital safety for students | 🟢 General Cyber Safety |

---

## 3. Video Plan — 8 Videos (Confirmed Embeddable)

| # | Category | Title | Channel | YouTube ID | Est. Duration | Module Link |
|---|---|---|---|---|---|---|
| V1 | 🔴 Cyberbullying | Is it Cyberbullying? | StopBullying Gov | `vtfMzmkYp9E` | ~2–3 min | Chat Simulator |
| V2 | 🔴 Cyberbullying | Cyberbullying: How to Spot it & What to Do | Youth Code Jam | `12PLYWgNtK4` | ~3–4 min | Chat Simulator |
| V3 | 🟣 Phishing | What is Phishing? Phishing attacks explained in 2 minutes | Cybernews | `HsUA3tguWZc` | 2 min ✅ | Rapid Sorter |
| V4 | 🟣 Phishing | What is Social Engineering? | Kaspersky | `uvKTMgWRPw4` | ~2–3 min | Rapid Sorter |
| V5 | 🔵 Account Security | How to Enable 2FA on Facebook, WhatsApp, Instagram & Twitter | Tech Tales | `x1CaQRSp0Ec` | ~3–4 min | Network Defense |
| V6 | 🔵 Account Security | 2 Instagram Settings You MUST Change for Privacy & Security | TechTipTaps | `9hb4OrBz66E` | ~2–3 min | Network Defense |
| V7 | 🟢 General Safety | Top 3 Online Safety Tips from a Cybersecurity Expert | WsCube Cyber Security | `8IpNWB2-BsA` | < 1 min (Short) ✅ | All Modules |
| V8 | 🟢 General Safety | What is Doxxing and How to Avoid It | NordVPN | `EuS0U_QZwyw` | ~2–4 min | Chat Simulator |

> **Embed status:** All 8 YouTube IDs verified embeddable via YouTube oEmbed API ✅  
> **Duration note:** V3 confirmed 2 min (stated in title). V7 confirmed < 1 min (YouTube Short). Remaining 6 are from reputable educational channels (government, Kaspersky, NordVPN, CBC) whose explainer videos are consistently under 5 min. Admin should confirm exact durations when seeding via the Admin panel.

---

## 4. Database Schema

A new `videos` table in Supabase stores all video data. Admin manages this table via the Admin panel.

```sql
CREATE TABLE videos (
  id            SERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  category      TEXT NOT NULL,       -- 'cyberbullying' | 'phishing' | 'account_security' | 'general_safety'
  youtube_id    TEXT NOT NULL,       -- e.g. 'dQw4w9WgXcQ' (the 11-char ID from the YouTube URL)
  duration_sec  INTEGER NOT NULL,    -- duration in seconds, must be < 300 (5 minutes)
  status        TEXT DEFAULT 'active',  -- 'active' | 'inactive'
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### Validation Rules
- `duration_sec` must be > 0 and ≤ 299 (< 5 minutes) — enforced in the Admin form
- `youtube_id` must be exactly 11 characters
- `status = 'inactive'` hides the video from students without deleting it

---

## 5. Architecture — All Files to Create or Edit

```
app/
├── admin/
│   ├── videos/
│   │   ├── page.tsx              ← NEW: Admin server component (fetch all videos)
│   │   └── VideosClient.tsx      ← NEW: Admin CRUD client component
│   ├── dashboard/page.tsx        ← EDIT: add Videos nav item to sidebar
│   ├── modules/ModulesClient.tsx ← EDIT: add Videos nav item to sidebar
│   ├── users/page.tsx            ← EDIT: add Videos nav item to sidebar
│   └── profile/page.tsx          ← EDIT: add Videos nav item to sidebar
│
├── user/
│   ├── videos/
│   │   ├── page.tsx              ← NEW: User server component (fetch active videos)
│   │   └── VideosClient.tsx      ← NEW: User video grid with inline expand
│   ├── home/
│   │   └── HomeClient.tsx        ← EDIT: add Quick Watch section + VIDEOS nav item
│   ├── learning/page.tsx         ← EDIT: add VIDEOS nav item to sidebar
│   └── profile/page.tsx          ← EDIT: add VIDEOS nav item to sidebar
```

---

## 6. Sidebar Navigation Change

A new **VIDEOS** nav item is added below LEARN in **all user pages** and separately in the **admin panel**.

### User Sidebar (all 4 user pages)
```
HOME
LEARN
VIDEOS     ← NEW (fa-solid fa-play-circle icon)
────────────
ACCOUNT
  PROFILE
```

### Admin Sidebar (all admin pages)
```
DASHBOARD
USERS
MODULES
VIDEOS     ← NEW (fa-solid fa-play-circle icon)
────────────
SYSTEM
  PROFILE
```

---

## 7. Admin Videos Page — `/admin/videos`

The admin can **add**, **toggle active/inactive**, and **delete** videos.

### Admin Card — Add/Edit Form Fields
| Field | Input Type | Validation |
|---|---|---|
| Title | Text input | Required |
| Description | Textarea | Optional, shown as subtitle on student cards |
| Category | Dropdown | cyberbullying / phishing / account_security / general_safety |
| YouTube ID | Text input | 11 chars exactly; auto-preview thumbnail |
| Duration | Number input (seconds) | 1–299 (< 5 min), displayed as MM:SS |
| Status | Toggle | Active = visible to students |

### Admin UI Behaviour
- **Live thumbnail preview** — as admin types the YouTube ID, a thumbnail from `img.youtube.com/vi/{id}/mqdefault.jpg` appears instantly so they can confirm the right video
- **Duration helper** — show "X min Y sec" label next to the seconds input
- **Delete** — with confirmation dialog (same pattern as Modules page)
- **Table layout** — list all videos with title, category badge, duration, status badge, and Edit/Delete actions

---

## 8. User Videos Page — `/user/videos`

Full-page video library fetched from Supabase (`status = 'active'` only).

### Layout
- **Page title:** `VIDEO LIBRARY` (neon-blue glow, Orbitron font)
- **Subtitle:** `"Reinforce your knowledge — all videos under 5 minutes."`
- **Filter tabs:** ALL | CYBERBULLYING | PHISHING | ACCOUNT SECURITY | GENERAL SAFETY
- **Grid:** 3 columns → 2 cols (tablet) → 1 col (mobile)

### Video Card (Static State)
```
┌─────────────────────────────────┐
│  [YouTube Thumbnail]            │
│  ▶  [PLAY overlay on hover]     │
├─────────────────────────────────┤
│  [🔴 CYBERBULLYING]  [2:45]     │
│  Video Title                    │
│  Short description text...      │
└─────────────────────────────────┘
```

### Click-to-Play — Inline Expand
When the student clicks the ▶ button:
1. Card height animates open (CSS transition)
2. Thumbnail replaced by `<iframe src="https://www.youtube-nocookie.com/embed/{id}?autoplay=1">`
3. A close button [✕] appears at top-right of expanded card to collapse back to thumbnail

This keeps the grid intact — other cards don't move because the expanded card grows vertically into its own column slot.

### Category Color Coding (matching CSS vars)
| Category | Color | CSS Var |
|---|---|---|
| Cyberbullying | Red | `--neon-red` |
| Phishing | Purple | `--neon-purple` |
| Account Security | Blue | `--neon-blue` |
| General Safety | Green | `--neon-green` |

---

## 9. Home Page — Quick Watch Section

A new **QUICK WATCH** section is added to `HomeClient.tsx`, placed directly beneath the existing **QUICK LEARN** section. It mirrors the same row-of-cards layout.

### Layout (mirrors Quick Learn)
```
QUICK WATCH                                    [VIEW ALL →]
┌────────────┐  ┌────────────┐  ┌────────────┐
│ Thumbnail  │  │ Thumbnail  │  │ Thumbnail  │
│ ▶          │  │ ▶          │  │ ▶          │
│ Title...   │  │ Title...   │  │ Title...   │
│ [2:45]     │  │ [3:10]     │  │ [4:02]     │
└────────────┘  └────────────┘  └────────────┘
```

- Shows the **latest 3 active videos** (ordered by `created_at DESC`)
- Each card has the YouTube thumbnail + title + duration + ▶ play button
- **VIEW ALL →** link navigates to `/user/videos`
- Clicking a card plays inline (same expand behaviour as the full videos page)
- Home page server component (`page.tsx`) fetches latest 3 videos from Supabase

---

## 10. Technical — YouTube Embed Details

### Embed URL
```
https://www.youtube-nocookie.com/embed/{YOUTUBE_ID}?autoplay=1&rel=0&modestbranding=1
```
- `autoplay=1` — starts playing immediately after user clicks
- `rel=0` — don't show unrelated videos at the end
- `modestbranding=1` — minimal YouTube branding
- `youtube-nocookie.com` — privacy-enhanced, no tracking cookies until play

### Thumbnail URL
```
https://img.youtube.com/vi/{YOUTUBE_ID}/mqdefault.jpg   ← 320×180, always available
https://img.youtube.com/vi/{YOUTUBE_ID}/maxresdefault.jpg ← 1280×720, may 404 for some videos
```
Use `mqdefault.jpg` as safe fallback.

### iframe Attributes
```tsx
<iframe
  src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
  style={{ width: '100%', aspectRatio: '16/9', border: 'none', borderRadius: '10px' }}
/>
```

---

## 11. Implementation Order (Step-by-Step)

| Step | Task | File(s) |
|---|---|---|
| 1 | Run SQL migration to create `videos` table in Supabase | Supabase SQL editor |
| 2 | Build Admin Videos page (CRUD) | `app/admin/videos/page.tsx` + `VideosClient.tsx` |
| 3 | Add VIDEOS nav item to all Admin sidebars | 4 admin files |
| 4 | Build User Videos page (grid + inline expand + filter tabs) | `app/user/videos/page.tsx` + `VideosClient.tsx` |
| 5 | Add VIDEOS nav item to all User sidebars | 3 user files |
| 6 | Add Quick Watch section to Home page | `HomeClient.tsx` + `home/page.tsx` |
| 7 | Seed 8 initial videos via Admin panel | Manual |
| 8 | Test & verify all embeds load in-page | — |

---

## 12. Open Questions — All Resolved

| Question | Decision |
|---|---|
| Play mode | ✅ Inline expand (card grows vertically) |
| Video count | ✅ 8 videos (4 categories × 2) |
| Admin control | ✅ Full add/remove/toggle via Admin panel |
| Max duration | ✅ Under 5 minutes (< 300 seconds), enforced in form |
| New nav item | ✅ VIDEOS button below LEARN in user sidebar |
| Home page teaser | ✅ Quick Watch section (latest 3 videos), mirrors Quick Learn layout |

---

*Plan v2 complete. Ready to implement on approval.*
