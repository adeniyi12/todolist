/* Replace with your SQL commands */
ALTER TABLE IF EXISTS Todo
ADD COLUMN IF NOT EXISTS tags VARCHAR(255);