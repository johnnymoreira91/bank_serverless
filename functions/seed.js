const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/**
 * @function
 * @type {import('aws-lambda').APIGatewayEvent}
 */
exports.handler = async (event, context, callback) => {
  try {
    await Promise.all([prisma.permission.deleteMany(), prisma.bankBranch.deleteMany()])
    await prisma.user.deleteMany()

    const seed = await prisma.permission.createMany({
      data: [
        {
          permissionLevel: 0,
          permissionName: 'user'
        },
        {
          permissionLevel: 1,
          permissionName: 'func1'
        },
        {
          permissionLevel: 2,
          permissionName: 'manager'
        },
        {
          permissionLevel: 3,
          permissionName: 'ceo'
        },
        {
          permissionLevel: 5,
          permissionName: 'PO'
        },
        {
          permissionLevel: 6,
          permissionName: 'dev'
        },
      ]
    })

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([seed]),
    }
  } catch (error) {
    console.error(error)
    return { statusCode: 500 }
  }
}
