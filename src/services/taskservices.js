const pool = require('../db')
const jwt = require('jsonwebtoken')
const { getUserId } = require('../validators/todovalidation')
const { validatetaskData } = require('../validators/taskvalidation')

const createTask = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            await validatetaskData(req)

            const { name, checked } = req.body

            if (!name.trim()) {
                reject("Name can not be blank")
            } else {
                const { todo_id } = req.params
                const user_id = await getUserId(req)
                const conn = await pool.connect()
                const sql = `INSERT INTO Task(name, todo_id, user_id, checked)
                    VALUES ($1, $2, $3, $4)
                    RETURNING *;`;

                const values = [name.trim(), todo_id, user_id, checked || false];
                const result = await conn.query(sql, values)
                console.log(result)
                conn.release()
                resolve(result.rows[0])
            }

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
            // const { name, checked } = await validatetaskData(req)
            const { name, checked } = req.body
            
            const user_id = await getUserId(req)

            let validatedName = null
            if (!name) {
                validatedName = null
            } else if (name.trim() === "") {
                validatedName = null
            } else {
                validatedName = name.trim()
            }

            const conn = await pool.connect()
            const sql = 'UPDATE Task SET name = COALESCE($1, name), checked = COALESCE($2, checked), updated_at=now() WHERE todo_id =($3) AND task_id =($4) AND user_id = ($5) RETURNING *;'
            const result = await conn.query(sql, [validatedName, checked, req.params.todo_id, req.params.task_id, user_id])
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

            resolve(rows);
               

        } catch (error) {
            reject(error)
        }
    })
}

const searchATask = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { name } = req.query
            const user_id = await getUserId(req)

            if (!name) {
                reject("Name can not be blank")
            }

            const conn = await pool.connect()
            const sql = 'SELECT * FROM Task WHERE name LIKE ($1) AND user_id = ($2)'
            const result = await conn.query(sql, [`%${name}%`, user_id])
            const rows = result.rows
            console.log(rows);

            if(!rows) reject("Item not found")

            conn.release()

            resolve(rows)

        } catch (error) {
            reject(error)
        }
    })
}

module.exports = { createTask, getAllTask, getATask, editATask, deleteATask, searchATask }