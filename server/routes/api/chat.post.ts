import { GoogleGenerativeAI } from '@google/generative-ai'

export default defineEventHandler(async (event) => {
  const { prompt } = await readBody(event)
  const config = useRuntimeConfig()
  const genAI = new GoogleGenerativeAI(config.geminiApiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  try {
    const result = await model.generateContent(prompt)
    return { response: result.response.text() }
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: 'AI Generation Failed' })
  }
})
