import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check API key first
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set in environment variables');
    return res.status(500).json({
      error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env.local file.',
    });
  }

  // Initialize OpenAI client inside handler to ensure env vars are loaded
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Enhanced system prompt with real estate knowledge
    const systemPrompt: ChatMessage = {
      role: 'system',
      content: `You are HIGHLAND's real estate and interior design assistant. You help users with:
- Property inquiries (apartments, villas, houses)
- Interior design questions (bedroom, living room, kitchen, bathroom design)
- Real estate market information and pricing
- Property recommendations
- Design advice and tips

IMPORTANT GUIDELINES:
- When asked about property prices, provide helpful general market information based on location, size, and property type
- For Seoul/Gangnam area: Mention that premium areas like Gangnam typically range from $5,000-15,000 per square meter depending on property type and condition
- For 2-bedroom apartments (10 pyeong ≈ 33 sqm): Provide general price ranges based on location and condition
- Always be helpful and provide useful information even if you don't have exact current prices
- If you don't have specific data, provide general market insights and suggest users browse our property listings for current prices
- Be friendly, professional, and concise
- Never say "I don't have this information" - instead provide helpful general guidance`,
    };

    // Limit conversation history to last 8 messages (4 exchanges) to save tokens
    // Keep system prompt + recent messages only
    const recentMessages = messages.slice(-8);
    const conversationMessages: ChatMessage[] = [systemPrompt, ...recentMessages];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: conversationMessages,
      temperature: 0.7,
      max_tokens: 350, // Increased slightly for better detailed responses about pricing
    });

    const aiResponse =
      completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return res.status(200).json({ message: aiResponse });
  } catch (error: any) {
    console.error('OpenAI API error:', error);

    // Handle specific OpenAI API errors
    if (error.status === 429) {
      if (error.code === 'insufficient_quota') {
        return res.status(429).json({
          error: 'API quota exceeded',
          message:
            'Your OpenAI API account has insufficient quota. Please check your billing and add credits to your account.',
          userMessage:
            'Sorry, the AI service is temporarily unavailable due to account limits. Please try again later or contact support.',
        });
      } else {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          userMessage: 'Too many requests. Please wait a moment and try again.',
        });
      }
    }

    if (error.status === 401) {
      return res.status(401).json({
        error: 'Invalid API key',
        message: 'OpenAI API key is invalid or expired.',
        userMessage: 'AI service configuration error. Please contact support.',
      });
    }

    if (error.status === 500 || error.status === 503) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'OpenAI service is temporarily unavailable.',
        userMessage: 'AI service is temporarily unavailable. Please try again later.',
      });
    }

    // Generic error response
    return res.status(500).json({
      error: 'Failed to get AI response',
      message: error.message || 'Unknown error occurred',
      userMessage: 'Sorry, I encountered an error processing your request. Please try again later.',
    });
  }
}
