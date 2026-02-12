/**
 * AI Travel Assistant Service
 * 
 * Provides trip mode management and assistant capabilities
 * Integrates with Codex when available
 */

import { getAssistantResponse, isCodexAvailable } from '../../services/codexService';

export interface AssistantQuery {
  message: string;
  location?: string;
  context?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface AssistantResponse {
  message: string;
  suggestions?: string[];
  emergencyContacts?: EmergencyContact[];
  translation?: Translation;
  weatherAlert?: WeatherAlert;
  safeZones?: SafeZone[];
}

export interface EmergencyContact {
  type: string;
  number: string;
  description: string;
}

export interface Translation {
  original: string;
  translated: string;
  language: string;
}

export interface WeatherAlert {
  severity: 'low' | 'medium' | 'high';
  message: string;
  validUntil: string;
}

export interface SafeZone {
  name: string;
  address: string;
  distance: string;
  type: string;
}

/**
 * Query the AI assistant - uses Codex if available, otherwise mock responses
 */
export async function queryAssistant(query: AssistantQuery): Promise<AssistantResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if Codex is available
  if (isCodexAvailable()) {
    try {
      console.info('Using Codex AI for assistant response');
      
      const response = await getAssistantResponse(
        query.message,
        query.conversationHistory || []
      );
      
      // Parse the response and extract structured data if present
      return parseAssistantResponse(response, query.message);
    } catch (error) {
      console.warn('Codex assistant failed, using mock response:', error);
      return getMockAssistantResponse(query.message);
    }
  } else {
    // Codex not configured, use mock responses
    console.info('Using mock assistant response (Codex not configured)');
    return getMockAssistantResponse(query.message);
  }
}

/**
 * Parse Codex response into structured format
 */
function parseAssistantResponse(response: string, originalQuery: string): AssistantResponse {
  const lowerQuery = originalQuery.toLowerCase();
  
  // Try to extract structured data based on query type
  const result: AssistantResponse = {
    message: response,
    suggestions: [],
  };
  
  // Extract emergency contacts if mentioned
  if (lowerQuery.includes('emergency') || lowerQuery.includes('help')) {
    result.emergencyContacts = extractEmergencyContacts(response);
  }
  
  // Extract translations if mentioned
  if (lowerQuery.includes('translate')) {
    result.translation = extractTranslation(response, originalQuery);
  }
  
  // Generate contextual suggestions
  result.suggestions = generateSuggestions(lowerQuery);
  
  return result;
}

/**
 * Extract emergency contacts from response
 */
function extractEmergencyContacts(response: string): EmergencyContact[] | undefined {
  const contacts: EmergencyContact[] = [];
  
  // Look for phone numbers and emergency services
  const phoneRegex = /(\d{3}[-.]?\d{3}[-.]?\d{4}|\d{2,3})/g;
  const matches = response.match(phoneRegex);
  
  if (matches) {
    // Common emergency services
    if (response.toLowerCase().includes('police')) {
      contacts.push({
        type: 'Police',
        number: matches[0] || '112',
        description: 'Emergency police services',
      });
    }
    if (response.toLowerCase().includes('ambulance') || response.toLowerCase().includes('medical')) {
      contacts.push({
        type: 'Ambulance',
        number: matches[1] || '112',
        description: 'Medical emergency services',
      });
    }
  }
  
  return contacts.length > 0 ? contacts : undefined;
}

/**
 * Extract translation from response
 */
