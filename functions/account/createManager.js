const {
  Prisma,
  PrismaClient
} = require('@prisma/client')
const prisma = new PrismaClient()
const authorization = require('../authorization')

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
      *  accountId: string,
      *  user_id: number,
      *  typeAccount: string,
      *  agency_number: number,
      *  account_number: number,
      *  limit_acount_money: float,
      *  account_money: float
      * }}
    */

    const body = JSON.parse(event.body)

    const permission = await authorization(event, 2)
    if (permission === false) {
      return {
        statusCode: 403,
        body: JSON.stringify('User doenst have permission')
      }
    }

    const account = await prisma.account.create({
      data: {
        typeAccount: body.typeAccount,
        account_money: body.account_money,
        limit_acount_money: body.limit_acount_money,
        active: body.active,
        agency_number: body.agency_number,
        account_number: body.agencyId + new Date().getTime() + 1
      }
    })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account)
    }
  } catch (e) {
    console.error(e)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: true
      })
    }
  }
}
