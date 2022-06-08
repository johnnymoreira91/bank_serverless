const {
  Prisma,
  PrismaClient
} = require('@prisma/client')
const prisma = new PrismaClient()

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
    const createBank = await prisma.account.create({
      data: {
        typeAccount: body.typeAccount,
        active: body.active,
        agency_number: body.agency_number,
        account_number: body.agency_number + new Date().getTime() + 1,
        user_id: body.user_id
      }
    })

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
            agency_number: true
          }
        }
      })
    }
  }
}
