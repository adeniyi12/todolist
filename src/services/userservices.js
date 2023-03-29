const users = require('../routes/users')
const pool = require('../db')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')

dotenv.config()



const checkDuplicateUsername = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            const username = req.body.username

            const conn = await pool.connect()
            const sql = 'SELECT username from users;'
            const result = await conn.query(sql)
            const rows = result.rows
            conn.release()

            const check = rows.find((user) => {
                return user.username.trim() === username.trim()
            })

            resolve(check)

        } catch (error) {
            reject(error)
        }
    })


}

const validateUserData = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            const username = req.body.username
            const lastname = req.body.lastname
            const firstname = req.body.firstname
            const email = req.body.email
            const password = req.body.password
            
            const requiredKeys = ["username", "password", "firstname", "lastname", "email"]

            for (const key in req.body) {
                if (!requiredKeys.includes(key)) {
                    reject(`'${key}' not expected. Field not allowed in request body`);
                }
            }
            
            if (username.trim() === "" || password.trim() === "" || firstname.trim() === "" || lastname.trim() === "" || email.trim() === "") {
                reject("Username, password, firstname, lastname and email are required")
            }
            else if (await checkDuplicateUsername(req)) {
                reject("Username already exists")
            }
            else {
                resolve(true)
            }

        } catch (error) {
            reject(error)
        }
    })
}



const createUser = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            let validated = await validateUserData(req)
            const conn = await pool.connect()
            const sql = `INSERT INTO users(
                    username, password, firstname, lastname, email)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING *;`;

            const hash = bcrypt.hashSync(
                req.body.password + process.env.BCRYPT_PASSWORD,
                parseInt(process.env.SALT_ROUNDS)
            );

            const values = [req.body.username, hash, req.body.firstname, req.body.lastname, req.body.email];
            const result = await conn.query(sql, values)
            conn.release()
            resolve(result.rows[0])

        } catch (error) {
            reject(error)
        }
    })

}

const getAllUsers = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const conn = await pool.connect()
            const sql = 'SELECT * from users;'
            const result = await conn.query(sql)
            const rows = result.rows
            conn.release()
            resolve(rows)

        } catch (error) {
            reject(error)
        }
    })
}

module.exports = { createUser, getAllUsers }