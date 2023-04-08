const pool = require('../db')
const jwt = require('jsonwebtoken')
const { getUserId } = require('../validators/todovalidation')
const { validatetaskData } = require('../validators/taskvalidation')

const createTask = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            await validatetaskData(req)

            const { name, checked, priority, deadline } = req.body

            let newPriority = "Medium";
            if (priority !== undefined) {
                newPriority = priority.trim().charAt(0).toUpperCase() + priority.trim().slice(1);
                if (newPriority !== "Low" && newPriority !== "Medium" && newPriority !== "High") {
                    reject("Priority must either be Low, Medium or High");
                }
            }     

            if (typeof checked !== "boolean" && checked !== undefined) {
                reject("completed must be true/false")
            }

            // if (!isValidDate(deadline)) {
            //     reject("Enter valid date with format YYYY-MM-DD")
            // }

            if (!name.trim()) {
                reject("Name can not be blank")
            } else {
                const { todo_id } = req.params
                const user_id = await getUserId(req)
                const conn = await pool.connect()
                const sql = `INSERT INTO Task(name, todo_id, user_id, checked, priority, deadline)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING *;`;

                const values = [name.trim(), todo_id, user_id, checked || false, newPriority, deadline || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)];
                const result = await conn.query(sql, values)
                //console.log(result)
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
        
            const { name, checked, priority, deadline } = req.body
            
            const user_id = await getUserId(req)

            let newPriority;
            if (priority) {
                newPriority = priority.trim().charAt(0).toUpperCase() + priority.trim().slice(1);
            } else {
                newPriority = null;
            }

            let validatedName = null
            if (!name) {
                validatedName = null
            } else if (name.trim() === "") {
                validatedName = null
            } else {
                validatedName = name.trim()
            }

            let completed = checked === undefined ? null : checked;
            if (completed !== null && typeof completed !== "boolean") {
                reject("value must either be true of false");
            }

            let validatedPriority = null
            if (!priority) {
                validatedPriority = null
            } else if (newPriority !== "Low" && newPriority !== "Medium" && newPriority !== "High") {
                reject("Priority must either be Low, Medium or High")
            } else {
                validatedPriority = newPriority
            }
            

            const conn = await pool.connect()
            const sql = 'UPDATE Task SET name = COALESCE($1, name), checked = COALESCE($2, checked), priority = COALESCE($3, priority), deadline = COALESCE($4, deadline), updated_at=now() WHERE todo_id =($5) AND task_id =($6) AND user_id = ($7) RETURNING *;'
            const result = await conn.query(sql, [validatedName, completed, validatedPriority, deadline, req.params.todo_id, req.params.task_id, user_id])
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
            const sql = 'SELECT * FROM Task WHERE name ILIKE ($1) AND user_id = ($2)'
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

const reorderATask = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { todo_id, task_id } = req.params
            const user_id = await getUserId(req)
            const { position } = req.body
            

            await validatetaskData(req)

            if (typeof(position) !== 'number') {
                reject("Only numerical digits are allowed")
            }

            const conn = await pool.connect()
            const sql = 'SELECT * FROM Task WHERE user_id = ($1) AND todo_id = ($2) AND task_id = ($3);'
            const result = await conn.query(sql, [user_id, todo_id, task_id])
            const rows = result.rows[0]
            

            if (!rows) { reject("Item not found") }

            const countSql = 'SELECT count(task_id) from task where todo_id = ($1);'
            const countResult = await conn.query(countSql, [todo_id])
            const count = parseInt(countResult.rows[0].count)
            

            if (position > count) reject("Out of Bounds")

            const taskSql = 'SELECT * FROM task where todo_id = ($1);'
            const taskResult = await conn.query(taskSql, [todo_id])
            const task = taskResult.rows
            

            task.forEach((item, index) => {
                console.log(`Index of ${item.name}: ${index}`);
                });


            const taskIndex = task.findIndex(t => t.task_id === parseInt(task_id))
            console.log(taskIndex)
            const removedTask = task.splice(taskIndex, 1)[0];

            task.splice(position-1, 0, removedTask);
        
            task.forEach((item, index) => {
                console.log(`Index of ${item.name}: ${index}`);
                });

            conn.release();

            resolve(task)

        } catch (error) {
            reject("You dan write bants")
        }
    })
}

module.exports = { createTask, getAllTask, getATask, editATask, deleteATask, searchATask, reorderATask }