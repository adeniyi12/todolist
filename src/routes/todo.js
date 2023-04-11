//import all required modules
const express = require('express')
const todoRoute = express.Router()
const jwt = require('jsonwebtoken')
const { createTodo, getAllTodo, getATodo, editATodo, deleteATodo } = require('../services/todoservices')


//create a new todo for the logged in user
todoRoute.post('/create', async (req, res) => {
    try {
        let result = await createTodo(req)
        res.status(201).json(result)
        console.log(result)
    } catch (error) {
        res.status(500).send({ error });

    }
})

//get all todo's for logged in user
todoRoute.get('/all', async (req, res) => {
    try {
        let result = await getAllTodo(req)
        res.status(201).json(result)
        console.log(result)
    } catch (error) {
        res.status(500).send({ error })
    }
})

//get a particular todo for a logged in user
todoRoute.get('/:todo_id', async (req, res) => {
    try {
        let result = await getATodo(req)
        if (result) {
            res.status(201).json(result)
        } else {
            res.status(404).json({ "error": "Item doesn't exist" })
        }
    } catch (error) {
        res.status(500).json({ error })
    }
})

//edit a todo name
todoRoute.patch('/:todo_id', async (req, res) => {
    try {
        const result = await editATodo(req)
        console.log(result);
        res.status(200).json(result)
    } catch (error) {
        res.status(500).send({ error });

    }
})

//delete a todo name
todoRoute.delete('/:todo_id', async (req, res) => {
    try {
        const result = await deleteATodo(req)
        console.log(result);
        res.status(200).json(result)
    } catch (error) {
        res.status(500).send({ error });

    }
})


module.exports = todoRoute