const express = require('express')
const users = express.Router()
const pool = require('../db')
const { createUser, getAllUsers } = require('../services/userservices')


//get all users
users.get('/', async (req, res) => {
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
        let result = await createUser(req) //this function will throw an error if a reject object is received so the catch block catches it
        res.status(201).json(result)
    } catch (error) {
        console.log("Error validating user data:", error);
        res.status(404).send({ error });;
    }
})

module.exports = users