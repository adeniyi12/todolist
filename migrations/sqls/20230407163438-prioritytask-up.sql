/* Replace with your SQL commands */

CREATE TYPE priority_level AS ENUM ('Low', 'Medium', 'High');

ALTER TABLE IF EXISTS Task ADD COLUMN priority priority_level NOT NULL DEFAULT 'Medium';