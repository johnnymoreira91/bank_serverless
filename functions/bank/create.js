const {
  Prisma,
  PrismaClient
} = require('@prisma/client')
const prisma = new PrismaClient()
const authorizer = require('../authorization')

/**
 * @function
 * @type {import('aws-lambda').APIGatewayEvent}
 */
exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  try {
    /**
      * @type {{
      *  active: boolean
      *  BankName: string,
      *  bankBranchId: string,
      *  agencyId: number
      * }}
    */

    const data = JSON.parse(event.body)
    const permission = await authorizer(event, 2)
    if (permission === false) {
      return {
        statusCode: 403,
        body: JSON.stringify('User doenst have permission')
      }
    }
    const createBank = await prisma.bankBranch.create({ data })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createBank)
    }
  } catch (e) {
    console.error(e)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: {
          requiredFields: {
            agencyId: true
          }
        }
      })
    }
  }
}
