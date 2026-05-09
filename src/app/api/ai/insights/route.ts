export const runtime = 'nodejs'
import ZAI from 'z-ai-web-dev-sdk'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful executive assistant for an entrepreneur managing multiple ventures. Be concise, actionable, and insightful. Provide structured bullet points when appropriate. Keep responses under 200 words.' },
        { role: 'user', content: prompt }
      ],
    })
    return NextResponse.json({ insight: completion.choices[0]?.message?.content || 'No insight generated' })
  } catch {
    return NextResponse.json({ insight: 'Unable to generate AI insight at this time.' }, { status: 500 })
  }
}
