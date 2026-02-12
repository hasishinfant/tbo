// Icon component for consistent iconography across TravelSphere
import React from 'react';

export type IconName = 
  // Destinations
  | 'destination' | 'mountain' | 'beach' | 'city' | 'forest' | 'desert'
  // Food & Dining
  | 'food' | 'restaurant' | 'coffee' | 'wine' | 'local-food'
  // Safety & Emergency
  | 'emergency' | 'medical' | 'passport' | 'hotel' | 'help' | 'phone'
  // Chat & Communication
  | 'chat' | 'message' | 'send' | 'assistant' | 'question'
  // Travel & Transportation
  | 'plane' | 'car' | 'train' | 'bus' | 'walk' | 'map'
  // Activities & Interests
  | 'adventure' | 'culture' | 'nature' | 'shopping' | 'camera' | 'star'
  // UI Elements
  | 'close' | 'menu' | 'search' | 'calendar' | 'location' | 'heart'
  | 'check' | 'warning' | 'error' | 'info' | 'loading' | 'arrow-right'
  | 'arrow-left' | 'arrow-up' | 'arrow-down' | 'plus' | 'minus'
  // VR & Technology
  | 'vr' | 'preview' | 'fullscreen' | 'play';

interface IconProps {
  name: IconName;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  color?: string;
  'aria-label'?: string;
}

// Icon mapping with Unicode emojis and symbols for travel theme
const iconMap: Record<IconName, string> = {
  // Destinations
  destination: '🏝️',
  mountain: '🏔️',
  beach: '🏖️',
  city: '🏙️',
  forest: '🌲',
  desert: '🏜️',
  
  // Food & Dining
  food: '🍽️',
  restaurant: '🍴',
  coffee: '☕',
  wine: '🍷',
  'local-food': '🥘',
  
  // Safety & Emergency
  emergency: '🚨',
  medical: '🏥',
  passport: '📘',
  hotel: '🏨',
  help: '🆘',
  phone: '📞',
  
  // Chat & Communication
  chat: '💬',
  message: '💭',
  send: '📤',
  assistant: '🤖',
  question: '❓',
  
  // Travel & Transportation
  plane: '✈️',
  car: '🚗',
  train: '🚆',
  bus: '🚌',
  walk: '🚶',
  map: '🗺️',
  
  // Activities & Interests
  adventure: '🎒',
  culture: '🏛️',
  nature: '🌿',
  shopping: '🛍️',
  camera: '📸',
  star: '⭐',
  
  // UI Elements
  close: '✕',
  menu: '☰',
  search: '🔍',
  calendar: '📅',
  location: '📍',
  heart: '❤️',
  check: '✓',
  warning: '⚠️',
  error: '❌',
  info: 'ℹ️',
  loading: '⏳',
  'arrow-right': '→',
  'arrow-left': '←',
  'arrow-up': '↑',
  'arrow-down': '↓',
  plus: '+',
  minus: '−',
  
  // VR & Technology
  vr: '🥽',
  preview: '👁️',
  fullscreen: '⛶',
  play: '▶️',
};

// Size mapping for consistent sizing
const sizeMap = {
  xs: '0.75rem',    // 12px
  sm: '1rem',       // 16px
  md: '1.25rem',    // 20px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '2.5rem',  // 40px
};

const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 'md', 
  className = '', 
  color,
  'aria-label': ariaLabel 
}) => {
  const iconSymbol = iconMap[name] || '❓';
  const iconSize = sizeMap[size];
  
  const style: React.CSSProperties = {
    fontSize: iconSize,
    lineHeight: 1,
    display: 'inline-block',
    verticalAlign: 'middle',
    ...(color && { color })
  };

  return (
    <span 
      className={`icon icon-${name} icon-${size} ${className}`}
      style={style}
      role="img"
      aria-label={ariaLabel || name}
    >
      {iconSymbol}
    </span>
  );
};

export default Icon;