-- This migration creates notification tables but production rollback is intentionally manual.
-- Export subscriptions, campaigns and delivery records before any destructive schema change.
select 1;
