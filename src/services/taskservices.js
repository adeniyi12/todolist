const pool = require('../db')
const jwt = require('jsonwebtoken')
const { getUserId } = require('../validators/todovalidation')
const { validatetaskData } = require('../validators/taskvalidation')

const createTask = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            await validatetaskData(req)
            const { todo_id } = req.params
            const user_id = await getUserId(req)
            const conn = await pool.connect()
            const sql = `INSERT INTO Task(name, todo_id, user_id)
                    VALUES ($1, $2, $3)
                    RETURNING *;`;

            const values = [req.body.name, todo_id, user_id];
            const result = await conn.query(sql, values)
            console.log(result)
            conn.release()
            resolve(result.rows[0])

        } catch (error) {
            reject(error)
        }
    })

}


const getAllTask = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { todo_id } = req.params
            const user_id = await getUserId(req)
            //const user_id = 3
            const conn = await pool.connect()
            const sql = 'SELECT * from Task where todo_id = ($1) AND user_id = ($2);'
            const result = await conn.query(sql, [todo_id, user_id])
            const rows = result.rows
            //console.log(rows)
            conn.release()

            resolve(rows)

        } catch (error) {
            reject(error)
        }
    })
}


const getATask = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user_id = await getUserId(req)
            const conn = await pool.connect()
            const sql = 'SELECT * from Task where todo_id = ($1) and task_id = ($2) and user_id = ($3);'
            const result = await conn.query(sql, [req.params.todo_id, req.params.task_id, user_id])
            const rows = result.rows[0]
            //console.log(rows)
            conn.release()

            resolve(rows)

        } catch (error) {
            reject(error)
        }
    })
}


const editATask = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            await validatetaskData(req)

            const { name } = req.body
            const user_id = await getUserId(req)

            const conn = await pool.connect()
            const sql = 'UPDATE Task SET name = ($1), updated_at=now() WHERE todo_id =($2) AND task_id =($3) AND user_id = ($4) RETURNING *;'
            const result = await conn.query(sql, [name, req.params.todo_id, req.params.task_id, user_id])
            console.log(result);
            const rows = result.rows[0]

            if(!rows) reject("Task Item not found")

            conn.release()

            console.log(rows)

            resolve(rows);
               

        } catch (error) {
            reject(error)
        }
    })
}

const deleteATask = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user_id = await getUserId(req)

            const conn = await pool.connect()
            const sql = 'DELETE FROM Task WHERE todo_id = ($1) AND task_id = ($2) AND user_id = ($3) RETURNING *;'
            const result = await conn.query(sql, [req.params.todo_id, req.params.task_id, user_id])
            const rows = result.rows
            console.log(rows);

            if(!rows) reject("Task Item not found")

            conn.release()

            console.log(rows)

            resolve(rows);
               

        } catch (error) {
            reject(error)
        }
    })
}

module.exports = { createTask, getAllTask, getATask, editATask, deleteATask }