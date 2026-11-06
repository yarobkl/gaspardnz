-- Rollback plan for 20261031120000_crm_marketing_fields.sql
-- This migration adds five CRM marketing columns to public.leads.
-- Rolling back requires an explicit data-retention decision, since removing
-- the columns would permanently discard recorded consent, tags and follow-ups.
-- No automatic destructive rollback is provided.
-- Before rollback: export the affected column values, confirm retention and
-- privacy requirements, and execute an approved manual schema change.
-- Keeping this script non-destructive avoids accidental loss of CRM records.
select 1;
