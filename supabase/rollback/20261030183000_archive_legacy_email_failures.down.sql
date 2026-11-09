-- Conservative rollback: intentionally preserve historical email audit data.
-- This migration marked legacy failed/bounced messages as archived and added
-- archived_at. Removing the column or clearing all archived_at values could
-- destroy later legitimate archive decisions, so rollback is a documented no-op.
-- To reverse a specific archival batch, restore archived_at from a verified
-- pre-migration backup using an explicitly reviewed, targeted operation.
select 1;
