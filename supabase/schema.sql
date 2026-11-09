-- Futtasd a Supabase SQL Editorban.
create table if not exists public.movies (
  id            uuid primary key default gen_random_uuid(),
  imdb_id       text unique,
  tmdb_id       integer not null,
  title         text not null,
  media_type    text not null check (media_type in ('movie', 'tv')),
  poster_path   text,
  overview      text,
  vote_average  numeric(3,1),
  release_year  integer,
  genres        text[] not null default '{}',
  trailer_url   text,
  watched       boolean not null default false,
  liked         boolean,            -- true = 👍, false = 👎, null = nincs értékelés
  created_at    timestamptz not null default now(),
  unique (tmdb_id, media_type)
);

alter table public.movies enable row level security;

-- Egyszerű, PIN-es app: az anon kulcs teljes hozzáférést kap.
create policy "anon full access" on public.movies
  for all to anon using (true) with check (true);

-- Realtime
alter table public.movies replica identity full;
alter publication supabase_realtime add table public.movies;

