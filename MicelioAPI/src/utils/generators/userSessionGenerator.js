const { sign, verify } = require('jsonwebtoken')

const generateUserSession = (userId) => {
  return sign({}, process.env.JWT_SECRET, {   // ✅ FIXED
    expiresIn: '1d',
    subject: userId
  })
}

const decodeUserSession = (token) => {
  return verify(token, process.env.JWT_SECRET) // ✅ FIXED
}

module.exports = {
  generateUserSession,
  decodeUserSession
}
