# CyberSense — Feature Brainstorm: Leaderboard, Achievement Badges & Mobile

> **Status:** Brainstorm / Planning — v2 (Refined)
> **Date:** 2026-05-27
> **Scope:** (1) Achievement badge system tied to module completion, (2) Redesigned badge popup on module finish, (3) Consistent badge design across popup + profile, (4) Mobile-responsive UI fix, (5) Leaderboard upgrade

---

## 1. Current State Audit

| Area | Current Behaviour | Problem |
|---|---|---|
| **Achievement popup** | Generic star icon + "LEVEL CLEARED!" text, only triggers at 100% | No module identity — every module shows identical popup; doesn't feel earned |
| **Profile page** | Stats + raw score table only | No visual badge wall; no sense of long-term progression |
| **Pass condition** | Requires 100% in all 3 modules (`passed: pct === 100`) | Badge unlock = completing (passing) a module |
| **Leaderboard** | Counts perfect-score attempts only; top 5; no user's own rank | Discourages non-perfect users; stale data |
| **Mobile layout** | `dashboard-container` likely uses fixed-width sidebars | Sidebar and card layouts break on narrow screens |

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

## 5. Implementation Plan

### Phase 1 — Shared Badge Component + Profile Page
**Files:** `app/user/profile/page.tsx`, `app/globals.css`
1. Create `BADGES` config array (single source of truth for all badge metadata)
2. Add `badge-card`, `badge-grid`, `badge-glow` CSS classes to `globals.css`
3. Add "ACHIEVEMENTS" section to profile page using the badge grid
4. Derive badge unlock states from existing `user_scores` data

### Phase 2 — Redesigned Completion Popup (All 3 Game Modules)
**Files:** `app/user/chat-simulator/page.tsx`, `app/user/rapid-sorter/page.tsx`, `app/user/network-defense/page.tsx`, `app/globals.css`
1. Update `.achievement-popup` CSS to render the badge card design
2. Pass module-specific badge config (icon, color, name) into each popup
3. Increase auto-dismiss timer to 4 seconds

### Phase 3 — Leaderboard Upgrade
**Files:** `app/user/home/page.tsx`, `app/user/home/HomeClient.tsx`
1. Rewrite leaderboard query to count **distinct modules completed per user** (deduplicate module_id per user from `user_scores` where `passed = true`)
2. Add current user's own rank computation
3. Update `HomeClient.tsx` leaderboard render with medals, `X/3 modules` display, shield icons, "Your Standing" row

### Phase 4 — Mobile Responsive CSS
**Files:** `app/globals.css`
1. Add `@media (max-width: 768px)` rules for sidebar → top nav
2. Fix module card, stats card, and badge grid stacking
3. Add horizontal scroll to the mission history table on mobile
4. Fix achievement popup sizing on mobile
5. Test all 5 pages visually

---

## 6. Files to Touch (Full Summary)

| File | What Changes |
|---|---|
| `app/globals.css` | Badge card styles, popup redesign, mobile responsive breakpoints |
| `app/user/profile/page.tsx` | Derive badge states; add Achievements section |
| `app/user/chat-simulator/page.tsx` | Pass badge config to achievement popup |
| `app/user/rapid-sorter/page.tsx` | Pass badge config to achievement popup |
| `app/user/network-defense/page.tsx` | Pass badge config to achievement popup |
| `app/user/home/page.tsx` | Rewrite leaderboard query (points model + user rank) |
| `app/user/home/HomeClient.tsx` | New leaderboard UI (medals, points, badge count, Your Standing) |

> **No database migration required for any of the above features.**
