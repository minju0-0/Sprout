create table if not exists garden_states (
  user_id text primary key,
  categories jsonb not null default '[]'::jsonb,
  transactions jsonb not null default '[]'::jsonb,
  goals jsonb not null default '[]'::jsonb,
  active_season text not null,
  harvest_history jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
alter table garden_states enable row level security;
create or replace function set_garden_states_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
drop trigger if exists garden_states_updated_at on garden_states;
create trigger garden_states_updated_at
  before update on garden_states
  for each row
  execute function set_garden_states_updated_at();
