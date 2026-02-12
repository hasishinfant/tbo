# Confidence-Driven Travel Engine

A modular AI-powered enhancement layer for TravelSphere that provides intelligent confidence scoring, personalized recommendations, and real-time travel assistance.

## Overview

The Confidence-Driven Travel Engine calculates dynamic confidence scores (0-100) for travel destinations based on multiple weighted factors including safety, weather, accessibility, and personal preferences. It integrates seamlessly with the existing TravelSphere MVP without modifying core functionality.

## Directory Structure

```
src/confidence-engine/
├── types/                      # TypeScript type definitions
│   ├── confidence.ts          # Confidence score types
│   ├── traveler.ts           # Traveler profile types
│   ├── preferences.ts        # Preference learning types
│   ├── context.ts            # Context adapter types
│   ├── assistant.ts          # AI assistant types
│   └── index.ts              # Type exports
├── services/                  # API services and business logic
│   └── apiClient.ts          # Axios client configuration
├── utils/                     # Utility functions
├── __tests__/                # Tests and test utilities
│   └── setup.ts              # Property-based test configuration
└── index.ts                  # Main module exports
```

## Core Features

### 1. Confidence Score Calculation
- 8-factor weighted algorithm (safety, weather, transport, language, health, budget, crowd, preferences)
- Real-time calculation (< 500ms)
- Badge categorization (Low/Moderate/High/Excellent)
- Detailed factor breakdown with explanations

### 2. Context-Aware Intelligence
- Real-time adjustments based on external conditions
- Geopolitical alerts and weather warnings
- Seasonal crowd density tracking
- Location-based recommendations

### 3. Preference Learning
- Implicit signal tracking (clicks, views, browsing duration)
- Explicit feedback collection (post-trip surveys)
- Personalized weight adjustments
- Profile-based recommendations

### 4. AI Travel Assistant
- Trip Mode for active travelers
- Emergency contact lookup
- Live translation support
- Weather alerts and safe zone recommendations
- Route suggestions

### 5. VR Preview Integration
- 360° panoramic content embedding
- WebXR compatibility
- Video fallback for non-VR content
- Lightweight, non-blocking loading

## Type Definitions

All types are fully documented with JSDoc comments. Import from the main module:

```typescript
import {
  ConfidenceScoreRequest,
  ConfidenceScoreResponse,
  TravelerProfile,
  PreferenceWeights,
  // ... other types
} from '@/confidence-engine';
```

## API Client

The module includes a pre-configured Axios client with:
- Authentication token management
- Request correlation IDs for tracing
- Comprehensive error handling
- Automatic retry logic for transient failures
- Graceful degradation support

```typescript
import { confidenceApiClient } from '@/confidence-engine';

// Use the client for API calls
const response = await confidenceApiClient.post('/confidence/calculate', data);
```

## Testing

The module uses **fast-check** for property-based testing with a minimum of 100 iterations per property test.

### Test Configuration

```typescript
import { PBT_CONFIG, runPropertyTest } from '@/confidence-engine/__tests__/setup';

// Run a property test with default configuration
runPropertyTest(
  myArbitrary,
  (value) => {
    // Test predicate
    expect(value).toBeDefined();
  }
);
```

### Custom Arbitraries

Pre-defined arbitraries for confidence engine domain:
- `confidenceScoreArbitrary()` - Valid scores (0-100)
- `factorScoreArbitrary()` - Valid factor scores (0-100)
- `weightArbitrary()` - Valid weights (0-1)
- `destinationIdArbitrary()` - Valid destination IDs
- `travelDatesArbitrary()` - Valid travel date ranges
- `confidenceBadgeArbitrary()` - Valid badge categories
- `budgetTierArbitrary()` - Valid budget tiers
- `travelStyleArbitrary()` - Valid travel styles

## Integration

The confidence engine is designed as a plug-and-play module:

1. **Non-invasive**: Enhances existing components without modifying core logic
2. **Graceful degradation**: Falls back to MVP functionality if unavailable
3. **Modular**: Each service operates independently
4. **Performance-focused**: Real-time calculations with caching

## Development Status

✅ **Task 1 Complete**: Project structure and core types
- Directory structure created
- All TypeScript interfaces defined
- API client configured
- fast-check installed and configured

🔄 **Next Tasks**:
- Task 2: Implement Confidence Score Engine core calculation
- Task 3: Implement confidence score API endpoints
- Task 5: Implement frontend confidence display components

## Requirements Mapping

This module implements 8 requirements from the specification:
1. Traveler Confidence Score Calculation
2. Confidence Score Presentation
3. VR Preview Integration
4. Confidence-Driven Recommendations
5. Real-Time AI Travel Assistant
6. Traveler Preference Learning
7. Context-Aware Intelligence
8. Modular Integration Architecture

See `.kiro/specs/confidence-driven-travel-engine/requirements.md` for detailed acceptance criteria.
