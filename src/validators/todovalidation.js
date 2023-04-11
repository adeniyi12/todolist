const jwt = require('jsonwebtoken')

//This function validates field to be parsed into the todo table
const validatetodoData = (req) => {
    return new Promise((resolve, reject) => {
        try {
            const name = req.body.name
            const tags = req.body.tags

            const validKey = ["name", "tags"]

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

//This Function decoded the token generated for the user to get the user ID
const getUserId = (req) => {

    return new Promise((resolve, reject) => {
        try {
            const jwtToken = req.headers.authorization
            const decodedToken = jwt.decode(jwtToken)

            const user_id = parseInt(decodedToken.user_id)
            
            resolve(user_id)

        } catch (error) {
            reject("This is my error")
        }

    })
}

module.exports = { validatetodoData, getUserId }