import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing env.GEMINI_API_KEY')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function analyzeReceipt(imageBase64: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' })
    
    const prompt = 'Extract the following information from this receipt: date, total amount, and list of items with their prices. Format the response as JSON.'
    
    const result = await model.generateContent([prompt, { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } }])
    const response = await result.response
    const text = response.text()
    
    return JSON.parse(text)
  } catch (error) {
    console.error('Error analyzing receipt:', error)
    throw error
  }
} 