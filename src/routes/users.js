const express = require('express')
const users = express.Router()
const pool = require('../db')
const jwt = require('jsonwebtoken')
const { createUser, getAllUsers } = require('../services/userservices')
const { validateUserData, authenticateUserLogin } = require('../validators/uservalidation')
const authToken = require('../middlewares/auth')

//get all users
users.get('/', authToken, async (req, res) => {
    try {
        const users = await getAllUsers()
        res.json(users)

    } catch (error) {
        console.log("Error retrieving users:", error);
        res.status(500).send({ error });
    }
})

//add a user(signup)
users.post('/', async (req, res) => {
    try {
        let result = await createUser(req)
        res.status(201).json(result)
    } catch (error) {
        console.log("Error validating user data:", error);
        res.status(404).send({ error });
    }
})

users.post('/login', async (req, res) => {
    try {
        let result = await authenticateUserLogin(req)
        let token = jwt.sign({ user_id: result }, process.env.TOKEN_SECRET, {expiresIn : 3600})
        res.status(200).send({ result, token })
    } catch (error) {
        console.log("Login Error:", error)
        res.status(401).send({ error });
    }
})

module.exports = users