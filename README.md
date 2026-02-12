# TravelSphere

An AI-powered travel companion web application that provides end-to-end smart travel experiences. Unlike traditional booking sites, TravelSphere functions as an intelligent travel companion with a clean, modern UI featuring travel-themed visuals, soft gradients, and friendly user experience.

## 🌟 Features

- **Destination Discovery**: Visual exploration of travel destinations with VR previews
- **AI Trip Planning**: Intelligent itinerary generation based on user preferences
- **Travel Assistant**: Chat-based AI for real-time travel assistance
- **Emergency Support**: Safety-focused support system for urgent travel situations

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18+ with functional components and hooks
- **Language**: TypeScript (strict type checking)
- **Build Tool**: Vite
- **Routing**: React Router for client-side navigation
- **HTTP Client**: Axios for API communication
- **State Management**: React Context + useReducer for global state, React Query for server state
- **Styling**: CSS with custom properties and mobile-first responsive design

### Key Dependencies
- `react` & `react-dom` - Core React framework
- `react-router-dom` - Client-side routing
- `@tanstack/react-query` - Server state management and caching
- `axios` - HTTP client for API calls
- `typescript` - Type safety and development experience
- `vite` - Fast build tool and development server

## 🚀 Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd travelsphere
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to see the application.

## 📜 Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Code Quality
```bash
npm run type-check   # TypeScript type checking
npm run lint         # Lint code (when configured)
npm run format       # Format code (when configured)
```

### Maintenance
```bash
npm run clean        # Clean build artifacts
```

## 📁 Project Structure

```
src/
├── components/                    # Reusable React components
│   ├── destination/              # Destination discovery components
│   ├── trip-planner/            # Trip planning form components
│   ├── itinerary/               # Itinerary display components
│   ├── chat/                    # Chat interface components
│   ├── emergency/               # Emergency support components
│   └── shared/                  # Shared UI components
├── pages/                       # Page-level components
│   ├── HomePage.tsx
│   ├── TripPlannerPage.tsx
│   ├── ItineraryPage.tsx
│   ├── ChatPage.tsx
│   └── EmergencyPage.tsx
├── services/                    # API services and business logic
│   ├── api.ts                   # API client configuration
│   ├── itineraryService.ts
│   ├── chatService.ts
│   └── emergencyService.ts
├── types/                       # TypeScript interfaces and types
│   ├── destination.ts
│   ├── trip.ts
│   ├── itinerary.ts
│   └── api.ts
├── utils/                       # Utility functions and helpers
│   ├── dateUtils.ts
│   ├── formatters.ts
│   └── constants.ts
├── hooks/                       # Custom React hooks
├── context/                     # React Context providers
├── styles/                      # Global styles and themes
└── tests/                       # Test utilities and setup (future)
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#2563eb)
- **Secondary**: Teal (#0891b2)
- **Accent**: Soft Orange (#f97316)
- **Success**: Green (#059669)
- **Warning**: Orange (#d97706)
- **Error**: Red (#dc2626)

### Responsive Breakpoints
- **Mobile**: 320px+
- **Tablet**: 768px+
- **Desktop**: 1024px+

### Design Principles
- Mobile-first responsive design
- Rounded cards and soft shadows throughout the interface
- Touch-friendly interface elements (minimum 44px touch targets)
- Travel-themed visuals with soft gradients

## 🔄 Navigation Flow

The application follows an intuitive navigation pattern:
```
Home → Plan Trip → Itinerary → Travel Assistant
  ↓
Emergency Support (accessible from any page)
```

## 🔌 API Integration

The application integrates with the following API endpoints:
- `POST /api/generate-itinerary` - Generate travel itineraries
- `POST /api/chat-assistant` - Chat with travel assistant
- `POST /api/emergency-support` - Emergency support requests

### Fallback Strategy
When APIs are unavailable, the application uses mock JSON responses to maintain functionality and provide a seamless user experience.

## 🏗️ Development Status

### ✅ Completed (Task 1)
- [x] React TypeScript project setup with Vite
- [x] Core dependencies installation and configuration
- [x] Complete project folder structure
- [x] TypeScript interfaces for core data models
- [x] Basic routing structure with placeholder pages
- [x] API services with mock fallbacks
- [x] Global state management with React Context
- [x] Custom hooks for API integration
- [x] Responsive CSS framework with travel theme
- [x] Error boundaries and loading components

### 🔄 Next Steps
- [ ] Implement destination discovery components
- [ ] Build trip planning form functionality
- [ ] Create itinerary display and management
- [ ] Develop chat interface
- [ ] Add emergency support system
- [ ] Implement comprehensive testing

## 🤝 Contributing

This project follows a component-driven development approach. Each feature is built incrementally with proper TypeScript typing, error handling, and responsive design.

### Code Style
- Use functional components with hooks
- Follow TypeScript strict mode
- Implement proper error boundaries
- Use CSS custom properties for theming
- Follow mobile-first responsive design

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For emergency support features or general questions about the application, refer to the emergency support system within the app or contact the development team.

---

**TravelSphere** - Your AI-powered travel companion for unforgettable journeys ✈️🌍