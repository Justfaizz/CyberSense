# Edit Profile — Feature Plan

## Current State

Both `/user/profile` and `/admin/profile` already have a basic inline edit form inside `ProfileClient.tsx`. Right now users can edit:
- **Display name** (`full_name` in the `profiles` table)
- **Password** (via Supabase Auth)

The `profiles` table currently only has: `id`, `full_name`, `role`, `created_at`.

---

## What We're Adding

The goal is to expand the edit profile experience with richer fields and a proper avatar upload, making both the student and admin profile pages feel more complete and personal.

### New profile fields
| Field | Student | Admin | Notes |
|---|---|---|---|
| `avatar_url` | ✅ | ✅ | Profile picture, stored in Supabase Storage |
| `bio` | ✅ | ✅ | Short tagline / about text |
| `institution` | ✅ | — | Student's school or organisation |
| `contact_email` | — | ✅ | Public contact email (separate from login email) |

---

## Files to Create / Modify

### 1. Database — new migration file
**`supabase/migrations/002_profile_fields.sql`** *(new)*

Add the new columns to `profiles` and create a Supabase Storage bucket for avatars.

```sql
-- Add new columns
alter table public.profiles
  add column if not exists avatar_url  text,
  add column if not exists bio         text,
  add column if not exists institution text,        -- student only
  add column if not exists contact_email text;      -- admin only

-- Storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

-- Storage policy: users can upload/update their own avatar
create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Avatars are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'avatars');
```

---

### 2. API Route
**`app/api/profile/route.ts`** *(modify)*

Extend the existing `PATCH` handler to accept and save the new fields.

```ts
// Accept: full_name, password, bio, institution, contact_email, avatar_url
const { full_name, password, bio, institution, contact_email, avatar_url } = await request.json()

await supabase.from('profiles').update({
  ...(full_name       && { full_name }),
  ...(bio !== undefined && { bio }),
  ...(institution     && { institution }),
  ...(contact_email   && { contact_email }),
  ...(avatar_url      && { avatar_url }),
}).eq('id', user.id)
```

Add a new `GET` handler to fetch the current user's full profile in one call (currently the page does this server-side, but the client needs it after a save to refresh).

---

### 3. Shared Avatar Upload Component
**`app/components/AvatarUpload.tsx`** *(new)*

A reusable client component that:
- Shows the current avatar (or a default icon if none)
- Has a clickable "change photo" overlay
- Uploads to Supabase Storage at path `avatars/{userId}/{timestamp}.jpg`
- Calls back with the new `avatar_url` so the parent form can include it in the save payload
- Shows a loading spinner during upload and an error banner on failure

This component is shared between the student and admin profile pages to avoid duplicating upload logic.

---

### 4. Student Profile
**`app/user/profile/ProfileClient.tsx`** *(modify)*

Extend the existing component:

- Replace the static `fa-user` icon circle with `<AvatarUpload />` (so the avatar is always visible and clickable in edit mode)
- Add **Bio** textarea field (shown in both view and edit mode)
- Add **Institution** text input (edit mode only, shown as read-only label in view mode)
- Keep existing Display Name and Password fields
- The `Props` interface gains: `avatarUrl`, `bio`, `institution`

View mode layout:
```
[ Avatar ]
STUDENT badge
Display Name
Email  (read-only, never editable)
Bio
Institution
[ EDIT PROFILE button ]
```

Edit mode layout:
```
[ Avatar (click to change) ]
Display Name field
Bio textarea
Institution field
New Password field (optional)
Confirm Password field
[ CANCEL ]  [ SAVE CHANGES ]
```

---

### 5. Admin Profile
**`app/admin/profile/ProfileClient.tsx`** *(modify)*

Same pattern as the student, but with admin-specific fields:

- Replace static icon with `<AvatarUpload />`
- Add **Bio** textarea
- Add **Contact Email** text input (separate from login email)
- The `Props` interface gains: `avatarUrl`, `bio`, `contactEmail`

View mode layout:
```
[ Avatar ]
SYSTEM ADMINISTRATOR badge
Display Name
Login Email  (read-only)
Bio
Contact Email
[ EDIT PROFILE button ]
```

Edit mode layout:
```
[ Avatar (click to change) ]
Display Name field
Bio textarea
Contact Email field
New Password field (optional)
Confirm Password field
[ CANCEL ]  [ SAVE CHANGES ]
```

---

### 6. Page Files (pass new props)
**`app/user/profile/page.tsx`** *(modify)*  
**`app/admin/profile/page.tsx`** *(modify)*

The server-side `select('*')` already fetches all columns, so the new fields come through automatically. Just pass the extra props to the client components:

```tsx
// user/profile/page.tsx
<UserProfileClient
  fullName={profile?.full_name ?? ''}
  email={user.email ?? ''}
  avatarUrl={profile?.avatar_url ?? null}
  bio={profile?.bio ?? ''}
  institution={profile?.institution ?? ''}
/>
```

---

### 7. TypeScript Types
**`lib/types.ts`** *(modify)*

```ts
export interface Profile {
  id: string
  full_name: string
  role: 'student' | 'admin'
  avatar_url: string | null   // new
  bio: string | null          // new
  institution: string | null  // new (students)
  contact_email: string | null// new (admins)
  created_at: string
}
```

---

## Implementation Order

1. **Run the SQL migration** (`002_profile_fields.sql`) in Supabase — adds columns and creates storage bucket.
2. **Update `lib/types.ts`** — TypeScript catches all the places that need updating.
3. **Create `AvatarUpload.tsx`** — self-contained, can be built and tested independently.
4. **Update `app/api/profile/route.ts`** — extend PATCH, add GET.
5. **Update `app/user/profile/ProfileClient.tsx`** — student edit form.
6. **Update `app/admin/profile/ProfileClient.tsx`** — admin edit form.
7. **Update page files** — pass new props down.

---

## Out of Scope (not planned for this feature)

- Email change (Supabase requires email verification, adds significant complexity — keep login email read-only for now)
- Admin editing *other users'* profiles (that belongs in the Users management page)
- Social links / extended profile sections
