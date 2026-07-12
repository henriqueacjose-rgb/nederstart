create extension if not exists "pgcrypto";

create type lesson_status as enum ('locked', 'available', 'in_progress', 'completed');
create type content_status as enum ('draft', 'review', 'published', 'archived');
create type audio_speed as enum ('slow', 'natural', 'reduced');
create type audio_type as enum ('word', 'phrase', 'dialogue', 'instruction');
create type exercise_type as enum ('multiple_choice', 'fill_blank', 'order_words', 'listening_identification', 'short_answer', 'translation');

create table languages (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  direction_type text not null check (direction_type in ('source', 'target')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  base_language_code text not null references languages(code),
  current_level_code text not null default 'A0',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  target_language_code text not null references languages(code),
  status content_status not null default 'draft',
  version integer not null default 1,
  created_at timestamptz not null default now()
);

create table levels (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  code text not null,
  title text not null,
  description text not null,
  order_index integer not null,
  status content_status not null default 'draft',
  unique(course_id, code)
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  level_id uuid not null references levels(id) on delete cascade,
  code text not null unique,
  title text not null,
  objective text not null,
  order_index integer not null,
  status content_status not null default 'draft',
  estimated_minutes integer not null default 30,
  content_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table lesson_content_blocks (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  block_type text not null,
  order_index integer not null,
  content_json jsonb not null default '{}'::jsonb,
  source_language_code text references languages(code),
  target_language_code text references languages(code)
);

create table vocabulary_items (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  text_nl text not null,
  translation_pt text,
  translation_en text,
  pronunciation_guidance text,
  common_errors_pt text,
  common_errors_en text,
  example_sentence text,
  order_index integer not null
);

create table phrases (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  text_nl text not null,
  translation_pt text,
  translation_en text,
  sound_blocks text,
  slow_form text,
  natural_form text,
  reduced_form text,
  pronunciation_guidance text,
  order_index integer not null
);

create table voices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  gender text,
  region text,
  native_language text not null default 'nl',
  status content_status not null default 'draft'
);

create table audio_assets (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  vocabulary_item_id uuid references vocabulary_items(id) on delete set null,
  phrase_id uuid references phrases(id) on delete set null,
  type audio_type not null,
  speed audio_speed not null,
  voice_id uuid references voices(id) on delete set null,
  file_url text not null,
  duration_seconds numeric(8, 2),
  transcript_nl text not null,
  status content_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  type exercise_type not null,
  prompt_json jsonb not null default '{}'::jsonb,
  answer_json jsonb not null default '{}'::jsonb,
  feedback_json jsonb not null default '{}'::jsonb,
  difficulty integer not null default 1,
  order_index integer not null,
  status content_status not null default 'draft'
);

create table quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  title text not null,
  pass_score integer not null default 80,
  status content_status not null default 'draft'
);

create table quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  type exercise_type not null,
  prompt_json jsonb not null default '{}'::jsonb,
  options_json jsonb not null default '[]'::jsonb,
  correct_answer_json jsonb not null default '{}'::jsonb,
  feedback_json jsonb not null default '{}'::jsonb,
  order_index integer not null
);

create table flashcards (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  vocabulary_item_id uuid references vocabulary_items(id) on delete set null,
  phrase_id uuid references phrases(id) on delete set null,
  front_json jsonb not null default '{}'::jsonb,
  back_json jsonb not null default '{}'::jsonb,
  audio_asset_id uuid references audio_assets(id) on delete set null,
  order_index integer not null
);

create table roleplays (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  title text not null,
  scenario_json jsonb not null default '{}'::jsonb,
  role_a_json jsonb not null default '{}'::jsonb,
  role_b_json jsonb not null default '{}'::jsonb,
  criteria_json jsonb not null default '{}'::jsonb,
  order_index integer not null
);

create table lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  status lesson_status not null default 'available',
  opened_at timestamptz,
  audio_completed_at timestamptz,
  shadowing_completed_at timestamptz,
  exercises_completed_at timestamptz,
  quiz_completed_at timestamptz,
  flashcards_completed_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create table progress_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete set null,
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  quiz_id uuid not null references quizzes(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  score integer not null,
  answers_json jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  base_language_code text not null references languages(code),
  audio_autoplay boolean not null default false,
  playback_speed numeric(3, 2) not null default 1,
  preferred_audio_speed text not null default 'natural' check (preferred_audio_speed in ('slow', 'natural')),
  theme text not null default 'light' check (theme in ('light', 'dark')),
  daily_goal_minutes integer not null default 20,
  accessibility_preferences_json jsonb not null default '{}'::jsonb,
  learning_preferences_json jsonb not null default '{}'::jsonb,
  email_notifications boolean not null default true
);

create index idx_lessons_level_order on lessons(level_id, order_index);
create index idx_progress_user on lesson_progress(user_id, status);
create index idx_progress_events_user_created on progress_events(user_id, created_at desc);
create index idx_audio_lesson on audio_assets(lesson_id, type, speed);
create index idx_lessons_search on lessons using gin (to_tsvector('simple', code || ' ' || title || ' ' || objective));
create index idx_vocabulary_search on vocabulary_items using gin (to_tsvector('simple', text_nl || ' ' || coalesce(translation_pt, '') || ' ' || coalesce(translation_en, '')));

alter table profiles enable row level security;
alter table languages enable row level security;
alter table courses enable row level security;
alter table levels enable row level security;
alter table lessons enable row level security;
alter table lesson_content_blocks enable row level security;
alter table vocabulary_items enable row level security;
alter table phrases enable row level security;
alter table voices enable row level security;
alter table audio_assets enable row level security;
alter table exercises enable row level security;
alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table flashcards enable row level security;
alter table roleplays enable row level security;
alter table lesson_progress enable row level security;
alter table progress_events enable row level security;
alter table quiz_attempts enable row level security;
alter table settings enable row level security;

