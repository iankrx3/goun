-- Minimal, intentionally FK-free places cache.
--
-- Places in this app come from live Google/KTO search results with dynamic ids
-- (see src/services/discovery.ts) and are never synced back into this table —
-- fetchPlaces() (src/services/places.ts) only ever SELECTs from it, and nothing
-- in the codebase INSERTs into it. It exists purely so creator_picks/list_spots/
-- community_posts have a `places` table to (optionally) join against; those
-- tables deliberately have NO foreign key into `places` (see creators_schema.sql
-- and community_schema.sql) because a real place id will essentially never have
-- a matching row here.
--
-- create table if not exists is a no-op against the live project — this file
-- exists for documentation/reproducibility of the table already created there.
create table if not exists places (
  id text primary key,
  name text not null,
  category text,
  address text,
  area text,
  latitude double precision,
  longitude double precision,
  photo_url text,
  price_range text,
  rating numeric,
  review_count integer,
  representative_treatment text,
  treatment_ids text[],
  language text[],
  foreigner_friendly boolean default false,
  booking_url text
);
