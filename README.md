# TO DO LIST BACKEND APP

A backend project developed for a todolist application

### Project Metadata

Stack = Node.js

Database = Postgres DB

Endpoint Test Environment = Postman

Framework = Express.js

Port = 3000

### How to run the app

-Clone the repo

-Open cloned folder and run `npm install`

- Create a new database in PostgresDB called `todos`

  -All other details for the db can be found in the .env file

  -Run `npm run start` to start the application.

  -Use a postman tool to interact with the endpoints. Visit any of the endpoints below with the correct request method

## Endpoints Available

### Authentication

User Signup - route POST /users/

User login - route POST /users/login

### Todo

Todo Creation - route POST /todo/create

Fetch All Todo - route GET /todo/all

Fetch A Todo - route GET /todo/:todo_id

Edit A Todo - route PATCH /todo/:todo_id

Delete A Todo - route DELETE /todo/:todo_id

### Task

Task Creation - route POST /task/:todo_id/create

Fetch All Task - route GET /task/:todo_id/all

Fetch A Task - route GET /task/:todo_id/tasks/:task_id

Edit A Task - route PATCH /task/:todo_id/tasks/:task_id

Delete A Task - route DELETE /task/:todo_id/tasks/:task_id

Search A Task - route GET /task/search

Reorder A Task - route GET /task/:todo_id/reorder/:task_id

Upload A Document - route PATCH /task/:todo_id/upload/:task_id
