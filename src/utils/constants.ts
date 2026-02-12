// Application constants
import type { Interest, BudgetLevel } from '@/types/trip';
import type { EmergencyType } from '@/types/api';

// API endpoints
export const API_ENDPOINTS = {
  GENERATE_ITINERARY: '/api/generate-itinerary',
  CHAT_ASSISTANT: '/api/chat-assistant',
  EMERGENCY_SUPPORT: '/api/emergency-support',
} as const;

// Responsive breakpoints (in pixels)
export const BREAKPOINTS = {
  MOBILE: 320,
  TABLET: 768,
  DESKTOP: 1024,
} as const;

// Travel interests options
export const TRAVEL_INTERESTS: Array<{ 
  value: Interest; 
  label: string; 
  icon: string; 
  iconName: 'food' | 'adventure' | 'culture' | 'nature' | 'shopping';
}> = [
  { value: 'food', label: 'Food & Dining', icon: '🍽️', iconName: 'food' },
  { value: 'adventure', label: 'Adventure', icon: '🏔️', iconName: 'adventure' },
  { value: 'culture', label: 'Culture & History', icon: '🏛️', iconName: 'culture' },
  { value: 'nature', label: 'Nature & Wildlife', icon: '🌿', iconName: 'nature' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️', iconName: 'shopping' },
];

// Budget level options
export const BUDGET_LEVELS: Array<{ value: BudgetLevel; label: string; description: string }> = [
  { value: 'low', label: 'Budget-Friendly', description: 'Affordable options and local experiences' },
  { value: 'medium', label: 'Mid-Range', description: 'Comfortable accommodations and activities' },
  { value: 'luxury', label: 'Luxury', description: 'Premium experiences and high-end accommodations' },
];

// Emergency types
export const EMERGENCY_TYPES: Array<{ 
  value: EmergencyType; 
  label: string; 
  icon: string; 
  iconName: 'medical' | 'passport' | 'hotel' | 'help';
  color: string; 
  description: string;
}> = [
  { 
    value: 'medical', 
    label: 'Medical Emergency', 
    icon: '🏥', 
    iconName: 'medical',
    color: '#dc3545',
    description: 'Get immediate medical assistance'
  },
  { 
    value: 'passport', 
    label: 'Lost Passport', 
    icon: '📘', 
    iconName: 'passport',
    color: '#fd7e14',
    description: 'Report lost travel documents'
  },
  { 
    value: 'hotel', 
    label: 'Hotel Issue', 
    icon: '🏨', 
    iconName: 'hotel',
    color: '#6f42c1',
    description: 'Resolve accommodation problems'
  },
  { 
    value: 'local-help', 
    label: 'Need Local Help', 
    icon: '🆘', 
    iconName: 'help',
    color: '#20c997',
    description: 'Get local assistance and guidance'
  },
];

// Color theme
export const COLORS = {
  PRIMARY: '#2563eb', // Blue
  SECONDARY: '#0891b2', // Teal
  ACCENT: '#f97316', // Soft orange
  SUCCESS: '#059669',
  WARNING: '#d97706',
  ERROR: '#dc2626',
  GRAY: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const;

// Animation durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  SAVED_TRIPS: 'travelsphere_saved_trips',
  USER_PREFERENCES: 'travelsphere_user_preferences',
  CHAT_SESSIONS: 'travelsphere_chat_sessions',
} as const;

// Default destinations for demo
export const SAMPLE_DESTINATIONS = [
  {
    id: 'paris',
    name: 'Paris, France',
    description: 'The City of Light with iconic landmarks, world-class museums, and romantic atmosphere',
    imageUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800',
    vrPreviewUrl: 'https://example.com/vr/paris',
    popularityScore: 95,
    category: ['culture', 'romance', 'food', 'art'],
  },
  {
    id: 'tokyo',
    name: 'Tokyo, Japan',
    description: 'Modern metropolis blending traditional culture with cutting-edge technology',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    vrPreviewUrl: 'https://example.com/vr/tokyo',
    popularityScore: 92,
    category: ['culture', 'food', 'technology', 'urban'],
  },
  {
    id: 'bali',
    name: 'Bali, Indonesia',
    description: 'Tropical paradise with beautiful beaches, lush rice terraces, and rich cultural heritage',
    imageUrl: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800',
    vrPreviewUrl: 'https://example.com/vr/bali',
    popularityScore: 88,
    category: ['nature', 'relaxation', 'culture', 'beach'],
  },
  {
    id: 'new-york',
    name: 'New York City, USA',
    description: 'The city that never sleeps, featuring iconic skylines, Broadway shows, and diverse neighborhoods',
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
    vrPreviewUrl: 'https://example.com/vr/new-york',
    popularityScore: 94,
    category: ['urban', 'culture', 'entertainment', 'food'],
  },
  {
    id: 'santorini',
    name: 'Santorini, Greece',
    description: 'Stunning Greek island with white-washed buildings, blue domes, and breathtaking sunsets',
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
    vrPreviewUrl: 'https://example.com/vr/santorini',
    popularityScore: 90,
    category: ['romance', 'relaxation', 'culture', 'beach'],
  },
  {
    id: 'iceland',
    name: 'Reykjavik, Iceland',
    description: 'Land of fire and ice with dramatic landscapes, geysers, and the Northern Lights',
    imageUrl: 'https://images.unsplash.com/photo-1539066834-3c0b2b2b3c3c?w=800',
    vrPreviewUrl: 'https://example.com/vr/iceland',
    popularityScore: 85,
    category: ['nature', 'adventure', 'unique'],
  },
];

// Quick chat suggestions
export const QUICK_CHAT_SUGGESTIONS = [
  "What should I eat here?",
  "How do I get around?",
  "Any hidden gems nearby?",
  "What's the weather like?",
  "Are there any local customs I should know?",
  "What are the must-see attractions?",
];

// Form validation rules
export const VALIDATION_RULES = {
  MIN_TRIP_DURATION: 1, // days
  MAX_TRIP_DURATION: 30, // days
  MIN_MESSAGE_LENGTH: 1,
  MAX_MESSAGE_LENGTH: 500,
} as const;