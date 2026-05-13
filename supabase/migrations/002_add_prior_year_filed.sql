-- Add prior_year_filed column to clients table
alter table clients add column if not exists prior_year_filed boolean default false;
