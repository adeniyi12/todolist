/* Replace with your SQL commands */
CREATE TABLE IF NOT EXISTS Task (
    task_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    todo_id INTEGER REFERENCES todo(todo_id),
    user_id INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);