# Admin Module Plan — Modules 4, 5 & 6

## What I Found in Your Codebase

### Current State
Your project has **3 existing modules** in the database:

| # | Title | Game Mode | Questions |
|---|-------|-----------|-----------|
| 1 | Harassment Simulator | Chat Simulator | 5 |
| 2 | Rapid Threat Sorter | Rapid Sorter | 5 |
| 3 | Social Node Defense | Network Defense | 3 |

### How the System Works (Important Context)
There are **two layers** that must both be updated when adding a new module:

1. **`modules` table (Supabase)** — stores module metadata: title, game_mode, question_limit, status. This is what the Admin page manages.
2. **Scenario tables (Supabase)** — store the actual question content per module:
   - `scenarios` → used by Chat Simulator (`game_mode = 'chat'`)
   - `scenarios_sorter` → used by Rapid Sorter (`game_mode = 'sorter'`)
   - `scenarios_defense` → used by Network Defense (`game_mode = 'defense'`)

### The Problem — Why This Isn't Plug-and-Play
The three game pages (`/user/chat-simulator`, `/user/rapid-sorter`, `/user/network-defense`) currently use **hardcoded scenario arrays** in the frontend code. They do NOT fetch scenarios from the database yet.

This means:
- Adding Module 4/5/6 via the Admin page **creates the module row** ✅
- But the game pages will still show the **same hardcoded questions** from modules 1/2/3 ❌

To properly support new modules without hardcoding, **the game pages must be made dynamic** (fetch scenarios from Supabase based on `module_id`). The DB tables for scenarios already exist and are correctly structured — they just aren't being used yet.

---

## What Needs to Happen (Execution Plan)

### Step 1 — Access the Admin Page
**URL:** `http://localhost:3000/admin/modules`

**What you need:**
- An account with `role = 'admin'` in the `profiles` table
- The admin credentials (email + password you registered with as admin)
- The local dev server must be running (`npm run dev` in the project folder)

**If you're unsure which account is admin:** Go to your Supabase dashboard → Table Editor → `profiles` table → check the `role` column. Any row with `role = 'admin'` is an admin account.

> **Supabase Project:** `https://juhenfitveiognubprcg.supabase.co`

---

### Step 2 — Add Modules via Admin Page (Form Values)

The Admin page form has 4 fields: **Title, Game Mode, Question Limit, Status**.

#### Module 4 — Phishing Attack Simulator
| Field | Value |
|-------|-------|
| Title | `Phishing Attack Simulator` |
| Game Mode | `Chat Simulator` |
| Question Limit | `5` |
| Status | `Active` |

#### Module 5 — Account Security Sorter
| Field | Value |
|-------|-------|
| Title | `Account Security Sorter` |
| Game Mode | `Rapid Sorter` |
| Question Limit | `5` |
| Status | `Active` |

#### Module 6 — Digital Privacy Shield
| Field | Value |
|-------|-------|
| Title | `Digital Privacy Shield` |
| Game Mode | `Network Defense` |
| Question Limit | `3` |
| Status | `Active` |

---

### Step 3 — Make Game Pages Dynamic (Code Change)

I will update the three game pages to fetch scenarios from Supabase instead of using hardcoded arrays. This means:

- `chat-simulator/page.tsx` → fetch from `scenarios` table filtered by `module_id`
- `rapid-sorter/page.tsx` → fetch from `scenarios_sorter` table filtered by `module_id`
- `network-defense/page.tsx` → fetch from `scenarios_defense` table filtered by `module_id`

The existing scenarios for Modules 1/2/3 will also be **migrated into the database** so they continue to work after the hardcoded arrays are removed.

---

### Step 4 — Insert Scenario Content via Supabase SQL

After the modules are created (Step 2), I will run SQL via a migration file to insert the new scenarios into the DB.

#### Module 4 Scenarios — Phishing Attack Simulator (Chat template)
Scenarios focused on: fake login links, impersonation emails, urgent account alerts, prize scams, and fake IT support messages.

