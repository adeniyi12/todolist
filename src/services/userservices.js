const { validateUserData } = require('../validators/uservalidation')
const pool = require('../db')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')

dotenv.config()


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