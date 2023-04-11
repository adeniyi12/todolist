//import all required modules
const pool = require('../db')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const moment = require('moment')
const { getUserId } = require('../validators/todovalidation')
const { validatetaskData } = require('../validators/taskvalidation')

//This function allow a logged in user create a task
const createTask = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            await validatetaskData(req) //this validates if the data passed exists among the required data

            const { name, checked, priority, deadline } = req.body

            //This function checks if the priority value passed is valid or sets a default priority level of medium for the task created
            let newPriority = "Medium";
            if (priority !== undefined) {
                newPriority = priority.trim().charAt(0).toUpperCase() + priority.trim().slice(1);
                if (newPriority !== "Low" && newPriority !== "Medium" && newPriority !== "High") {
                    reject("Priority must either be Low, Medium or High");
                }
            }     

            // This control flow checks if the user passes the right datatype for if the task is completed or not
            if (typeof checked !== "boolean" && checked !== undefined) {
                reject("completed must be true/false")
            }

            //This control flow only accepts date of the format type YYYY-MM-DD
            if (deadline !== undefined) {
                if (!(moment(deadline, 'YYYY-MM-DD', true).isValid())) {
                    reject('Enter Date format in YYYY-MM-DD');
                }
            }

            //This control flow ensures the user gives the created task a name or throw an error
            if (!name.trim()) {
                reject("Name can not be blank")
            } else {
                const { todo_id } = req.params
                const user_id = await getUserId(req) //this function decodes the user token to get the user id
                const conn = await pool.connect()
                const sql = `INSERT INTO Task(name, todo_id, user_id, checked, priority, deadline)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING *;`;

                const values = [name.trim(), todo_id, user_id, checked || false, newPriority, deadline || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)];
                const result = await conn.query(sql, values)
                
                conn.release()
                resolve(result.rows[0])
            }

        } catch (error) {
            reject(error)
        }
    })

}

//This Function gets all task created by a particular user
const getAllTask = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { todo_id } = req.params
            const user_id = await getUserId(req)
            
            const conn = await pool.connect() //connects to the database and perform the required query to get all task created by a user
            const sql = 'SELECT * from Task where todo_id = ($1) AND user_id = ($2);'
            const result = await conn.query(sql, [todo_id, user_id])
            const rows = result.rows
            
            conn.release() //releases the database

            resolve(rows)

        } catch (error) {
            reject(error) //throws an error if function fails
        }
    })
}

//This Function gets a particular task for a user
const getATask = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user_id = await getUserId(req)
            const conn = await pool.connect()
            const sql = 'SELECT * from Task where todo_id = ($1) and task_id = ($2) and user_id = ($3);'
            const result = await conn.query(sql, [req.params.todo_id, req.params.task_id, user_id])
            const rows = result.rows[0]
            
            conn.release()

            resolve(rows)

        } catch (error) {
            reject(error)
        }
    })
}

//This Function allows user to edit an already existing task
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

            let newDeadline = deadline === undefined ? null : deadline;
            if (newDeadline !== null) {
                if (!(moment(newDeadline, 'YYYY-MM-DD', true).isValid())) {
                    reject('Enter Date format in YYYY-MM-DD');
                }
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
            const result = await conn.query(sql, [validatedName, completed, validatedPriority, newDeadline, req.params.todo_id, req.params.task_id, user_id])
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

//This Function allows user to delete a particular task
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

//This Function allows a user to search across all task created 
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

//This Function allows user to reorder a task based on his desired position
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

//This Function allows user upload a single file to a created task
const uploadAFile = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user_id = await getUserId(req)

            const conn = await pool.connect()

            const fileUpload = fs.readFileSync(req.file.path)

            const sql = 'UPDATE Task SET document = ($1), updated_at = NOW() WHERE task_id = ($2) AND todo_id = ($3) AND user_id = ($4)'
            const result = await conn.query(sql, [fileUpload, req.params.task_id, req.params.todo_id, user_id])

            conn.release()

            resolve("File Uploaded Successfully")
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = { createTask, getAllTask, getATask, editATask, deleteATask, searchATask, reorderATask, uploadAFile }