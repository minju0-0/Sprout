alter table garden_states
  add column if not exists debts jsonb not null default '[]'::jsonb;