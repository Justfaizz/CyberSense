-- =============================================
-- CYBERSENSE - Supabase Schema Migration
-- Run this in your Supabase SQL Editor
-- =============================================

-- ── PROFILES (extends Supabase Auth users) ───────────────────────────
create table public.profiles (
  id         uuid references auth.users(id) on delete cascade primary key,
  full_name  text not null,
  role       text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz default now()
);

-- Auto-create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins can delete profiles"
  on public.profiles for delete
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


-- ── MODULES ──────────────────────────────────────────────────────────
create table public.modules (
  id             serial primary key,
  title          text not null,
  description    text default '',
  game_mode      text not null check (game_mode in ('chat', 'sorter', 'defense')),
  question_limit integer default 5,
  status         text default 'active' check (status in ('active', 'inactive')),
  created_at     timestamptz default now()
);

alter table public.modules enable row level security;

create policy "Authenticated users can view active modules"
  on public.modules for select
  using (
    status = 'active'
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins can manage modules"
  on public.modules for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


-- ── SCENARIOS (Chat Simulator - Module 1) ────────────────────────────
create table public.scenarios (
  id               serial primary key,
  module_id        integer references public.modules(id) on delete cascade,
  sender_name      text,
  message_text     text,
  choice_1_text    text,
  choice_1_correct boolean,
  choice_1_title   text,
  choice_1_body    text,
  choice_2_text    text,
  choice_2_correct boolean,
  choice_2_title   text,
  choice_2_body    text
);

alter table public.scenarios enable row level security;

create policy "Authenticated users can view scenarios"
  on public.scenarios for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage scenarios"
  on public.scenarios for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


-- ── SCENARIOS SORTER (Rapid Sorter - Module 2) ───────────────────────
create table public.scenarios_sorter (
  id             serial primary key,
  module_id      integer references public.modules(id) on delete cascade,
  scenario_text  text,
  is_threat      boolean,
  feedback_title text default 'Result',
  feedback_text  text default 'Feedback'
);

alter table public.scenarios_sorter enable row level security;

create policy "Authenticated users can view sorter scenarios"
  on public.scenarios_sorter for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage sorter scenarios"
  on public.scenarios_sorter for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


-- ── SCENARIOS DEFENSE (Network Defense - Module 3) ───────────────────
create table public.scenarios_defense (
  id             serial primary key,
  module_id      integer references public.modules(id) on delete cascade,
  threat_text    text,
  correct_node   text,  -- 'ig' | 'wa' | 'email'
  correct_tool   text,  -- 'privacy' | 'block' | 'mfa'
  feedback_title text default 'Result',
  feedback_text  text default 'Feedback'
);

alter table public.scenarios_defense enable row level security;

create policy "Authenticated users can view defense scenarios"
  on public.scenarios_defense for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage defense scenarios"
  on public.scenarios_defense for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


-- ── USER SCORES ───────────────────────────────────────────────────────
create table public.user_scores (
  id              serial primary key,
  user_id         uuid references auth.users(id) on delete cascade,
  module_id       integer references public.modules(id),
  score           integer not null,
  total_questions integer not null,
  percentage      numeric(5, 2) not null,
  passed          boolean default false,
  completed_at    timestamptz default now()
);

alter table public.user_scores enable row level security;

create policy "Users can view own scores"
  on public.user_scores for select
  using (auth.uid() = user_id);

create policy "Users can insert own scores"
  on public.user_scores for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all scores"
  on public.user_scores for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


-- ── SEED DATA: Default 3 modules ─────────────────────────────────────
insert into public.modules (title, description, game_mode, question_limit, status) values
  ('Harassment Simulator',  'Practice responding to online cyberbullying and harassment.',     'chat',    5, 'active'),
  ('Rapid Threat Sorter',   'Quickly classify incoming messages as safe or threatening.',       'sorter',  5, 'active'),
  ('Social Node Defense',   'Drag the right cybersecurity tools onto your social media nodes.', 'defense', 3, 'active');
