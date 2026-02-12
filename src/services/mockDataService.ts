// Comprehensive mock data service for API fallbacks
import type { TripPlannerFormData } from '@/types/trip';
import type { ItineraryResponse, ChatResponse, EmergencyResponse, EmergencyType, ApiResponse } from '@/types/api';

// Enhanced destination mock data
export const MOCK_DESTINATIONS = [
  {
    id: 'bengaluru',
    name: 'Bengaluru, India',
    description: 'Silicon Valley of India with vibrant tech culture, beautiful gardens, and rich heritage',
    imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&q=80',
    vrPreviewUrl: 'https://www.google.com/maps/embed?pb=!4v1234567890!6m8!1m7!1sCAoSLEFGMVFpcE5xVjBfYnRfVzBfYnRfVzBfYnRfVzBfYnRfVzBfYnRfVzA!2m2!1d12.971599!2d77.594566!3f0!4f0!5f0.7820865974627469',
    popularityScore: 88,
    category: ['culture', 'technology', 'food', 'nature'],
    highlights: ['Lalbagh Botanical Garden', 'Bangalore Palace', 'Cubbon Park', 'ISKCON Temple'],
    bestTimeToVisit: 'October-February',
    averageCost: { low: 30, medium: 60, luxury: 150 },
  },
  {
    id: 'tokyo',
    name: 'Tokyo, Japan',
    description: 'Modern metropolis blending traditional culture with cutting-edge technology',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    vrPreviewUrl: 'https://www.google.com/maps/embed?pb=!4v1234567890!6m8!1m7!1sCAoSLEFGMVFpcE5xVjBfYnRfVzBfYnRfVzBfYnRfVzBfYnRfVzBfYnRfVzA!2m2!1d35.658581!2d139.745438!3f0!4f0!5f0.7820865974627469',
    popularityScore: 92,
    category: ['culture', 'food', 'technology', 'urban'],
    highlights: ['Shibuya Crossing', 'Senso-ji Temple', 'Tokyo Skytree', 'Tsukiji Fish Market'],
    bestTimeToVisit: 'March-May, September-November',
    averageCost: { low: 70, medium: 120, luxury: 250 },
  },
  {
    id: 'bali',
    name: 'Bali, Indonesia',
    description: 'Tropical paradise with beautiful beaches, lush rice terraces, and rich cultural heritage',
    imageUrl: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&q=80',
    vrPreviewUrl: 'https://www.google.com/maps/embed?pb=!4v1234567890!6m8!1m7!1sCAoSLEFGMVFpcE5xVjBfYnRfVzBfYnRfVzBfYnRfVzBfYnRfVzBfYnRfVzA!2m2!1d-8.409518!2d115.188919!3f0!4f0!5f0.7820865974627469',
    popularityScore: 88,
    category: ['nature', 'relaxation', 'culture', 'beach'],
    highlights: ['Ubud Rice Terraces', 'Tanah Lot Temple', 'Seminyak Beach', 'Mount Batur'],
    bestTimeToVisit: 'April-October',
    averageCost: { low: 40, medium: 80, luxury: 180 },
  },
  {
    id: 'new-york',
    name: 'New York City, USA',
    description: 'The city that never sleeps, featuring iconic skylines, Broadway shows, and diverse neighborhoods',
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
    vrPreviewUrl: 'https://www.google.com/maps/embed?pb=!4v1234567890!6m8!1m7!1sCAoSLEFGMVFpcE5xVjBfYnRfVzBfYnRfVzBfYnRfVzBfYnRfVzBfYnRfVzA!2m2!1d40.758896!2d-73.985130!3f0!4f0!5f0.7820865974627469',
    popularityScore: 94,
    category: ['urban', 'culture', 'entertainment', 'food'],
    highlights: ['Statue of Liberty', 'Central Park', 'Times Square', 'Brooklyn Bridge'],
    bestTimeToVisit: 'April-June, September-November',
    averageCost: { low: 100, medium: 200, luxury: 400 },
  },
  {
    id: 'santorini',
    name: 'Santorini, Greece',
    description: 'Stunning Greek island with white-washed buildings, blue domes, and breathtaking sunsets',
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
    vrPreviewUrl: 'https://www.google.com/maps/embed?pb=!4v1234567890!6m8!1m7!1sCAoSLEFGMVFpcE5xVjBfYnRfVzBfYnRfVzBfYnRfVzBfYnRfVzBfYnRfVzA!2m2!1d36.393156!2d25.461509!3f0!4f0!5f0.7820865974627469',
    popularityScore: 90,
    category: ['romance', 'relaxation', 'culture', 'beach'],
    highlights: ['Oia Village', 'Red Beach', 'Akrotiri Archaeological Site', 'Fira Town'],
    bestTimeToVisit: 'April-October',
    averageCost: { low: 60, medium: 120, luxury: 280 },
  },
  {
    id: 'iceland',
    name: 'Reykjavik, Iceland',
    description: 'Land of fire and ice with dramatic landscapes, geysers, and the Northern Lights',
    imageUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&q=80',
    vrPreviewUrl: 'https://www.google.com/maps/embed?pb=!4v1234567890!6m8!1m7!1sCAoSLEFGMVFpcE5xVjBfYnRfVzBfYnRfVzBfYnRfVzBfYnRfVzBfYnRfVzA!2m2!1d64.146582!2d-21.942636!3f0!4f0!5f0.7820865974627469',
    popularityScore: 85,
    category: ['nature', 'adventure', 'unique'],
    highlights: ['Blue Lagoon', 'Golden Circle', 'Northern Lights', 'Gullfoss Waterfall'],
    bestTimeToVisit: 'June-August (summer), September-March (Northern Lights)',
    averageCost: { low: 90, medium: 160, luxury: 320 },
  },
];

