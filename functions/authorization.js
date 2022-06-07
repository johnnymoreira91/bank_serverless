const jwt = require('jsonwebtoken')

module.exports = function authorizer(event, permissionLevel) {
    const token = event.headers.Authorization.replace('Bearer ', '')
    console.log(token)
    const decoded = jwt.verify(token, process.env.SECRET);
    const user = decoded;
  
    if (user.superUser === true) {
      return true
    }
  
    if (user.permissionLevel < permissionLevel) {
      return false
    }
  }