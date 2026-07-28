alter table garden_states
  add column if not exists unallocated numeric not null default 0;
alter table garden_states
  add column if not exists allocation_history jsonb not null default '[]'::jsonb;
