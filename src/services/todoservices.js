const pool = require("../db");
const jwt = require("jsonwebtoken");
const { validatetodoData, getUserId } = require("../validators/todovalidation");

//This Function allows user to create a todo
const createTodo = (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      await validatetodoData(req);

      const { name, tags } = req.body;

      if (!name) {
        reject("Name can not be blank");
      } else {
        const user_id = await getUserId(req);
        const conn = await pool.connect();
        const sql = `INSERT INTO Todo(name, user_id, tags)
                        VALUES ($1, $2, $3)
                        RETURNING *;`;

        const values = [name.trim(), user_id, tags || null];
        const result = await conn.query(sql, values);
        //console.log(result)
        conn.release();
        resolve(result.rows[0]);
      }
    } catch (error) {
      reject(error);
    }
  });
};

//This Function allows a user get all Todo's created
const getAllTodo = (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user_id = await getUserId(req);

      const conn = await pool.connect();
      const sql = "SELECT * from todo where user_id = ($1);";
      const result = await conn.query(sql, [user_id]);
      const rows = result.rows;
      //console.log(rows)
      conn.release();

      resolve(rows);
    } catch (error) {
      reject(error);
    }
  });
};

//This Function allows user to get a particular todo created
const getATodo = (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user_id = await getUserId(req);
      const conn = await pool.connect();
      const sql = "SELECT * from todo where user_id = ($1) and todo_id = ($2);";
      const result = await conn.query(sql, [user_id, req.params.todo_id]);
      const rows = result.rows[0];
      //console.log(rows)
      conn.release();

      resolve(rows);
    } catch (error) {
      reject(error);
    }
  });
};

//This Function allows user to edit a particular todo created
const editATodo = (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      await validatetodoData(req);

      const { name, tags } = req.body;
      const { todo_id } = req.params;
      const user_id = await getUserId(req);

      let newName = null;
      if (!name) {
        newName = null;
      } else if (name.trim() === "") {
        newName = null;
      } else {
        newName = name.trim();
      }

      const conn = await pool.connect();
      const sql =
        "UPDATE todo SET name = COALESCE($1, name), tags = COALESCE($2, tags), updated_at=now() WHERE todo_id =($3) AND user_id = ($4) RETURNING *;";
      const result = await conn.query(sql, [newName, tags, todo_id, user_id]);
      console.log(result);
      const rows = result.rows[0];

      if (!rows) reject("Todo Item not found");

      conn.release();

      console.log(rows);

      resolve(rows);
    } catch (error) {
      reject(error);
    }
  });
};

//This Function allows user delete a particular todo
const deleteATodo = (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { todo_id } = req.params;
      const user_id = await getUserId(req);

      const conn = await pool.connect();
      const sql =
        "DELETE FROM todo WHERE todo_id = ($1) AND user_id = ($2) RETURNING *;";
      const result = await conn.query(sql, [todo_id, user_id]);
      const rows = result.rows;
      console.log(rows);

      if (!rows.length) reject("Todo Item not found");

      conn.release();

      console.log(rows);

      resolve(rows);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { createTodo, getAllTodo, getATodo, editATodo, deleteATodo };
