const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const authorizer = require('../authorization')

/**
 * @function
 * @type {import('aws-lambda').APIGatewayEvent}
 */
exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  try {
    const permission = await authorizer(event, 0)
    console.log(permission)
    if (permission === false) {
      return {
        statusCode: 403,
        body: JSON.stringify('User doenst have permission')
      }
    }
    const users = await prisma.user.findMany()
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(users)
    }
  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error)
    }
  }
}
