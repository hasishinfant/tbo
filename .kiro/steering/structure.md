# TravelSphere Project Structure

## Current Structure

```
.
├── .kiro/                          # Kiro configuration and specifications
│   ├── specs/travel-sphere/        # Feature specification
│   │   ├── requirements.md         # 8 requirements with acceptance criteria
│   │   ├── design.md              # Architecture and component design
│   │   └── tasks.md               # 12 implementation tasks
│   └── steering/                  # Project guidance documents
├── .vscode/                       # VSCode configuration
└── (Source code - to be created)
```

## Planned Source Structure

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
└── tests/                       # Test utilities and setup
    ├── __mocks__/              # Mock data and services
    ├── generators/             # Property-based test generators
    └── utils/                  # Test helper functions
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `DestinationCard.tsx`)
- **Pages**: PascalCase with "Page" suffix (e.g., `HomePage.tsx`)
- **Services**: camelCase with "Service" suffix (e.g., `itineraryService.ts`)
- **Types**: camelCase (e.g., `destination.ts`)
- **Utils**: camelCase (e.g., `dateUtils.ts`)
- **Tests**: Same as source file with `.test.tsx` suffix

## Component Organization

- **Feature-based grouping**: Components grouped by feature area
- **Shared components**: Common UI elements in `shared/` directory
- **Co-located tests**: Test files alongside source files when possible
- **Index files**: Export components from feature directories

## Configuration Files

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` or `craco.config.js` - Build configuration
- `.eslintrc.js` - Linting rules
- `jest.config.js` - Test configuration

## Import Conventions

```typescript
// External libraries first
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// Internal imports (absolute paths preferred)
import { DestinationCard } from '@/components/destination';
import { TripService } from '@/services/tripService';
import type { Destination } from '@/types/destination';
```