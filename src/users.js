const express = require('express')
const users = express.Router()

const { Pool } = require('pg')

const pool = new Pool(
    {
        user: "postgres",
        password: "tesla12345",
        host: "localhost",
        port: 5432,
        database: "todo"
    }
)

users.get('/', async (req, res) => {
    try {
        const conn = await pool.connect()
        const sql = 'SELECT * from users;'
        const result = await conn.query(sql)
        const rows = result.rows
        conn.release()

        res.json(rows)

    } catch (error) {
        console.log("Error retrieving users:", error);
        res.status(500).send("Error retrieving users");
    }
})

module.exports = users