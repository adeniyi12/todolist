const pool = require('../db')
const jwt = require('jsonwebtoken')
const { validatetodoData, getUserId } = require('../validators/todovalidation')

const createTodo = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            await validatetodoData(req)
            let user_id = await getUserId(req)
            const conn = await pool.connect()
            const sql = `INSERT INTO Todo(name, user_id)
                    VALUES ($1, $2)
                    RETURNING *;`;

            const values = [req.body.name, user_id];
            const result = await conn.query(sql, values)
            //console.log(result)
            conn.release()
            resolve(result.rows[0])

        } catch (error) {
            reject(error)
        }
    })

}

const getAllTodo = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user_id = await getUserId(req)
            //const user_id = 3
            const conn = await pool.connect()
            const sql = 'SELECT * from todo where user_id = ($1);'
            const result = await conn.query(sql, [user_id])
            const rows = result.rows
            //console.log(rows)
            conn.release()

            resolve(rows)

        } catch (error) {
            reject(error)
        }
    })
}

const getATodo = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user_id = await getUserId(req)
            const conn = await pool.connect()
            const sql = 'SELECT * from todo where user_id = ($1) and todo_id = ($2);'
            const result = await conn.query(sql, [user_id, req.params.todo_id])
            const rows = result.rows[0]
            //console.log(rows)
            conn.release()

            resolve(rows)

        } catch (error) {
            reject(error)
        }
    })
}


const editATodo = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            await validatetodoData(req)

            const { name } = req.body
            const { todo_id } = req.params
            const user_id = await getUserId(req)

            const conn = await pool.connect()
            const sql = 'UPDATE todo SET name = ($1), updated_at=now() WHERE todo_id =($2) AND user_id = ($3) RETURNING *;'
            const result = await conn.query(sql, [name, todo_id, user_id])
            console.log(result);
            const rows = result.rows[0]

            if(!rows) reject("Todo Item not found")

            conn.release()

            console.log(rows)

            resolve(rows);
               

        } catch (error) {
            reject(error)
        }
    })
}

const deleteATodo = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { todo_id } = req.params
            const user_id = await getUserId(req)

            const conn = await pool.connect()
            const sql = 'DELETE FROM todo WHERE todo_id = ($1) AND user_id = ($2) RETURNING *;'
            const result = await conn.query(sql, [todo_id, user_id])
            const rows = result.rows
            console.log(rows);

            if(!rows) reject("Todo Item not found")

            conn.release()

            console.log(rows)

            resolve(rows);
               

        } catch (error) {
            reject(error)
        }
    })
}



module.exports = { createTodo, getAllTodo, getATodo, editATodo, deleteATodo }