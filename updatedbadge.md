# CyberSense — Updated Badge System Plan

> **Last updated:** 2026-05-28
> **Status:** 📋 PLAN — ready to implement

---

## 1. The Problem (Current State)

### What you have in the DB right now

After migration `003_modules_4_5_6.sql`, your `modules` table has **6 active modules**:

| ID | Title | Game Mode |
|----|-------|-----------|
| 1  | Harassment Simulator | chat |
| 2  | Rapid Threat Sorter | sorter |
| 3  | Social Node Defense | defense |
| 4  | Social Engineering & Impersonation | chat |
| 5  | Cyberbullying Threat Classifier | sorter |
| 6  | Campus Account Shield | defense |

### What the badge system shows right now

The `BADGES` array in `app/user/profile/page.tsx` is **hardcoded** with only 3 module badges:

```typescript
// CURRENT (hardcoded — broken for 6 modules)
const BADGES = [
  { id: 'mod1', name: 'Digital Guardian',  moduleId: 1, ... },
  { id: 'mod2', name: 'Threat Analyst',    moduleId: 2, ... },
  { id: 'mod3', name: 'Node Defender',     moduleId: 3, ... },
  { id: 'elite', name: 'CyberSense Elite', moduleId: 0, ... },
]
```

**Result:** Modules 4, 5, and 6 have NO badges. Players who complete them get no achievement recognition. The profile page always shows 4 badge cards regardless of how many modules exist.

### The second problem — leaderboard `/6` is also hardcoded

In `HomeClient.tsx`, both the leaderboard row and the user's standing show:

```tsx
<span>{entry.modulesCompleted}/6</span>   // HARDCODED — wrong if you have 3 or 9 modules
<span>{currentUserModules}/6 modules</span>
```

---

## 2. The Fix — Auto-Badge Generation

### Core idea

Instead of hardcoding the badge list, **fetch active modules from Supabase** and auto-generate a badge config for each one. When admin adds Module 7, a badge appears automatically — zero code change needed.

### Badge auto-generation rules

Each badge is derived from its module row using these mappings:

#### Icon — by `game_mode`

When multiple modules share the same `game_mode`, icons cycle through the list:

| game_mode | Index 0 | Index 1 | Index 2 | Index 3 | Index 4 |
|-----------|---------|---------|---------|---------|---------|
| `chat`    | `fa-shield-halved` | `fa-comments` | `fa-user-shield` | `fa-comment-dots` | `fa-comment-slash` |
| `sorter`  | `fa-magnifying-glass-chart` | `fa-layer-group` | `fa-filter` | `fa-list-check` | `fa-magnifying-glass` |
| `defense` | `fa-network-wired` | `fa-server` | `fa-lock` | `fa-shield-virus` | `fa-wifi` |

#### Color — by global module order (cycles every 6)

| Module order | Color | Name |
|---|---|---|
| 0 (Mod 1) | `#00f0ff` | Neon Blue |
| 1 (Mod 2) | `#c490e4` | Neon Purple |
| 2 (Mod 3) | `#00e676` | Neon Green |
| 3 (Mod 4) | `#ff9500` | Neon Orange |
| 4 (Mod 5) | `#ff4081` | Neon Pink |
| 5 (Mod 6) | `#40c4ff` | Sky Blue |
| 6 (Mod 7) | `#00f0ff` | Neon Blue (wraps) |

#### Badge name — from title + game_mode suffix

The first significant word of the module title combines with a suffix based on game_mode and index:

| game_mode | Index 0 | Index 1 | Index 2 | Index 3 | Index 4 |
|-----------|---------|---------|---------|---------|---------|
| `chat`    | Guardian | Sentinel | Agent | Operative | Protector |
| `sorter`  | Analyst | Classifier | Detective | Hunter | Investigator |
| `defense` | Defender | Architect | Commander | Shield | Operator |

#### What the 6 current badges will look like after the fix

| Module | Auto Badge Name | Icon | Color |
|--------|----------------|------|-------|
| Mod 1 — Harassment Simulator | **Harassment Guardian** | `fa-shield-halved` | `#00f0ff` |
| Mod 2 — Rapid Threat Sorter | **Rapid Analyst** | `fa-magnifying-glass-chart` | `#c490e4` |
| Mod 3 — Social Node Defense | **Social Defender** | `fa-network-wired` | `#00e676` |
| Mod 4 — Social Engineering & Impersonation | **Social Sentinel** | `fa-comments` | `#ff9500` |
| Mod 5 — Cyberbullying Threat Classifier | **Cyberbullying Classifier** | `fa-layer-group` | `#ff4081` |
| Mod 6 — Campus Account Shield | **Campus Architect** | `fa-server` | `#40c4ff` |
| Elite (all modules) | **CyberSense Elite** | `fa-crown` | `#ffd700` |

---

## 3. Files to Change

### 3a. `lib/badges.ts` — NEW shared utility (single source of truth)

Create this file so both the profile page AND the game-page popups use identical badge logic.

