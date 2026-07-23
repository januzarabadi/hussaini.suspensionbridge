create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text check (name is null or char_length(name) between 1 and 100),
  country text not null check (char_length(country) between 2 and 100),
  rating smallint not null check (rating between 1 and 5),
  review text not null check (char_length(review) between 10 and 2000),
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

drop policy if exists "Reviews are publicly readable" on public.reviews;
create policy "Reviews are publicly readable"
on public.reviews
for select
to anon, authenticated
using (true);

drop policy if exists "Anyone can submit a review" on public.reviews;
create policy "Anyone can submit a review"
on public.reviews
for insert
to anon, authenticated
with check (
  rating between 1 and 5
  and char_length(country) between 2 and 100
  and char_length(review) between 10 and 2000
  and (name is null or char_length(name) between 1 and 100)
);

grant select, insert on table public.reviews to anon, authenticated;
revoke update, delete on table public.reviews from anon, authenticated;

create index if not exists reviews_created_at_idx
on public.reviews (created_at desc);
