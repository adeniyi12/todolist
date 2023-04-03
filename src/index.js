const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const users = require('./routes/users')
const todoRoute = require('./routes/todo')
const taskRoute = require('./routes/task')
const authToken = require('./middlewares/auth')


//configure dotenv

dotenv.config()

const port = process.env.PORT || process.env.port

const app = express()

//configure body parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

//configure cors
app.use(cors({ origin: /http:\/\/localhost/ }))
app.options('*', cors())

//route config

app.get('/', (req, res)=>{
    res.send("Todo App is Up")
})

app.use('/users', users)
app.use('/todo', authToken, todoRoute)
app.use('/task', authToken, taskRoute)

app.listen(port, ()=>{
    console.log(`server up at http://localhost:${port}/`)
})