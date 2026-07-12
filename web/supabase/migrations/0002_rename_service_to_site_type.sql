-- Aligns the leads table with the spec's column name (site_type instead
-- of service). Uses RENAME COLUMN, not drop+recreate, so existing rows
-- keep their data. Safe to run once; re-running is a no-op error if the
-- column was already renamed (guarded by the IF EXISTS check below).

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'leads' and column_name = 'service'
  ) then
    alter table public.leads rename column service to site_type;
  end if;
end $$;
