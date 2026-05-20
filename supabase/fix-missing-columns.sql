-- Add missing columns to projects table
alter table projects add column if not exists category text;
alter table projects add column if not exists year int;

-- Add missing active column to newsletter_subscribers
alter table newsletter_subscribers add column if not exists active boolean not null default true;
