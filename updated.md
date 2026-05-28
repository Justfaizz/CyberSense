# CyberSense — Update Log

> **Last updated:** 2026-05-27

---

## Feature: Achievement Badges, Leaderboard Upgrade & Popup Redesign

> **Status:** ✅ IMPLEMENTED
> **Scope:** (1) Achievement badge system tied to module completion, (2) Redesigned badge popup on module finish, (3) Consistent badge design across popup + profile, (4) Leaderboard upgrade
> **Note:** Mobile-responsive CSS is still pending — see bottom of this file.

### Files Implemented

| File | What Was Done |
|---|---|
| `app/user/profile/page.tsx` | Added `BADGES` config, derived `badgeStates` from `user_scores`, rendered full badge grid with locked/unlocked states |
| `app/user/chat-simulator/page.tsx` | Replaced generic popup with Module 1 badge card (Digital Guardian, neon-blue) |
| `app/user/rapid-sorter/page.tsx` | Replaced generic popup with Module 2 badge card (Threat Analyst, neon-purple) |
| `app/user/network-defense/page.tsx` | Replaced generic popup with Module 3 badge card (Node Defender, neon-green) |
| `app/user/home/page.tsx` | Rewrote leaderboard query to count distinct modules completed per user |
| `app/user/home/HomeClient.tsx` | New leaderboard UI with medals (🥇🥈🥉), shield icons, X/3 display, and pinned "YOU" row |
| `app/globals.css` | Added `.achievement-popup`, `.badge-card`, `.badge-icon`, `.badge-glow`, `.popup-badge` styles |

> **Known gap:** `badge-card`, `badge-grid`, `badge-name`, `badge-module`, `badge-status` CSS classes are used in `app/user/profile/page.tsx` but their definitions in `globals.css` need to be verified — mobile responsive rules (`@media` breakpoints) for the dashboard layout are also not yet added.

---

## Design Reference (Original Planning Notes)

> These were the problems being solved. Kept for reference.

| Area | Problem | Status |
|---|---|---|
| **Achievement popup** | Generic star icon, no module identity | ✅ Fixed — module-specific badge card per game |
| **Profile page** | No badge wall, no sense of progression | ✅ Fixed — full badge grid with locked/unlocked states |
| **Pass condition** | Badge unlock tied to 100% score | ✅ Implemented as planned |
| **Leaderboard** | Counted perfect attempts only, top 5, no user rank | ✅ Fixed — counts distinct modules, medals, "YOU" row |
| **Mobile layout** | Dashboard sidebar breaks on narrow screens | ⏳ Not yet implemented |

---

## 2. Feature 1 — Badge Achievement System

### 2a. Badge Definitions (One Per Module + One Master Badge)

Each badge has a unique identity tied to the module it represents.

| ID | Badge Name | Module | Icon | Color | Unlock Condition |
|---|---|---|---|---|---|
| `mod1` | **Digital Guardian** | Harassment Simulator | `fa-shield-halved` | Neon Blue `#00f0ff` | Complete (pass) Module 1 |
| `mod2` | **Threat Analyst** | Rapid Threat Sorter | `fa-magnifying-glass-chart` | Neon Purple `#c490e4` | Complete (pass) Module 2 |
| `mod3` | **Node Defender** | Social Node Defense | `fa-network-wired` | Neon Green `#00e676` | Complete (pass) Module 3 |
| `elite` | **CyberSense Elite** | All Modules | `fa-crown` | Gold `#ffd700` | Complete all 3 modules |

> **Unlock condition = `passed: true` in `user_scores`** — which currently requires 100%. This is already the correct behaviour. No schema change needed.

---

### 2b. Shared Badge Component Design

A single reusable badge design used in **two places**: the popup and the profile page. The design uses a **hexagonal / shield card** aesthetic to match the cybersecurity theme.

```
┌─────────────────────────────────────┐
│                                     │
│         ╔═══════════╗               │
│         ║    ICON   ║  ← large FA   │
│         ╚═══════════╝     icon      │
│                                     │
│       BADGE NAME                    │
│    [ Module subtitle ]              │
│                                     │
│  ◉ UNLOCKED · May 2026              │  ← unlocked state
│  ◉ LOCKED   · Complete Mod X first  │  ← locked state (greyed)
│                                     │
└─────────────────────────────────────┘
```

