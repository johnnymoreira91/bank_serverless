const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/**
 * @function
 * @type {import('aws-lambda').APIGatewayEvent}
 */
module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const body = JSON.parse(event.body);
  const { email, password } = body;
  try {
    
    const user = await prisma.user.findFirst({
        where: {email: email}
    })
    if (!user) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'User doenst exist'
        })
      }
    }
    const hash = bcrypt.hashSync(password, user.password);
    if (hash != user.password) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: 'Error user/password'
        })
      }
    }
    const accessToken = jwt.sign(
      { 
        login: user.id,
        superUser: user.superUser,
        permissionLevel: user.permissionLevel
       },
      process.env.SECRET,
      { expiresIn: 86400 },
    );
    console.log(`user: ${user.name}, with id: ${user.id} - LOGIN!!!, Date: ${new Date()}`)
    return ({
      statusCode: 200,
      body: JSON.stringify({
        name: user.name,
        email: user.email,
        permissionLevel: user.permissionLevel,
        accessToken: accessToken,
        logged: new Date()
      })
    })
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          error,
        },
      ),
    };
  }
};