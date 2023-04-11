//import all required module needed
const express = require('express')
const taskRoute = express.Router()
const jwt = require('jsonwebtoken')
const multer = require('multer')
const { createTask, getAllTask, getATask, editATask, deleteATask, searchATask, reorderATask, uploadAFile } = require('../services/taskservices')

//create a new task in todo for the logged in user
taskRoute.post('/:todo_id/create', async (req, res) => {
    try {
        let result = await createTask(req)
        res.status(201).json(result)
        console.log(result)
    } catch (error) {
        res.status(500).send({ error });

    }
})

//get all task in todo for logged in user
taskRoute.get('/:todo_id/all', async (req, res) => {
    try {
        let result = await getAllTask(req)
        res.status(201).json(result)
        console.log(result)
    } catch (error) {
        res.status(500).send({ error })
    }
})

//get a task in todo for logged in user
taskRoute.get('/:todo_id/tasks/:task_id', async (req, res) => {
    try {
        let result = await getATask(req)
        if (result) {
            res.status(201).json(result)
        } else {
            res.status(404).json({ "error": "Item doesn't exist" })
        }
    } catch (error) {
        res.status(500).json({ error })
    }
})

//edit a task in todo for logged in user
taskRoute.patch('/:todo_id/tasks/:task_id', async (req, res) => {
    try {
        const result = await editATask(req)
        console.log(result);
        res.status(200).json(result)
    } catch (error) {
        res.status(500).send({ error });

    }
})

//delete a task in todo for logged in user
taskRoute.delete('/:todo_id/tasks/:task_id', async (req, res) => {
    try {
        const result = await deleteATask(req)
        console.log(result);
        res.status(200).json(result)
    } catch (error) {
        res.status(500).send({ error });

    }
})

//search for task across all todos owned by a user
taskRoute.get('/search', async (req, res) => {
    try {
        const result = await searchATask(req)
        res.json(result)

    } catch (error) {
        res.status(500).send({ error });
    }
})

//reorder task across a todo owned by a user
taskRoute.get('/:todo_id/reorder/:task_id', async (req, res) => {
    try {
        const result = await reorderATask(req)
        res.json(result)

    } catch (error) {
        res.status(500).send({ error });
    }
})

//upload file for a task across a todos owned by a user

const upload = multer({ dest: 'uploads/' });

taskRoute.patch('/:todo_id/upload/:task_id', upload.single('file'), async (req, res) => {
    try {
        const result = await uploadAFile(req)
        res.json(result)

    } catch (error) {
        res.status(500).send({ error });
    }
})

module.exports = taskRoute