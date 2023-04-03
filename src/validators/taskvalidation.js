const jwt = require('jsonwebtoken')

const validatetaskData = (req) => {
    return new Promise((resolve, reject) => {
        try {
            const name = req.body.name

            const validKey = ["name"]

            for (const key in req.body) {
                if (!validKey.includes(key)) {
                    reject(`'${key}' not expected. Field not allowed in request body`);
                }
            }

            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}


module.exports = { validatetaskData }