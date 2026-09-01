-- Tracks whether a user has completed (or skipped) the first-run onboarding
-- tour, so it auto-shows once per account (not per device/browser) and can
-- also be replayed on demand from Settings.

alter table profiles add column onboarding_completed_at timestamptz;
