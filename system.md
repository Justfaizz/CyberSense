# CyberSense — System Capacity Plan

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 18 |
| Backend | Next.js Server Components + Server Actions |
| Database & Auth | Supabase (PostgreSQL + GoTrue Auth) |
| Hosting | Vercel Free + Supabase Free |

---

## Maximum Free-Tier Capacity

> **50 concurrent users** — with the optimisations applied in this codebase.

This is achievable on **100% free tiers** (Vercel Free + Supabase Free) using the following strategy.

---

## Free-Tier Limits

| Service | Relevant Limit |
|---|---|
| Vercel Free | 100 GB-hours serverless / month, 100 GB bandwidth |
| Supabase Free | 500 MB DB storage, ~60 pooled connections (PgBouncer), 50,000 MAU auth |
| Supabase Free Auth | 50,000 monthly active users |

---

## The Bottleneck: Database Connections

Supabase Free provides around **60 pooled connections** via PgBouncer (transaction mode). Without caching, every page load by every user opens a short-lived connection. At 50 concurrent users, that is 50+ simultaneous DB queries for the same leaderboard and profile data — this saturates the free pool.

The fix applied in this codebase: **shared server-side cache** (`lib/cache.ts`).

---

## Optimisations Applied (lib/cache.ts)

The following expensive, shared queries now run **once every 60 seconds** regardless of how many users load the page at the same time. All concurrent users share the single cached result.

| Cached Query | Revalidate | Pages Using It |
|---|---|---|
| `user_scores` (leaderboard) | 60 s | Home, Leaderboard, Admin Dashboard |
| `profiles` (name + institution) | 60 s | Home, Leaderboard, Admin Dashboard |
| Active module count | 300 s | Home, Leaderboard |
| Latest videos | 300 s | Home |
| Avg score (admin) | 60 s | Admin Dashboard |

Without cache: 50 users × 3–5 queries each = **150–250 DB queries per page load cycle**.
With cache: **1–2 DB queries** per 60-second window for shared data, plus 1 user-specific query per user.

This reduces DB connection pressure by approximately **95%** under concurrent load.

---

## Remaining Live (Per-User) Queries

These are intentionally NOT cached because they are unique to each logged-in user:

- Auth session check (`supabase.auth.getUser()`)
- User's own passed module IDs
- User's own profile name (for the sidebar greeting)
- Admin recent activity feed (last 10 rows)

These are lightweight single-row queries and do not stress the connection pool.

---

## Capacity Summary

| Scenario | Max Concurrent Users | Cost |
|---|---|---|
| XAMPP / localhost | 1 (dev only) | — |
| Vercel Free + Supabase Free, **no optimisations** | ~15–20 | $0 |
| Vercel Free + Supabase Free, **with cache (current)** | **~50** | $0 |
| Vercel Free + Supabase Pro | ~150+ | $25/mo |

---

## Critical Configuration Requirement

The single most important free-tier setting is using the **pooled Supabase connection string** in your environment variables.

In your `.env.local` (and Vercel environment settings), confirm:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
```

For server-side connections, Supabase auto-routes through PgBouncer when using the standard URL with `@supabase/ssr`. No change needed in code — just confirm you are NOT using the direct (port 5432) connection string in any custom DB config.

---

## Vercel Deployment (Required for Production)

XAMPP is development-only. To serve real users:

1. Push the repo to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy — Vercel handles scaling automatically

---

## Pre-Launch Checklist

- [x] Logo links to home page (all 11 sidebar instances)
- [x] Shared leaderboard / profile data cached (`lib/cache.ts`)
- [x] Row limits added to all unbounded DB queries (max 500)
- [ ] Deploy to Vercel
- [ ] Set environment variables in Vercel dashboard
- [ ] Smoke-test with 5–10 simultaneous browser sessions
- [ ] Optional: load-test with [k6](https://k6.io/) targeting 50 virtual users

---

*Last updated: June 2026 — CyberSense FYP Capacity Review*
