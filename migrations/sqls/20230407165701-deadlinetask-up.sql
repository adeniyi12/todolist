/* Replace with your SQL commands */
ALTER TABLE IF EXISTS Task 
ADD COLUMN deadline DATE DEFAULT (CURRENT_DATE + INTERVAL '3 days');