**Visual states:**

| State | Border | Icon | Background | Glow |
|---|---|---|---|---|
| **Unlocked** | Solid neon color | Full color, animated spin-in | Subtle color tint | Pulsing neon glow |
| **Locked** | Dashed `#333` | Greyscale, 30% opacity | Dark/flat | None |
| **Elite (unlocked)** | Gold, double border | Gold crown, sparkle animation | Dark gold tint | Gold outer glow |

**Shared CSS class plan:**
```css
.badge-card          /* base card */
.badge-card.unlocked /* colored active state */
.badge-card.locked   /* grey disabled state */
.badge-icon          /* the FA icon wrapper */
.badge-glow          /* keyframe pulsing glow for unlocked */
```

---

### 2c. Where the Badge Appears

#### Place 1 — Module Completion Popup (in-game)

Currently: generic star + "LEVEL CLEARED!" shown for 3 seconds at 100%.

**Redesign:** Replace the generic popup with the **actual badge card** for that specific module. The popup should:

1. Show the module's badge card (icon, name, color) — same component as profile
2. Animate in with a scale + rotate entrance (keep the existing `spinBadge` keyframe but apply to the whole card, not just the icon)
3. Show "ACHIEVEMENT UNLOCKED" as the headline
4. Show the badge name (e.g., "Digital Guardian") as the sub-text
5. Auto-dismiss after ~4 seconds (increased from 3 to let user read it)
6. Each module passes its own badge config to trigger the correct popup

```
╔══════════════════════════════════════╗
║     🏆  ACHIEVEMENT UNLOCKED         ║
║                                      ║
║   ╔════════════╗                     ║
║   ║  🛡️  (blue)║  Digital Guardian   ║
║   ╚════════════╝  Harassment Sim     ║
║                                      ║
║   ✦ Badge added to your profile      ║
╚══════════════════════════════════════╝
```

#### Place 2 — Profile Page "ACHIEVEMENTS" Section

A new section between the stats cards and mission history table.

Layout: **responsive grid** — 4 cards on desktop, 2 columns on tablet, 1 column on mobile.

```
ACHIEVEMENTS
──────────────────────────────────────────────────────
  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  🛡️ BLUE │  │  🔍 GREY │  │  🌐 GREY │  │  👑 GREY │
  │ Digital  │  │ Threat   │  │  Node    │  │ CyberSense│
  │ Guardian │  │ Analyst  │  │ Defender │  │  Elite   │
  │ UNLOCKED │  │  LOCKED  │  │  LOCKED  │  │  LOCKED  │
  │ May 2026 │  │ Mod 2 req│  │ Mod 3 req│  │ All 3 req│
  └──────────┘  └──────────┘  └──────────┘  └──────────┘
```

---

### 2d. Data Logic (No DB Migration Needed)

Badge unlock state is derived entirely from existing `user_scores` data already queried on the profile page:

```typescript
// Badge config — single source of truth
export const BADGES = [
  { id: 'mod1', name: 'Digital Guardian',  module: 'Harassment Simulator', moduleId: 1, icon: 'fa-shield-halved',           color: '#00f0ff', hint: 'Complete Module 1' },
  { id: 'mod2', name: 'Threat Analyst',    module: 'Rapid Threat Sorter',  moduleId: 2, icon: 'fa-magnifying-glass-chart',  color: '#c490e4', hint: 'Complete Module 2' },
  { id: 'mod3', name: 'Node Defender',     module: 'Social Node Defense',  moduleId: 3, icon: 'fa-network-wired',           color: '#00e676', hint: 'Complete Module 3' },
  { id: 'elite', name: 'CyberSense Elite', module: 'All Modules',          moduleId: 0, icon: 'fa-crown',                  color: '#ffd700', hint: 'Complete all modules' },
]

// Derive unlock state
const badgeStates = BADGES.map(b => {
  if (b.id === 'elite') {
    const allPassed = [1,2,3].every(mid => scores?.some(s => s.module_id === mid && s.passed))
    return { ...b, unlocked: allPassed, unlockedAt: null }
  }
  const firstPass = scores
    ?.filter(s => s.module_id === b.moduleId && s.passed)
    .sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime())[0]
  return { ...b, unlocked: !!firstPass, unlockedAt: firstPass?.completed_at ?? null }
})
```