create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Authenticated users can read active languages" on languages for select to authenticated using (active = true);
create policy "Authenticated users can read published courses" on courses for select to authenticated using (status = 'published');
create policy "Authenticated users can read published levels" on levels for select to authenticated using (
  status = 'published' and exists (
    select 1 from courses c where c.id = levels.course_id and c.status = 'published'
  )
);
create policy "Authenticated users can read published lessons" on lessons for select to authenticated using (
  status = 'published' and exists (
    select 1
    from levels lv
    join courses c on c.id = lv.course_id
    where lv.id = lessons.level_id and lv.status = 'published' and c.status = 'published'
  )
);
create policy "Authenticated users can read published lesson blocks" on lesson_content_blocks for select to authenticated using (
  exists (
    select 1
    from lessons l
    join levels lv on lv.id = l.level_id
    join courses c on c.id = lv.course_id
    where l.id = lesson_content_blocks.lesson_id
      and l.status = 'published'
      and lv.status = 'published'
      and c.status = 'published'
  )
);
create policy "Authenticated users can read published vocabulary" on vocabulary_items for select to authenticated using (
  exists (
    select 1
    from lessons l
    join levels lv on lv.id = l.level_id
    join courses c on c.id = lv.course_id
    where l.id = vocabulary_items.lesson_id
      and l.status = 'published'
      and lv.status = 'published'
      and c.status = 'published'
  )
);
create policy "Authenticated users can read published phrases" on phrases for select to authenticated using (
  exists (
    select 1
    from lessons l
    join levels lv on lv.id = l.level_id
    join courses c on c.id = lv.course_id
    where l.id = phrases.lesson_id
      and l.status = 'published'
      and lv.status = 'published'
      and c.status = 'published'
  )
);
create policy "Authenticated users can read published voices" on voices for select to authenticated using (status = 'published');
create policy "Authenticated users can read published audio assets" on audio_assets for select to authenticated using (
  status = 'published' and exists (
    select 1
    from lessons l
    join levels lv on lv.id = l.level_id
    join courses c on c.id = lv.course_id
    where l.id = audio_assets.lesson_id
      and l.status = 'published'
      and lv.status = 'published'
      and c.status = 'published'
  )
);
create policy "Authenticated users can read published exercises" on exercises for select to authenticated using (
  status = 'published' and exists (
    select 1
    from lessons l
    join levels lv on lv.id = l.level_id
    join courses c on c.id = lv.course_id
    where l.id = exercises.lesson_id
      and l.status = 'published'
      and lv.status = 'published'
      and c.status = 'published'
  )
);
create policy "Authenticated users can read published quizzes" on quizzes for select to authenticated using (
  status = 'published' and exists (
    select 1
    from lessons l
    join levels lv on lv.id = l.level_id
    join courses c on c.id = lv.course_id
    where l.id = quizzes.lesson_id
      and l.status = 'published'
      and lv.status = 'published'
      and c.status = 'published'
  )
);
create policy "Authenticated users can read published quiz questions" on quiz_questions for select to authenticated using (
  exists (
    select 1
    from quizzes q
    join lessons l on l.id = q.lesson_id
    join levels lv on lv.id = l.level_id
    join courses c on c.id = lv.course_id
    where q.id = quiz_questions.quiz_id
      and q.status = 'published'
      and l.status = 'published'
      and lv.status = 'published'
      and c.status = 'published'
  )
);
create policy "Authenticated users can read published flashcards" on flashcards for select to authenticated using (
  exists (
    select 1
    from lessons l
    join levels lv on lv.id = l.level_id
    join courses c on c.id = lv.course_id
    where l.id = flashcards.lesson_id
      and l.status = 'published'
      and lv.status = 'published'
      and c.status = 'published'
  )
);
create policy "Authenticated users can read published roleplays" on roleplays for select to authenticated using (
  exists (
    select 1
    from lessons l
    join levels lv on lv.id = l.level_id
    join courses c on c.id = lv.course_id
    where l.id = roleplays.lesson_id
      and l.status = 'published'
      and lv.status = 'published'
      and c.status = 'published'
  )
);
create policy "Users can read own progress" on lesson_progress for select using (auth.uid() = user_id);
create policy "Users can insert own progress" on lesson_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own progress" on lesson_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own progress" on lesson_progress for delete using (auth.uid() = user_id);
create policy "Users can read own events" on progress_events for select using (auth.uid() = user_id);
create policy "Users can insert own events" on progress_events for insert with check (auth.uid() = user_id);
create policy "Users can read own quiz attempts" on quiz_attempts for select using (auth.uid() = user_id);
create policy "Users can insert own quiz attempts" on quiz_attempts for insert with check (auth.uid() = user_id);
create policy "Users can read own settings" on settings for select using (auth.uid() = user_id);
create policy "Users can insert own settings" on settings for insert with check (auth.uid() = user_id);
create policy "Users can update own settings" on settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into languages(code, name, direction_type) values
  ('pt', 'Portuguese', 'source'),
  ('en', 'English', 'source'),
  ('nl', 'Dutch', 'target')
on conflict (code) do nothing;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values (
  'native-audio',
  'native-audio',
  true,
  52428800,
  array['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4']
)
on conflict (id) do nothing;

create policy "Native audio is publicly readable"
on storage.objects for select
using (bucket_id = 'native-audio');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles(id, name, email, base_language_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'base_language_code', 'pt')
  );

  insert into public.settings(user_id, base_language_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'base_language_code', 'pt')
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
