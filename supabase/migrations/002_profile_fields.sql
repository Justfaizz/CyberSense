-- Add new profile fields
alter table public.profiles
  add column if not exists avatar_url    text,
  add column if not exists bio          text,
  add column if not exists institution  text,
  add column if not exists contact_email text;

-- Storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

-- Storage policies
create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Avatars are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'avatars');