---

## 3. Feature 2 — Upgraded Leaderboard

### 3a. Ranking Model — Modules Completed

Replace "count of 100% attempts" with **number of distinct modules completed (passed)**. Simple, fair, and directly meaningful for a 3-module app.

- Score = count of **distinct** `module_id` values where `passed = true` for that user (max 3)
- Ties broken alphabetically by name (or by who completed their last module earliest — nice-to-have)
- No schema change needed — computed from existing `user_scores` in JS/SQL

```typescript
// Aggregate in JS after fetching all passed rows
const lbMap: Record<string, { full_name: string; modulesCompleted: number }> = {}
for (const row of passedRows ?? []) {
  const uid = row.user_id
  if (!lbMap[uid]) lbMap[uid] = { full_name: row.profiles.full_name, modulesCompleted: 0 }
  // count distinct module_ids
}
// then deduplicate by module_id per user before counting
```

### 3b. Leaderboard UI Changes

- **Top 10** instead of top 5
- **Medal icons** for rank 1, 2, 3 (🥇🥈🥉)
- Show **X / 3 modules** completed instead of star/point count
- **Badge icons** next to the count (one shield icon per completed module, greyed for incomplete)
- **"Your Standing"** row always pinned at bottom — shows current user's rank even if outside top 10

```
┌─────────────────────────────────────────┐
│  🏆 TOP DEFENDERS                       │
│─────────────────────────────────────────│
│  🥇  Ahmad Faris         🛡️ 🛡️ 🛡️  3/3  │
│  🥈  Nur Izzati          🛡️ 🛡️ ░  2/3  │
│  🥉  Haziq Danial        🛡️ 🛡️ ░  2/3  │
│   4  Sarah Lee           🛡️ ░  ░  1/3  │
│   5  Faiz                🛡️ ░  ░  1/3  │
│─────────────────────────────────────────│
│  ▶  YOU: #5 · 1/3 modules              │
└─────────────────────────────────────────┘
```

---

## 4. Feature 3 — Mobile Responsive UI

### 4a. Current Problems (Identified)

| Component | Issue |
|---|---|
| `dashboard-container` (sidebar + main) | Uses `flex` without `flex-wrap` — sidebar doesn't collapse on mobile |
| Module cards (Quick Learn) | 3-column flex row — stacks awkwardly on narrow screens |
| Leaderboard + Quick Learn side-by-side | Forces horizontal overflow on phones |
| Profile stats row | Fixed `minWidth: 280px` cards don't shrink below 280px |
| Achievement badge grid (new) | Needs column count to adapt: 4 → 2 → 1 |
| Game pages (chat simulator, sorter, defense) | Phone frame (350px fixed) fits mobile but the back link / score header clip |
| Mission history table | Table columns overflow horizontally on small screens |

### 4b. Fix Strategy

All fixes go in `globals.css` using `@media (max-width: 768px)` breakpoints — no component logic changes needed.

Key responsive rules to add:

```css
/* Sidebar collapses to top nav bar on mobile */
@media (max-width: 768px) {
  .dashboard-container { flex-direction: column; }
  .sidebar { width: 100%; height: auto; flex-direction: row; padding: 10px 20px; }
  .sidebar .nav-menu { flex-direction: row; overflow-x: auto; gap: 10px; }
  .sidebar .nav-section-title { display: none; }
  .sidebar-footer { display: none; }
  .sidebar-header h2 { font-size: 1rem; }

  /* Quick Learn cards stack vertically */
  .module-card { min-width: 100% !important; }

  /* Stats and profile cards go full width */
  .glass-card { min-width: unset !important; }

  /* Mission history table — horizontal scroll */
  .admin-table { font-size: 0.75rem; }
  .admin-table th, .admin-table td { padding: 8px 10px; }

  /* Badge achievement grid: 2 cols on mobile */
  .badge-grid { grid-template-columns: repeat(2, 1fr) !important; }

  /* Achievement popup full-width on mobile */
  .achievement-popup { width: 90vw; padding: 30px 20px; }
}
```

