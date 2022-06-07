const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/**
 * @function
 * @type {import('aws-lambda').APIGatewayEvent}
 */
exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  /**
  * @type {{
   *  active: boolean
   *  superUser: boolean
   *  userId: string,
   *  name: string,
   *  password: string,
   *  email: string
   *  rg: string
   *  cpf: string
   *  permissionLevel: number
   *  sexo: string
   * }}
 */

  const body = JSON.parse(event.body)
  const id = event.pathParameters.id
  try {
    const user = await prisma.user.findFirst({
      where: { userId: id }
    })
    if (!user) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'User doenst exist'
        })
      }
    }

    const data = await prisma.user.update({
      where: {userId: id},
      data: body
    })
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
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
