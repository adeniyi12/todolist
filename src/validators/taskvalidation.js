const jwt = require('jsonwebtoken')

const validatetaskData = (req) => {
    return new Promise((resolve, reject) => {
        try {
            const name = req.body.name
            const checked = req.body.checked
            const position = req.body.position
            const priority = req.body.priority
            const deadline = req.body.deadline

            const validKey = ["name", "checked", "position", "priority", "deadline"]

            for (const key in req.body) {
                if (!validKey.includes(key)) {
                    reject(`'${key}' not expected. Field not allowed in request body`)
                }
            }

            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}

  


module.exports = { validatetaskData }