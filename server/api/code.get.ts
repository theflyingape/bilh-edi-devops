import { createError, eventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
    console.log('code', event)
    setResponseStatus(event, 200, 'code')
    throw createError({
      statusCode: 401,
      message: 'code error'
    })
})
