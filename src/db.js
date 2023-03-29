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

module.exports = pool