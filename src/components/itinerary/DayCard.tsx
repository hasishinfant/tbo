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

  // Get emoji icon based on category
  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      culture: '🏛️',
      nature: '🌳',
      food: '🍜',
      shopping: '🛍️',
      beach: '🏖️',
      urban: '🏙️',
      adventure: '⛰️',
      relaxation: '🧘',
      entertainment: '🎭',
      technology: '💻',
      default: '📍'
    };
    return icons[category.toLowerCase()] || icons.default;
  };

  // Get gradient background based on category
  const getCategoryGradient = (category: string): string => {
    const gradients: Record<string, string> = {
      culture: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      nature: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
      food: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      shopping: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      beach: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      urban: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      adventure: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      relaxation: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      entertainment: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      technology: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };
    return gradients[category.toLowerCase()] || gradients.default;
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
                    <div 
                      className="place-image-placeholder"
                      style={{ background: getCategoryGradient(place.category) }}
                    >
                      <span className="place-icon">{getCategoryIcon(place.category)}</span>
                    </div>
                    <div className="place-info">
                      <h4>{place.name}</h4>
                      <p>{place.description}</p>
                      <div className="place-meta">
                        <span className="estimated-time">⏱️ {place.estimatedTime}</span>
                        <span className="place-category">{getCategoryIcon(place.category)} {place.category}</span>
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
                    <div 
                      className="food-image-placeholder"
                      style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}
                    >
                      <span className="food-icon">🍽️</span>
                    </div>
                    <div className="food-info">
                      <h4>{food.name}</h4>
                      <p>{food.description}</p>
                      <div className="food-details">
                        <span className="food-type">🍴 {food.type}</span>
                        <span className="price-range">💰 {food.priceRange}</span>
                      </div>
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