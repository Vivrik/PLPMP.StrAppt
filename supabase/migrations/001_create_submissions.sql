create table submissions (
  id              uuid        primary key default gen_random_uuid(),
  created_at      timestamptz not null    default now(),
  profile         jsonb       not null,
  responses       jsonb       not null,
  overall_score   integer     not null,
  overall_label   text        not null,
  top_strengths   text[]      not null,
  top_risks       text[]      not null,
  section_scores  jsonb       not null,
  roadmap         jsonb       not null,
  contact_name    text,
  contact_email   text,
  contact_company text,
  report_html     text,
  report_text     text,
  pdf_url         text,
  email_status    text        not null default 'NOT_REQUESTED'
);
