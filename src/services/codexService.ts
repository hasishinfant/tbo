/**
 * Codex/OpenAI Integration Service
 * 
 * Connects the application to OpenAI's API for AI-powered features:
 * - Itinerary generation
 * - Travel assistant chat
 * - Destination recommendations
 */

import axios from 'axios';

// Configuration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4'; // or 'gpt-3.5-turbo' for faster/cheaper responses

interface CodexRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

interface CodexResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Call OpenAI API with the given prompt
 */
export async function callCodex({
  prompt,
  systemPrompt = 'You are a helpful travel assistant.',
  temperature = 0.7,
  maxTokens = 2000,
}: CodexRequest): Promise<CodexResponse> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
  }

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature,
        max_tokens: maxTokens,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        timeout: 30000, // 30 second timeout
      }
    );

    return {
      content: response.data.choices[0].message.content,
      usage: {
        promptTokens: response.data.usage.prompt_tokens,
        completionTokens: response.data.usage.completion_tokens,
        totalTokens: response.data.usage.total_tokens,
      },
    };
  } catch (error: any) {
    console.error('Codex API Error:', error.response?.data || error.message);
    throw new Error(`Failed to call Codex API: ${error.message}`);
  }
}

/**
 * Generate itinerary using Codex
 */
export async function generateItineraryWithCodex(
  destination: string,
  startDate: Date,
  endDate: Date,
  budget: string,
  interests: string[]
): Promise<string> {
  const tripDuration = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const prompt = `Create a detailed ${tripDuration}-day travel itinerary for ${destination}.

Trip Details:
- Destination: ${destination}
- Start Date: ${startDate.toLocaleDateString()}
- End Date: ${endDate.toLocaleDateString()}
- Budget Level: ${budget}
- Interests: ${interests.join(', ')}

Please provide:
1. Day-by-day itinerary with 2-3 activities per day
2. Recommended restaurants for each budget level
3. Travel tips specific to this destination
4. Estimated costs

Format the response as JSON with this structure:
{
  "days": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "places": [
        {
          "name": "Place name",
          "description": "Description",
          "estimatedTime": "2 hours",
          "category": "culture"
        }
      ],
      "foodRecommendations": [
        {
          "name": "Restaurant name",
          "type": "Cuisine type",
          "description": "Description",
          "priceRange": "$"
        }
      ],
      "travelTips": ["Tip 1", "Tip 2"]
    }
  ],
  "estimatedCost": {
    "min": 1000,
    "max": 1500,
    "currency": "USD"
  }
}`;

  const systemPrompt = `You are an expert travel planner with deep knowledge of destinations worldwide. 
You create personalized, detailed itineraries that match travelers' preferences and budgets. 
Always provide practical, actionable recommendations with specific names and details.
Format your response as valid JSON.`;

  const response = await callCodex({
    prompt,
    systemPrompt,
    temperature: 0.8,
    maxTokens: 3000,
  });

  return response.content;
}

/**
 * Get travel assistant response using Codex
 */
export async function getAssistantResponse(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<string> {
  const systemPrompt = `You are TravelSphere's AI travel assistant. You help travelers with:
- Emergency contacts and safety information
- Translation assistance
- Weather updates and alerts
- Safe zone recommendations
- Route suggestions and directions
- Local tips and recommendations

Be helpful, concise, and provide actionable information. If asked about emergencies, 
prioritize safety and provide specific contact numbers and addresses when possible.`;

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        timeout: 20000,
      }
    );

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('Assistant API Error:', error.response?.data || error.message);
    throw new Error(`Failed to get assistant response: ${error.message}`);
  }
}

/**
 * Get destination recommendations using Codex
 */
export async function getDestinationRecommendations(
  preferences: {
    budget: string;
    interests: string[];
    travelStyle: string;
    climate?: string;
  }
): Promise<string[]> {
  const prompt = `Based on these travel preferences, recommend 5 destinations:

Preferences:
- Budget: ${preferences.budget}
- Interests: ${preferences.interests.join(', ')}
- Travel Style: ${preferences.travelStyle}
${preferences.climate ? `- Preferred Climate: ${preferences.climate}` : ''}

Provide a JSON array of destination names only, like: ["Paris, France", "Tokyo, Japan", ...]`;

  const response = await callCodex({
    prompt,
    systemPrompt: 'You are a travel recommendation expert. Provide diverse, interesting destinations that match the given preferences.',
    temperature: 0.9,
    maxTokens: 500,
  });

  try {
    return JSON.parse(response.content);
  } catch {
    // If JSON parsing fails, extract destinations from text
    const destinations = response.content.match(/"([^"]+)"/g);
    return destinations ? destinations.map(d => d.replace(/"/g, '')) : [];
  }
}

/**
 * Check if Codex is configured and available
 */
export function isCodexAvailable(): boolean {
  return !!OPENAI_API_KEY && OPENAI_API_KEY.length > 0;
}

/**
 * Get configuration status
 */
export function getCodexStatus(): {
  configured: boolean;
  model: string;
  message: string;
} {
  const configured = isCodexAvailable();
  return {
    configured,
    model: MODEL,
    message: configured
      ? 'Codex is configured and ready to use'
      : 'Codex is not configured. Set VITE_OPENAI_API_KEY in your .env file',
  };
}
