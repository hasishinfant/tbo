import React, { useState } from 'react';
import { dateUtils } from '@/utils/dateUtils';
import type { ItineraryDay, Place, FoodRecommendation } from '@/types/itinerary';

interface DayCardProps {
  day: ItineraryDay;
}

const DayCard: React.FC<DayCardProps> = ({ day }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="day-card">
      <div className="day-header" onClick={toggleExpanded}>
        <div className="day-info">
          <div className="day-number">Day {day.dayNumber}</div>
          <div className="day-date">{dateUtils.formatDate(day.date)}</div>
        </div>
        <div className="expand-toggle">
          <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="day-content">
          {/* Places to Visit */}
          {day.places && day.places.length > 0 && (
            <div className="places-section">
              <h3>Places to Visit</h3>
              <div className="places-list">
                {day.places.map((place: Place, placeIndex: number) => (
                  <div key={placeIndex} className="place-item">
                    <div className="place-info">
                      <h4>{place.name}</h4>
                      <p>{place.description}</p>
                      <div className="place-meta">
                        <span className="estimated-time">⏱️ {place.estimatedTime}</span>
                        <span className="place-category">{place.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Food Recommendations */}
          {day.foodRecommendations && day.foodRecommendations.length > 0 && (
            <div className="food-section">
              <h3>Food Recommendations</h3>
              <div className="food-list">
                {day.foodRecommendations.map((food: FoodRecommendation, foodIndex: number) => (
                  <div key={foodIndex} className="food-item">
                    <h4>{food.name}</h4>
                    <p>{food.description}</p>
                    <div className="food-details">
                      <span className="food-type">{food.type}</span>
                      <span className="price-range">{food.priceRange}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Travel Tips */}
          {day.travelTips && day.travelTips.length > 0 && (
            <div className="tips-section">
              <h3>Travel Tips</h3>
              <ul className="tips-list">
                {day.travelTips.map((tip: string, tipIndex: number) => (
                  <li key={tipIndex}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DayCard;