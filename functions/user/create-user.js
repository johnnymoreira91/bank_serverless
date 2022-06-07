const {
  Prisma,
  PrismaClient
} = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcryptjs')

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
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(body.password, salt)
    const createdUser = await prisma.user.create({
      data: {
        superUser: body.superUser,
        password: hash,
        name: body.name,
        email: body.email,
        cpf: body.cpf,
        rg: body.rg,
        sexo: body.sexo,
        permissionLevel: body.permissionLevel
      }
    })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createdUser)
    }
  } catch (e) {
    // if (e instanceof Prisma.PrismaClientRequestError) {
    //   if (e.code === 'P2002') {
    //     return {
    //       statusCode: 409,
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({
    //         error: 'A user with this email already exists'
    //       })
    //     }
    //   }
    // }

    console.error(e)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: {
          requiredFields: {
            name: true,
            email: true,
            password: true,
            rg: true,
            cpf: true
          }
        }
      })
    }
  }
}
