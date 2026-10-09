-- Additive, idempotent schema for the existing small-team learning application.
CREATE TABLE IF NOT EXISTS xwy_state (
  name text PRIMARY KEY,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS xwy_uploads (
  uid text NOT NULL,
  id text NOT NULL,
  bytes bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(uid,id)
);
