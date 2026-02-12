import React from 'react';
import DayCard from './DayCard';
import type { ItineraryDay } from '@/types/itinerary';
import './ItineraryTimeline.css';

interface ItineraryTimelineProps {
  itinerary: ItineraryDay[];
}

const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({ itinerary }) => {
  return (
    <div className="itinerary-timeline">
      {itinerary.map((day) => (
        <DayCard key={day.dayNumber} day={day} />
      ))}
    </div>
  );
};

export default ItineraryTimeline;