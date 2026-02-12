# Confidence-Driven Travel Engine - Quick Start Guide

## Getting Started in 30 Minutes

This guide helps you get a basic confidence scoring system running quickly.

## Prerequisites

- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas account
- Redis running locally or Redis Cloud account
- Existing TravelSphere MVP running

## Step 1: Install Dependencies (5 minutes)

```bash
# Install backend dependencies
npm install express mongoose redis axios node-cache winston

# Install frontend dependencies  
npm install fast-check @types/fast-check

# Install dev dependencies
npm install --save-dev @types/express @types/node
```

## Step 2: Set Up Environment (5 minutes)

Create `.env` file:

```bash
# API Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/travelsphere
REDIS_URL=redis://localhost:6379

# External APIs (get free keys)
OPENWEATHER_API_KEY=your_key_here
TRAVEL_ADVISORY_API_KEY=your_key_here

# Feature Flags
ENABLE_CONFIDENCE_ENGINE=true
ENABLE_PREFERENCE_LEARNING=false
ENABLE_AI_ASSISTANT=false
```

## Step 3: Create Basic Backend (10 minutes)

**File: `backend/server.js`**

```javascript
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Simple confidence calculation endpoint
app.post('/api/confidence/calculate', async (req, res) => {
  const { destinationId, userId } = req.body;
  
  // Mock calculation for quick start
  const score = 70 + Math.random() * 20; // 70-90
  const badge = score >= 85 ? 'Excellent' : 
                score >= 70 ? 'High' : 
                score >= 50 ? 'Moderate' : 'Low';
  
  res.json({
    success: true,
    data: {
      destinationId,
      score: Math.round(score),
      badge,
      breakdown: [
        { factorName: 'Safety', score: 80, weight: 0.2, contribution: 16 },
        { factorName: 'Weather', score: 75, weight: 0.1, contribution: 7.5 },
        // ... add other factors
      ],
      explanation: `This destination has a ${badge} confidence score.`,
      calculatedAt: new Date().toISOString(),
      ttl: 21600,
    },
  });
});

app.listen(3001, () => {
  console.log('Confidence API running on port 3001');
});
```

Start the server:
```bash
node backend/server.js
```



## Step 4: Add Frontend Components (10 minutes)

**File: `src/confidence-engine/hooks/useConfidenceScore.ts`**

```typescript
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useConfidenceScore = (destinationId: string, userId: string) => {
  return useQuery({
    queryKey: ['confidence', destinationId, userId],
    queryFn: async () => {
      const response = await axios.post('http://localhost:3001/api/confidence/calculate', {
        destinationId,
        userId,
      });
      return response.data.data;
    },
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
    retry: 1,
  });
};
```

**Update DestinationCard:**

```typescript
import { useConfidenceScore } from '@/confidence-engine/hooks/useConfidenceScore';

export const DestinationCard = ({ destination, ...props }) => {
  const { data: confidence } = useConfidenceScore(destination.id, 'user-123');
  
  return (
    <div className="destination-card">
      {/* Existing card content */}
      
      {/* Add confidence badge */}
      {confidence && (
        <div className="confidence-badge">
          <span className="badge-label">{confidence.badge}</span>
          <span className="badge-score">{confidence.score}</span>
        </div>
      )}
    </div>
  );
};
```

## Step 5: Test It Out!

1. Start your backend: `node backend/server.js`
2. Start your frontend: `npm run dev`
3. Navigate to the homepage
4. You should see confidence badges on destination cards!

## Next Steps

Now that you have a basic system running:

1. **Enhance the calculation** - Replace mock scores with real external API data
2. **Add caching** - Implement Redis caching for better performance
3. **Add the modal** - Create the breakdown modal component
4. **Add preference learning** - Track user behavior
5. **Add AI assistant** - Implement trip mode features

Refer to the full [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for detailed instructions on each feature.

## Troubleshooting

**Backend not starting?**
- Check if port 3001 is available
- Verify MongoDB and Redis are running

**No confidence badges showing?**
- Check browser console for errors
- Verify API is accessible at http://localhost:3001
- Check CORS configuration

**Scores not updating?**
- Clear React Query cache
- Check cache TTL settings
- Verify API response format

## Resources

- [Full Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- [Requirements Document](./requirements.md)
- [Design Document](./design.md)
- [Task List](./tasks.md)

