const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const authorizer = require('../authorization')
const cache = require('../cache')

/**
 * @function
 * @type {import('aws-lambda').APIGatewayEvent}
 */
exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  const id = event.pathParameters.id
  try {
    // await cache.connect()
    const permission = await authorizer(event, 0)
    if (permission === false) {
      return {
        statusCode: 403,
        body: JSON.stringify('User doenst have permission')
      }
    }
    const client = await cache.get(`user:${id}`)
    if (!client) {
      const users = await prisma.user.findFirst({
          where: {userId: id},
          include: {
              Account: true,
              CreditCard: true
          }
      })
      await cache.set(`user:${id}`, JSON.stringify(users), {
        EX: 30
      })
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(users)
      }
    }
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(JSON.parse(client))
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