```typescript
// lib/badges.ts

export const NEON_COLORS = [
  '#00f0ff', // neon blue
  '#c490e4', // neon purple
  '#00e676', // neon green
  '#ff9500', // neon orange
  '#ff4081', // neon pink
  '#40c4ff', // sky blue
]

export const ICONS_BY_MODE: Record<string, string[]> = {
  chat:    ['fa-shield-halved', 'fa-comments', 'fa-user-shield', 'fa-comment-dots', 'fa-comment-slash'],
  sorter:  ['fa-magnifying-glass-chart', 'fa-layer-group', 'fa-filter', 'fa-list-check', 'fa-magnifying-glass'],
  defense: ['fa-network-wired', 'fa-server', 'fa-lock', 'fa-shield-virus', 'fa-wifi'],
}

const SUFFIXES_BY_MODE: Record<string, string[]> = {
  chat:    ['Guardian', 'Sentinel', 'Agent', 'Operative', 'Protector'],
  sorter:  ['Analyst', 'Classifier', 'Detective', 'Hunter', 'Investigator'],
  defense: ['Defender', 'Architect', 'Commander', 'Shield', 'Operator'],
}

export interface ModuleBadge {
  id: string
  name: string
  module: string
  moduleId: number
  icon: string
  color: string
  hint: string
}

export const ELITE_BADGE: ModuleBadge = {
  id: 'elite',
  name: 'CyberSense Elite',
  module: 'All Modules',
  moduleId: 0,
  icon: 'fa-crown',
  color: '#ffd700',
  hint: 'Complete all modules',
}

/**
 * Given a list of active modules from Supabase (ordered by id),
 * returns one ModuleBadge per module + the elite badge at the end.
 */
export function generateBadges(
  modules: { id: number; title: string; game_mode: string }[]
): ModuleBadge[] {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'in', 'on', '&'])
  const gameModeCounters: Record<string, number> = {}

  const moduleBadges: ModuleBadge[] = modules.map((m, globalIndex) => {
    const modeIdx = gameModeCounters[m.game_mode] ?? 0
    gameModeCounters[m.game_mode] = modeIdx + 1

    const firstWord =
      m.title.split(/\s+/).find(w => !stopWords.has(w.toLowerCase())) ?? 'Cyber'
    const suffix = SUFFIXES_BY_MODE[m.game_mode]?.[modeIdx % 5] ?? 'Expert'

    return {
      id: `mod${m.id}`,
      name: `${firstWord} ${suffix}`,
      module: m.title,
      moduleId: m.id,
      icon: ICONS_BY_MODE[m.game_mode]?.[modeIdx % 5] ?? 'fa-star',
      color: NEON_COLORS[globalIndex % NEON_COLORS.length],
      hint: `Complete Module ${m.id}`,
    }
  })

  return [...moduleBadges, ELITE_BADGE]
}

/**
 * Get the badge config for a single module by its ID.
 * Used by game pages to show the correct popup badge after passing.
 */
export function getBadgeForModule(
  moduleId: number,
  modules: { id: number; title: string; game_mode: string }[]
): ModuleBadge | undefined {
  const all = generateBadges(modules)
  return all.find(b => b.moduleId === moduleId)
}
```

---

### 3b. `app/user/profile/page.tsx` — Replace hardcoded BADGES

**Remove** the hardcoded `BADGES` array and replace with a DB fetch + `generateBadges()`.

```typescript
// BEFORE (remove these lines):
const BADGES = [
  { id: 'mod1',  name: 'Digital Guardian', ... },
  { id: 'mod2',  name: 'Threat Analyst', ... },
  { id: 'mod3',  name: 'Node Defender', ... },
  { id: 'elite', name: 'CyberSense Elite', ... },
]

// AFTER — add this query (alongside the existing profile/scores queries):
const { data: activeModules } = await supabase
  .from('modules')
  .select('id, title, game_mode')
  .eq('status', 'active')
  .order('id')

// Then generate badges dynamically:
import { generateBadges } from '@/lib/badges'

const BADGES = generateBadges(activeModules ?? [])

// The elite badge check becomes:
const moduleIds = (activeModules ?? []).map(m => m.id)

const badgeStates = BADGES.map(b => {
  if (b.id === 'elite') {
    const allPassed = moduleIds.every(mid =>
      scores?.some(s => s.module_id === mid && s.passed)
    )
    return { ...b, unlocked: allPassed, unlockedAt: null as string | null }
  }
  const firstPass = scores
    ?.filter(s => s.module_id === b.moduleId && s.passed)
    .sort((a, x) => new Date(a.completed_at).getTime() - new Date(x.completed_at).getTime())[0]
  return { ...b, unlocked: !!firstPass, unlockedAt: firstPass?.completed_at ?? null }
})
```

The badge grid render block in the JSX stays **exactly the same** — no visual changes needed.

---

### 3c. `app/user/home/page.tsx` — Pass `totalModules` to HomeClient

The page already fetches `totalModules` from Supabase:

```typescript
const { count: totalModules } = await supabase
  .from('modules')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'active')
```

Just pass it through to `HomeClient`:

