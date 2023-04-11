const pool = require('../db')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')

dotenv.config()

//This Function checks if the username passed in already exists
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

//This Function Validates user data during sign up
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

//This Function authenticates user before Login
const authenticateUserLogin = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            const username = req.body.username
            const email = req.body.email
            const password = req.body.password

            const validKeys = ["username", "password", "email"]

            for (const key in req.body) {
                if (!validKeys.includes(key)) {
                    reject(`'${key}' not allowed in request body`);
                }
            }

            const conn = await pool.connect()
            const sql = 'SELECT user_id, password from users where username = ($1) or email = ($2);'
            const result = await conn.query(sql, [username, email])
            const rows = result.rows
            conn.release()

            if (rows.length) {

                if (bcrypt.compareSync(password + process.env.BCRYPT_PASSWORD, rows[0].password)) {

                    resolve(`${rows[0].user_id}`)
                }
                else {
                    reject("Username and/or password do not match")
                }
            }
            else {
                reject("Invalid User")
            }



        } catch (error) {
            reject(error)
        }
    })
}

module.exports = { validateUserData, authenticateUserLogin }