function extractTranslation(response: string, _query: string): Translation | undefined {
  // Try to find quoted text (original and translated)
  const quotes = response.match(/"([^"]+)"/g);
  
  if (quotes && quotes.length >= 2) {
    return {
      original: quotes[0].replace(/"/g, ''),
      translated: quotes[1].replace(/"/g, ''),
      language: 'Local language',
    };
  }
  
  return undefined;
}

/**
 * Generate contextual suggestions
 */
function generateSuggestions(query: string): string[] {
  if (query.includes('emergency')) {
    return ['Find nearest hospital', 'Contact embassy', 'Report incident'];
  }
  if (query.includes('translate')) {
    return ['Translate another phrase', 'Common phrases', 'Learn basics'];
  }
  if (query.includes('weather')) {
    return ['7-day forecast', 'What to pack', 'Indoor activities'];
  }
  if (query.includes('food') || query.includes('restaurant')) {
    return ['Budget restaurants', 'Local specialties', 'Food markets'];
  }
  
  return ['Emergency contacts', 'Translate phrase', 'Check weather', 'Find restaurants'];
}

/**
 * Mock assistant response (fallback)
 */
function getMockAssistantResponse(message: string): AssistantResponse {
  const lowerMessage = message.toLowerCase();
  
  // Emergency contacts
  if (lowerMessage.includes('emergency') || lowerMessage.includes('help') || lowerMessage.includes('police')) {
    return {
      message: "Here are the emergency contacts for your location:",
      emergencyContacts: [
        { type: 'Police', number: '112', description: 'General emergency services' },
        { type: 'Ambulance', number: '112', description: 'Medical emergencies' },
        { type: 'Fire', number: '112', description: 'Fire emergencies' },
        { type: 'Tourist Police', number: '+33 1 53 71 53 71', description: 'Assistance for tourists' },
      ],
      suggestions: ['Find nearest hospital', 'Contact embassy', 'Report lost passport'],
    };
  }
  
  // Translation
  if (lowerMessage.includes('translate') || lowerMessage.includes('say')) {
    const phrase = lowerMessage.includes('bathroom') ? 'Where is the bathroom?' : 'Hello, how are you?';
    return {
      message: "Here's the translation:",
      translation: {
        original: phrase,
        translated: phrase === 'Where is the bathroom?' ? 'Où sont les toilettes?' : 'Bonjour, comment allez-vous?',
        language: 'French',
      },
      suggestions: ['Translate another phrase', 'Common phrases', 'Learn basic greetings'],
    };
  }
  
  // Weather alerts
  if (lowerMessage.includes('weather')) {
    return {
      message: "Current weather conditions and alerts:",
      weatherAlert: {
        severity: 'low',
        message: 'Partly cloudy with a chance of rain in the evening. Temperature: 18°C',
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      suggestions: ['7-day forecast', 'What to wear', 'Indoor activities'],
    };
  }
  
  // Safe zones
  if (lowerMessage.includes('safe') || lowerMessage.includes('zone') || lowerMessage.includes('area')) {
    return {
      message: "Here are safe zones near your location:",
      safeZones: [
        { name: 'City Hall', address: '123 Main Street', distance: '0.5 km', type: 'Government Building' },
        { name: 'Central Police Station', address: '456 Police Ave', distance: '0.8 km', type: 'Police Station' },
        { name: 'Tourist Information Center', address: '789 Tourist Blvd', distance: '1.2 km', type: 'Tourist Service' },
      ],
      suggestions: ['Get directions', 'Find nearest embassy', 'Safety tips'],
    };
  }
  
  // Route suggestions
  if (lowerMessage.includes('route') || lowerMessage.includes('direction') || lowerMessage.includes('how to get')) {
    return {
      message: "I can help you with directions! The best way to get around is using the metro system. Would you like specific directions to a destination?",
      suggestions: ['Metro map', 'Walking routes', 'Taxi services', 'Bike rentals'],
    };
  }
  
  // Default response
  return {
    message: "I'm here to help you during your trip! I can assist with emergency contacts, translations, weather alerts, safe zones, and route suggestions. What do you need help with?",
    suggestions: [
      'Emergency contacts',
      'Translate a phrase',
      'Check weather',
      'Find safe zones',
      'Get directions',
    ],
  };
}

/**
 * Trip mode management
 */
let tripModeActive = false;

export function activateTripMode(): void {
  tripModeActive = true;
  localStorage.setItem('tripModeActive', 'true');
}

export function deactivateTripMode(): void {
  tripModeActive = false;
  localStorage.removeItem('tripModeActive');
}

export function isTripModeActive(): boolean {
  if (tripModeActive) return true;
  return localStorage.getItem('tripModeActive') === 'true';
}