```tsx
// In the return JSX:
<HomeClient
  ...existing props...
  totalModules={totalModules ?? 0}   // ADD THIS
/>
```

---

### 3d. `app/user/home/HomeClient.tsx` — Fix hardcoded `/6`

Add `totalModules` to the Props interface and replace all hardcoded `/6`:

```typescript
// Add to Props interface:
interface Props {
  ...
  totalModules: number   // ADD
}

// Replace hardcoded /6 in the leaderboard shields row:
// BEFORE:
Array.from({ length: 6 }, (_, idx) => idx < entry.modulesCompleted ? ...)

// AFTER:
Array.from({ length: totalModules }, (_, idx) => idx < entry.modulesCompleted ? ...)

// Replace hardcoded /6 label:
// BEFORE:
<span>{entry.modulesCompleted}/6</span>
<span>{currentUserModules}/6 modules</span>

// AFTER:
<span>{entry.modulesCompleted}/{totalModules}</span>
<span>{currentUserModules}/{totalModules} modules</span>
```

---

### 3e. Game pages — Dynamic popup badge (optional, but recommended)

Currently each game page has its badge hardcoded in the popup. To make it dynamic, each game page already receives `module_id` as a URL param. The fix is to:

1. Fetch the modules list (same query as profile page)
2. Call `getBadgeForModule(moduleId, modules)` from `lib/badges.ts`
3. Use the returned badge's `name`, `icon`, `color` in the popup

**Files affected:**
- `app/user/chat-simulator/page.tsx`
- `app/user/rapid-sorter/page.tsx`
- `app/user/network-defense/page.tsx`

This means Module 4 (chat) players will see the "Social Sentinel" badge popup instead of "Digital Guardian" — the correct badge for the module they just completed.

---

## 4. What Happens When Admin Adds a New Module

When admin goes to `/admin/modules` and clicks **ADD MODULE**:

1. A new row appears in the `modules` table (e.g., Module 7: "Deepfake Awareness")
2. Next time a user visits their profile page — the `generateBadges()` call fetches the updated modules list and **automatically includes a Module 7 badge**
3. The badge gets:
   - Name: `Deepfake Guardian` (if game_mode = chat, 3rd chat module → "Agent"... depends on order)
   - Icon: next icon in the cycle for that game_mode
   - Color: next color in the neon palette
4. The leaderboard `/N` count updates automatically since it reads `count` from Supabase
5. The elite badge now requires ALL modules (including 7) to be completed

**No code change required.** Admin just adds the module + seeds scenarios.

---

## 5. Visual Before / After

### Profile — ACHIEVEMENTS section

**Before (hardcoded, 6 modules exist but only 3 shown):**
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  🛡️ BLUE │  │  🔍 GREY │  │  🌐 GREY │  │  👑 GREY │
│ Digital  │  │ Threat   │  │  Node    │  │ CyberSense│
│ Guardian │  │ Analyst  │  │ Defender │  │  Elite   │
│ UNLOCKED │  │  LOCKED  │  │  LOCKED  │  │  LOCKED  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
  ← Mods 4, 5, 6 missing! →
```

**After (dynamic, all 6 modules + elite shown):**
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  🛡️ BLUE │  │  🔍 PURP │  │  🌐 GRN  │  │  💬 ORNG │
│Harassment│  │  Rapid   │  │  Social  │  │  Social  │
│ Guardian │  │ Analyst  │  │ Defender │  │ Sentinel │
│ UNLOCKED │  │ UNLOCKED │  │  LOCKED  │  │  LOCKED  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘

┌──────────┐  ┌──────────┐  ┌──────────┐
│  📋 PINK │  │  🖥️ SKY  │  │  👑 GOLD │
│Cyberbully│  │  Campus  │  │CyberSense│
│Classifier│  │ Architect│  │  Elite   │
│  LOCKED  │  │  LOCKED  │  │  LOCKED  │
└──────────┘  └──────────┘  └──────────┘
```

### Leaderboard — before / after

**Before:** `Ahmad Faris 🛡️🛡️░░░░ 2/6`
**After:**  `Ahmad Faris 🛡️🛡️░░░░ 2/6` (with totalModules=6, same display — but now correct for any count)

---

## 6. Implementation Order

| Step | File | Change | Time |
|------|------|--------|------|
| 1 | `lib/badges.ts` | Create new shared utility | ~10 min |
| 2 | `app/user/profile/page.tsx` | Replace hardcoded BADGES with dynamic fetch | ~10 min |
| 3 | `app/user/home/page.tsx` | Pass totalModules to HomeClient | ~2 min |
| 4 | `app/user/home/HomeClient.tsx` | Fix hardcoded /6 in leaderboard | ~5 min |
| 5 | Game pages (×3) | Use getBadgeForModule() for popup | ~15 min |

**Total estimate: ~40 minutes**

Steps 1–4 are the minimum needed to fix the profile badges and leaderboard. Step 5 is recommended for a fully consistent experience.

---

## 7. No Database Changes Needed

The existing `modules` table already has everything required (`id`, `title`, `game_mode`, `status`). No new columns, no migrations, no schema changes.

The badge system reads the table it already has.
