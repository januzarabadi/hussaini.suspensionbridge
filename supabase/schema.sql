create table if not exists public.review (
  id uuid primary key default gen_random_uuid(),
  name text check (name is null or char_length(name) between 1 and 100),
  country text not null check (char_length(country) between 2 and 100),
  rating smallint not null check (rating between 1 and 5),
  review text not null check (char_length(review) between 10 and 2000),
  created_at timestamptz not null default now()
);

-- `create table if not exists` does not change a pre-existing table. The live
-- table predates the optional visitor name column, so add it explicitly.
alter table public.review
add column if not exists name text;

alter table public.review enable row level security;

drop policy if exists "Reviews are publicly readable" on public.review;
create policy "Reviews are publicly readable"
on public.review
for select
to anon, authenticated
using (true);

drop policy if exists "Anyone can submit a review" on public.review;
create policy "Anyone can submit a review"
on public.review
for insert
to anon, authenticated
with check (
  rating between 1 and 5
  and char_length(country) between 2 and 100
  and char_length(review) between 10 and 2000
  and (name is null or char_length(name) between 1 and 100)
);

grant select, insert on table public.review to anon, authenticated;
revoke update, delete on table public.review from anon, authenticated;

create index if not exists review_created_at_idx
on public.review (created_at desc);
