/* Replace with your SQL commands */
ALTER TABLE IF EXISTS Task ADD COLUMN IF NOT EXISTS document bytea DEFAULT NULL;
