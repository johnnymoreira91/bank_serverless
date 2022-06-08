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
    const permission = await authorizer(event, 2)
    if (permission === false) {
      return {
        statusCode: 403,
        body: JSON.stringify('User doenst have permission')
      }
    }
    const client = await cache.get(`listBank:${id}`)
    if (!client) {
      const bank = await prisma.bankBranch.findFirst({
        where: { agencyId: id }
      })
      await cache.set(`listBank:${id}`, JSON.stringify(bank), {
        EX: 30
      })
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bank)
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