// Enhanced mock itinerary generation
export function generateMockItinerary(formData: TripPlannerFormData): ApiResponse<ItineraryResponse> {
  const tripDuration = Math.ceil(
    (formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const destination = MOCK_DESTINATIONS.find(d => d.name.toLowerCase().includes(formData.destination.toLowerCase())) 
    || MOCK_DESTINATIONS[0];

  const mockItinerary: ItineraryResponse = {
    tripId: `trip-${Date.now()}`,
    itinerary: Array.from({ length: Math.min(tripDuration, 7) }, (_, index) => {
      const currentDate = new Date(formData.startDate);
      currentDate.setDate(currentDate.getDate() + index);
      
      return {
        dayNumber: index + 1,
        date: currentDate,
        places: generateDayPlaces(destination, index, formData.interests),
        foodRecommendations: generateFoodRecommendations(destination, formData.budget),
        travelTips: generateTravelTips(destination, index, formData.budget, formData.interests),
      };
    }),
    estimatedCost: {
      min: destination.averageCost[formData.budget] * tripDuration * 0.8,
      max: destination.averageCost[formData.budget] * tripDuration * 1.2,
      currency: 'USD',
    },
    generatedAt: new Date(),
  };

  return {
    success: true,
    data: mockItinerary,
    timestamp: new Date(),
  };
}

// Generate places for a specific day
function generateDayPlaces(destination: any, dayIndex: number, interests: string[]) {
  const allPlaces = {
    bengaluru: [
      { name: 'Lalbagh Botanical Garden', category: 'nature', description: 'Historic botanical garden with diverse flora', time: '2 hours' },
      { name: 'Bangalore Palace', category: 'culture', description: 'Tudor-style palace with beautiful architecture', time: '2 hours' },
      { name: 'Cubbon Park', category: 'nature', description: 'Sprawling green space in the heart of the city', time: '1.5 hours' },
      { name: 'ISKCON Temple', category: 'culture', description: 'Beautiful temple with spiritual ambiance', time: '1.5 hours' },
      { name: 'Vidhana Soudha', category: 'culture', description: 'Impressive government building with neo-Dravidian architecture', time: '1 hour' },
      { name: 'Commercial Street', category: 'shopping', description: 'Bustling shopping street with local goods', time: '2 hours' },
    ],
    paris: [
      { name: 'Eiffel Tower', category: 'culture', description: 'Iconic iron lattice tower and symbol of Paris', time: '3 hours' },
      { name: 'Louvre Museum', category: 'culture', description: 'World\'s largest art museum', time: '4 hours' },
      { name: 'Notre-Dame Cathedral', category: 'culture', description: 'Gothic cathedral masterpiece', time: '2 hours' },
      { name: 'Montmartre District', category: 'culture', description: 'Artistic neighborhood with Sacré-Cœur', time: '3 hours' },
      { name: 'Seine River Cruise', category: 'relaxation', description: 'Scenic boat tour along the Seine', time: '1.5 hours' },
      { name: 'Champs-Élysées', category: 'shopping', description: 'Famous avenue for shopping and cafés', time: '2 hours' },
    ],
    tokyo: [
      { name: 'Shibuya Crossing', category: 'urban', description: 'World\'s busiest pedestrian crossing', time: '1 hour' },
      { name: 'Senso-ji Temple', category: 'culture', description: 'Ancient Buddhist temple in Asakusa', time: '2 hours' },
      { name: 'Tokyo Skytree', category: 'urban', description: 'Tallest structure in Japan with panoramic views', time: '2 hours' },
      { name: 'Tsukiji Outer Market', category: 'food', description: 'Fresh seafood and street food paradise', time: '2 hours' },
      { name: 'Harajuku District', category: 'culture', description: 'Youth culture and fashion hub', time: '2 hours' },
      { name: 'Imperial Palace Gardens', category: 'nature', description: 'Peaceful gardens in the city center', time: '2 hours' },
    ],
    bali: [
      { name: 'Ubud Rice Terraces', category: 'nature', description: 'Stunning terraced rice fields', time: '3 hours' },
      { name: 'Tanah Lot Temple', category: 'culture', description: 'Sea temple on a rock formation', time: '2 hours' },
      { name: 'Seminyak Beach', category: 'beach', description: 'Beautiful beach with sunset views', time: '4 hours' },
      { name: 'Sacred Monkey Forest', category: 'nature', description: 'Nature reserve with playful monkeys', time: '1.5 hours' },
      { name: 'Tegallalang Rice Terraces', category: 'nature', description: 'Instagram-famous rice terraces', time: '2 hours' },
      { name: 'Ubud Art Market', category: 'shopping', description: 'Traditional crafts and souvenirs', time: '2 hours' },
    ],
  };

  const destinationKey = destination.id as keyof typeof allPlaces;
  const places = allPlaces[destinationKey] || allPlaces.paris;
  
  // Select places based on interests and day
  const relevantPlaces = places.filter(place => 
    interests.some(interest => place.category.includes(interest)) || 
    place.category === 'culture' // Always include cultural sites
  );

  const selectedPlaces = relevantPlaces.slice(dayIndex * 2, (dayIndex * 2) + 2);
  
  return selectedPlaces.map(place => ({
    name: place.name,
    description: place.description,
    estimatedTime: place.time,
    category: place.category,
  }));
}

// Generate food recommendations
function generateFoodRecommendations(destination: any, budget: string) {
  const foodOptions = {
    bengaluru: {
      luxury: [
        { name: 'Karavalli', type: 'Coastal Indian', description: 'Award-winning coastal cuisine in elegant setting', priceRange: '$$$' },
        { name: 'Rim Naam', type: 'Thai', description: 'Authentic Thai cuisine in beautiful ambiance', priceRange: '$$$' },
      ],
      medium: [
        { name: 'MTR', type: 'South Indian', description: 'Legendary restaurant serving authentic Karnataka cuisine', priceRange: '$$' },
        { name: 'Vidyarthi Bhavan', type: 'South Indian', description: 'Famous for crispy dosas since 1943', priceRange: '$$' },
      ],
      low: [
        { name: 'CTR (Central Tiffin Room)', type: 'South Indian', description: 'Iconic spot for benne dosa', priceRange: '$' },
        { name: 'Veena Stores', type: 'Snacks', description: 'Popular for khara bath and kesari bath', priceRange: '$' },
      ],
    },
    paris: {
      luxury: [
        { name: 'Le Jules Verne', type: 'Fine Dining', description: 'Michelin-starred restaurant in the Eiffel Tower', priceRange: '$$$' },
        { name: 'L\'Ami Jean', type: 'Bistro', description: 'Traditional French bistro with modern twist', priceRange: '$$' },
      ],
      medium: [
        { name: 'Breizh Café', type: 'Crêperie', description: 'Modern take on traditional Breton crêpes', priceRange: '$$' },
        { name: 'Du Pain et des Idées', type: 'Bakery', description: 'Artisanal bakery with exceptional pastries', priceRange: '$' },
      ],
      low: [
        { name: 'L\'As du Fallafel', type: 'Street Food', description: 'Famous falafel in the Marais district', priceRange: '$' },
        { name: 'Local Boulangerie', type: 'Bakery', description: 'Fresh croissants and coffee', priceRange: '$' },
      ],
    },
    tokyo: {
      luxury: [
        { name: 'Sukiyabashi Jiro', type: 'Sushi', description: 'World-renowned sushi master\'s restaurant', priceRange: '$$$' },
        { name: 'Narisawa', type: 'Fine Dining', description: 'Innovative Japanese cuisine', priceRange: '$$$' },
      ],
      medium: [
        { name: 'Ramen Yokocho', type: 'Ramen', description: 'Traditional ramen alley experience', priceRange: '$$' },
        { name: 'Izakaya Torikizoku', type: 'Izakaya', description: 'Casual Japanese pub with yakitori', priceRange: '$$' },
      ],
      low: [
        { name: 'Conveyor Belt Sushi', type: 'Sushi', description: 'Affordable sushi train experience', priceRange: '$' },
        { name: 'Street Food Stalls', type: 'Street Food', description: 'Takoyaki and other local snacks', priceRange: '$' },
      ],
    },
    bali: {
      luxury: [
        { name: 'Mozaic Restaurant', type: 'Fine Dining', description: 'French-Indonesian fusion cuisine', priceRange: '$$$' },
        { name: 'Sarong Restaurant', type: 'Asian Fusion', description: 'Upscale Asian dining experience', priceRange: '$$' },
      ],
      medium: [
        { name: 'Warung Babi Guling', type: 'Local', description: 'Traditional Balinese roasted pork', priceRange: '$$' },
        { name: 'Bebek Bengil', type: 'Local', description: 'Famous crispy duck restaurant', priceRange: '$$' },
      ],
      low: [
        { name: 'Local Warungs', type: 'Street Food', description: 'Authentic Indonesian street food', priceRange: '$' },
        { name: 'Night Market', type: 'Street Food', description: 'Variety of local dishes and snacks', priceRange: '$' },
      ],
    },
  };

  const destinationKey = destination.id as keyof typeof foodOptions;
  const options = foodOptions[destinationKey] || foodOptions.paris;
  
  return options[budget as keyof typeof options] || options.medium;
}

// Generate travel tips
function generateTravelTips(destination: any, dayIndex: number, budget: string, interests: string[]) {
  const baseTips = [
    'Start early to avoid crowds at popular attractions',
    'Wear comfortable walking shoes',
    'Bring a portable charger for your phone',
    'Stay hydrated throughout the day',
    'Keep copies of important documents',
  ];

  const destinationTips = {
    paris: [
      'Learn basic French phrases - locals appreciate the effort',
      'Many museums are free on the first Sunday of each month',
      'Validate your metro tickets to avoid fines',
      'Tipping 10% is standard in restaurants',
    ],
    tokyo: [
      'Download a translation app for easier communication',
      'Bow slightly when greeting people',
      'Remove shoes when entering homes or certain restaurants',
      'Cash is still king - many places don\'t accept cards',
    ],
    bali: [
      'Dress modestly when visiting temples',
      'Bargaining is expected at markets',
      'Be cautious with tap water - stick to bottled water',
      'Respect local customs and ceremonies',
    ],
  };

  const destinationKey = destination.id as keyof typeof destinationTips;
  const specificTips = destinationTips[destinationKey] || destinationTips.paris;

  const budgetTips = {
    low: ['Look for free walking tours', 'Eat at local markets for authentic, cheap meals', 'Use public transportation'],
    medium: ['Book attractions in advance for better prices', 'Consider guided tours for deeper insights'],
    luxury: ['Make reservations at high-end restaurants well in advance', 'Consider private tours for personalized experiences'],
  };

  const interestTips = {
    food: ['Try local specialties and street food', 'Ask locals for restaurant recommendations'],
    culture: ['Visit museums and historical sites early in the day', 'Respect local customs and dress codes'],
    nature: ['Bring sunscreen and insect repellent', 'Check weather conditions before outdoor activities'],
    adventure: ['Book adventure activities in advance', 'Ensure you have proper insurance coverage'],
    shopping: ['Keep receipts for tax refunds', 'Learn basic bargaining phrases'],
  };

  const tips = [
    baseTips[dayIndex % baseTips.length],
    specificTips[dayIndex % specificTips.length],
    budgetTips[budget as keyof typeof budgetTips][0],
  ];

  // Add interest-specific tips
  interests.forEach(interest => {
    if (interestTips[interest as keyof typeof interestTips]) {
      tips.push(interestTips[interest as keyof typeof interestTips][0]);
    }
  });

  return tips.slice(0, 3); // Return max 3 tips per day
}

// Enhanced mock chat responses
export function generateMockChatResponse(message: string): ApiResponse<ChatResponse> {
  const lowerMessage = message.toLowerCase();
  
  let response = '';
  let suggestions: string[] = [];

  if (lowerMessage.includes('food') || lowerMessage.includes('eat') || lowerMessage.includes('restaurant')) {
    response = "For food recommendations, I'd suggest trying the local specialties! Each destination has unique flavors - from French pastries in Paris to fresh sushi in Tokyo. Would you like specific restaurant suggestions based on your budget?";
    suggestions = ['Recommend budget-friendly restaurants', 'What are the local specialties?', 'Any food markets nearby?'];
  } else if (lowerMessage.includes('transport') || lowerMessage.includes('get around') || lowerMessage.includes('travel')) {
    response = "Getting around is easy with local transportation! Most cities have efficient public transit systems. I can help you with metro maps, taxi apps, or walking routes to your destinations.";
    suggestions = ['Show me public transport options', 'How much do taxis cost?', 'Is it walkable?'];
  } else if (lowerMessage.includes('hidden') || lowerMessage.includes('secret') || lowerMessage.includes('gems')) {
    response = "I love sharing hidden gems! There are amazing local spots that most tourists miss - from secret viewpoints to neighborhood cafés where locals hang out. What type of hidden gems interest you most?";
    suggestions = ['Secret viewpoints', 'Local neighborhood spots', 'Off-the-beaten-path attractions'];
  } else if (lowerMessage.includes('weather') || lowerMessage.includes('climate')) {
    response = "Weather can really impact your trip! I can help you prepare with current conditions, seasonal patterns, and what to pack. The best time to visit varies by destination and your preferred activities.";
    suggestions = ['What should I pack?', 'Best time to visit?', 'Current weather conditions'];
  } else if (lowerMessage.includes('culture') || lowerMessage.includes('customs') || lowerMessage.includes('etiquette')) {
    response = "Understanding local culture enhances your travel experience! Each destination has unique customs, from greeting styles to dining etiquette. I can share important cultural tips to help you connect with locals respectfully.";
    suggestions = ['Greeting customs', 'Dining etiquette', 'What to avoid doing'];
  } else if (lowerMessage.includes('attraction') || lowerMessage.includes('see') || lowerMessage.includes('visit')) {
    response = "There are so many amazing attractions to explore! From world-famous landmarks to local favorites, I can help you prioritize based on your interests and available time. What type of attractions interest you most?";
    suggestions = ['Must-see landmarks', 'Museums and galleries', 'Outdoor activities'];
  } else if (lowerMessage.includes('budget') || lowerMessage.includes('cost') || lowerMessage.includes('price')) {
    response = "Budget planning is crucial for a great trip! Costs vary significantly by destination and travel style. I can help you estimate expenses for accommodation, food, transportation, and activities based on your preferences.";
    suggestions = ['Daily budget estimates', 'Money-saving tips', 'Free activities'];
  } else if (lowerMessage.includes('safety') || lowerMessage.includes('safe') || lowerMessage.includes('security')) {
    response = "Your safety is important! I can share current safety information, common scams to avoid, emergency contacts, and general precautions for your destination. Most popular tourist areas are quite safe with basic precautions.";
    suggestions = ['Emergency contacts', 'Common scams to avoid', 'Safe neighborhoods'];
  } else {
    const generalResponses = [
      "I'm here to help make your trip amazing! What specific aspect of your travel would you like assistance with?",
      "Great question! I have lots of local insights to share. What would you like to know more about?",
      "I'd be happy to help you with your travel plans! Could you tell me more about what you're looking for?",
      "That's an interesting question! Let me provide you with some helpful information and suggestions.",
    ];
    
    response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
    suggestions = [
      'Tell me about local food',
      'How do I get around?',
      'What are the must-see attractions?',
      'Any cultural tips?',
    ];
  }

  const mockChatResponse: ChatResponse = {
    messageId: `msg-${Date.now()}`,
    content: response,
    suggestions,
    timestamp: new Date(),
  };

  return {
    success: true,
    data: mockChatResponse,
    timestamp: new Date(),
  };
}

// Enhanced mock emergency responses
export function generateMockEmergencyResponse(type: EmergencyType): ApiResponse<EmergencyResponse> {
  const emergencyResponses = {
    medical: {
      confirmationMessage: "Medical emergency request received. Our team is connecting you with local medical services immediately.",
      contactInfo: {
        phone: "+1-800-MEDICAL-HELP",
        email: "medical@travelsphere.com",
      },
      estimatedResponseTime: "Within 5 minutes",
      additionalInfo: "If this is a life-threatening emergency, please call local emergency services (911, 112, etc.) immediately.",
    },
    passport: {
      confirmationMessage: "Lost passport request received. We're connecting you with the nearest embassy or consulate.",
      contactInfo: {
        phone: "+1-800-PASSPORT-HELP",
        email: "documents@travelsphere.com",
      },
      estimatedResponseTime: "Within 15 minutes",
      additionalInfo: "Please gather any identification documents you have and prepare to file a police report if required.",
    },
    hotel: {
      confirmationMessage: "Hotel issue request received. Our accommodation team is working to resolve your problem.",
      contactInfo: {
        phone: "+1-800-HOTEL-HELP",
        email: "accommodation@travelsphere.com",
      },
      estimatedResponseTime: "Within 10 minutes",
      additionalInfo: "We'll help you find alternative accommodation if needed and work with your current hotel to resolve any issues.",
    },
    'local-help': {
      confirmationMessage: "Local assistance request received. Our local support team is ready to help you.",
      contactInfo: {
        phone: "+1-800-LOCAL-HELP",
        email: "local@travelsphere.com",
      },
      estimatedResponseTime: "Within 15 minutes",
      additionalInfo: "Our local experts can help with directions, recommendations, language assistance, and general travel support.",
    },
  };

  const responseData = emergencyResponses[type];

  const mockResponse: EmergencyResponse = {
    requestId: `emergency-${Date.now()}`,
    confirmationMessage: responseData.confirmationMessage,
    contactInfo: responseData.contactInfo,
    estimatedResponseTime: responseData.estimatedResponseTime,
  };

  return {
    success: true,
    data: mockResponse,
    timestamp: new Date(),
  };
}

// Mock data health check
export function getMockDataStatus() {
  return {
    destinations: MOCK_DESTINATIONS.length,
    lastUpdated: new Date().toISOString(),
    version: '1.0.0',
    status: 'active',
  };
}