| Sender | Scenario |
|--------|----------|
| `it-support@campus-helpdesk.info` | "Your student portal account will be suspended in 24 hours. Verify your credentials here: [campus-portal-verify.com]" |
| `Shopee Malaysia` | "Congratulations! You've won a RM500 voucher. Login to claim it now: [shopee-rewards.xyz/claim]" |
| `Bank Rakyat` | "Unusual activity detected on your account. Click here immediately to verify your identity or your account will be frozen." |
| `FYP Supervisor` | "Hey, I've updated the FYP rubric but Google Drive won't let me share. Can you send me your Google login so I can add you directly?" |
| `TikTok Security` | "We detected a login from a new device in another country. If this was not you, click here to secure your account: [tiktok-verify.net]" |

#### Module 5 Scenarios — Account Security Sorter (Rapid Sorter template)
Cards to classify as SAFE or RISKY:

| Text | Is Threat |
|------|-----------|
| "Using 'password123' as your TikTok password because it's easy to remember." | ✅ Threat |
| "Enabling two-factor authentication (2FA) on your email and banking apps." | ❌ Safe |
| "Using the same password for your university portal, email, and social media." | ✅ Threat |
| "Logging out of your accounts after using a public computer at the library." | ❌ Safe |
| "Sharing your account password with a close friend so they can post on your behalf." | ✅ Threat |

#### Module 6 Scenarios — Digital Privacy Shield (Network Defense template)
Same node/tool structure as Module 3 but with privacy and data protection threats:

| Threat | Correct Node | Correct Tool |
|--------|-------------|--------------|
| "A stranger found your full name, university, and home district from your public Facebook profile." | `fb` | `privacy` |
| "Someone is spamming your WhatsApp with unknown links after your number was leaked online." | `wa` | `block` |
| "Your TikTok account was accessed by someone who guessed your weak password." | `tiktok` | `mfa` |

> **Note:** Module 6 uses nodes `fb` (Facebook), `wa` (WhatsApp), `tiktok` (TikTok) instead of the current `ig/wa/email` nodes from Module 3. The `scenarios_defense` table supports any string for `correct_node` and `correct_tool`, so new nodes will need to be reflected in the network-defense page as well.

---

## What I Need From You Before Executing

1. **Confirm the plan above** looks correct for your syllabus focus.
2. **Tell me your admin account email** (or confirm you can log in to `/admin/modules`) — I need to know the app is accessible for the browser-based steps.
3. **Confirm whether to proceed via:**
   - **Option A (Recommended):** I write all the code changes + SQL migration, and you run `npm run dev` to test — no browser automation needed.
   - **Option B:** I use Claude in Chrome to navigate your admin page and click through the form as well, in addition to the code changes.

Option A is faster and more reliable. Option B is available if you'd prefer to see it done through the UI visually.

---

## Summary of All Changes Required

| # | What | Where | How |
|---|------|-------|-----|
| 1 | Add 3 module rows | Supabase `modules` table | Admin page form OR SQL |
| 2 | Insert scenarios for Module 4 | Supabase `scenarios` | SQL migration |
| 3 | Insert scenarios for Module 5 | Supabase `scenarios_sorter` | SQL migration |
| 4 | Insert scenarios for Module 6 | Supabase `scenarios_defense` | SQL migration |
| 5 | Migrate existing Module 1 scenarios to DB | Supabase `scenarios` | SQL migration |
| 6 | Migrate existing Module 2 scenarios to DB | Supabase `scenarios_sorter` | SQL migration |
| 7 | Migrate existing Module 3 scenarios to DB | Supabase `scenarios_defense` | SQL migration |
| 8 | Make chat-simulator dynamic | `app/user/chat-simulator/page.tsx` | Code change |
| 9 | Make rapid-sorter dynamic | `app/user/rapid-sorter/page.tsx` | Code change |
| 10 | Make network-defense dynamic | `app/user/network-defense/page.tsx` | Code change |
| 11 | Update network-defense nodes for Module 6 | `app/user/network-defense/page.tsx` | Code change |
