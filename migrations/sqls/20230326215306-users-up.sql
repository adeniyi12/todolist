/* Replace with your SQL commands */
CREATE TABLE IF NOT EXISTS Users (
  user_id SERIAL PRIMARY KEY,
  userName VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);