### 4c. Sidebar Mobile Nav Design

On mobile, the sidebar becomes a **sticky top bar** with icon-only nav links (no text labels) that scroll horizontally. The CYBERSENSE logo stays left-aligned. This is the most space-efficient pattern for a 5-item nav.

```
┌────────────────────────────────────────┐
│ CYBERSENSE   🏠  📖  ▶  👤           │  ← sticky top bar
└────────────────────────────────────────┘
│                                        │
│  (main content, full width)            │
│                                        │
```

---

## 5. Implementation Status

| Phase | Description | Status |
|---|---|---|
| Phase 1 | Badge component + profile page achievements section | ✅ Done |
| Phase 2 | Redesigned module-specific completion popup (all 3 games) | ✅ Done |
| Phase 3 | Leaderboard upgrade (medals, modules count, user rank) | ✅ Done |
| Phase 4 | Mobile responsive CSS (`@media` breakpoints in `globals.css`) | ⏳ Pending |

## 6. Actual Files Changed

| File | Change | Status |
|---|---|---|
| `app/globals.css` | Badge card styles + popup redesign | ✅ Done |
| `app/user/profile/page.tsx` | Badge states + Achievements section | ✅ Done |
| `app/user/chat-simulator/page.tsx` | Module-specific badge popup | ✅ Done |
| `app/user/rapid-sorter/page.tsx` | Module-specific badge popup | ✅ Done |
| `app/user/network-defense/page.tsx` | Module-specific badge popup | ✅ Done |
| `app/user/home/page.tsx` | Leaderboard query rewrite | ✅ Done |
| `app/user/home/HomeClient.tsx` | New leaderboard UI | ✅ Done |
| `app/globals.css` | Mobile `@media` breakpoints | ⏳ Pending |

> **No database migration required for any of the above features.**

---

## Feature: Profile Editing for Admin & User

**Date:** 2026-05-27

### What Was Added

Both admin and student users can now edit their own profile directly from the Profile page. The edit form lets them update their display name and optionally set a new password, without leaving the page.

### Files Added

| File | Purpose |
|---|---|
| `app/api/profile/route.ts` | New PATCH API endpoint. Authenticated users can update their own `full_name` in the `profiles` table and/or change their Supabase Auth password. |
| `app/admin/profile/ProfileClient.tsx` | Client component for the admin profile page. Renders a view/edit toggle with neon-blue styling matching the admin theme. |
| `app/user/profile/ProfileClient.tsx` | Client component for the student profile page. Same logic, styled with neon-purple to match the student theme. |

### Files Modified

| File | Change |
|---|---|
| `app/admin/profile/page.tsx` | Replaced the static profile card with `<AdminProfileClient>`, passing `fullName` and `email` as props. |
| `app/user/profile/page.tsx` | Replaced the static profile card with `<UserProfileClient>`. Stats, badges, and mission history remain unchanged. |

### How It Works

1. **View mode** — The profile card shows the current display name and email with an **EDIT PROFILE** button.
2. **Edit mode** — Clicking the button reveals inputs for Display Name, New Password, and Confirm Password.
3. **Validation** — Client-side checks ensure the name isn't blank, passwords match, and the new password is at least 6 characters before hitting the API.
4. **API call** — A `PATCH /api/profile` request updates the `profiles` table (name) and calls `supabase.auth.updateUser` (password) only if a new password was entered.
5. **Feedback** — A success or error banner appears inline. On success, the form collapses back to view mode.

### Security Notes

- The `/api/profile` route calls `supabase.auth.getUser()` server-side — unauthenticated requests are rejected with `401`.
- Users can only update their own profile; no user ID is accepted from the request body.
- Password is sent over HTTPS and processed exclusively by Supabase Auth — it is never stored in the `profiles` table.
