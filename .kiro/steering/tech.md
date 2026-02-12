# TravelSphere Technology Stack

## Frontend Stack

- **Framework**: React 18+ with functional components and hooks
- **Language**: TypeScript (strict type checking required)
- **Build Tool**: Vite or Create React App
- **Routing**: React Router for client-side navigation
- **HTTP Client**: Axios for API communication
- **State Management**: 
  - React Context + useReducer for global state
  - React Query for server state management and caching
- **Styling**: CSS Modules or Styled Components
- **Layout**: CSS Grid and Flexbox with mobile-first approach

## Testing Framework

- **Unit Testing**: Jest + React Testing Library
- **Property-Based Testing**: fast-check (minimum 100 iterations per property)
- **API Mocking**: Mock Service Worker (MSW)
- **Coverage**: Comprehensive unit + property-based test coverage required

## API Integration

- **Architecture**: RESTful APIs following OpenAPI 3.0 specification
- **Format**: JSON request/response
- **Key Endpoints**:
  - POST /api/generate-itinerary
  - POST /api/chat-assistant  
  - POST /api/emergency-support
- **Fallback**: Mock JSON responses when APIs unavailable

## External Services

- VR Content Provider (360-degree tours via iframe)
- AI/ML Services (itinerary generation and chat)
- Emergency Response Services

## Common Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm test             # Run unit tests
npm run test:pbt     # Run property-based tests
npm run test:watch   # Run tests in watch mode

# Code Quality
npm run lint         # Lint code
npm run type-check   # TypeScript type checking
npm run format       # Format code

# Dependencies
npm install          # Install dependencies
npm run clean        # Clean build artifacts
```

## Development Environment

- **Editor**: VSCode with Kiro Agent integration
- **Node Version**: Latest LTS recommended
- **Package Manager**: npm (consistent across team)