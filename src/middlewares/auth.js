const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config()

const authToken = (req, res, next) => {
  try {
      const authorizationHeader = req.headers.authorization

      jwt.verify(authorizationHeader, process.env.TOKEN_SECRET)

      next();

  } catch (err) {
      res.status(401).json(err)
  }
};

module.exports = authToken