/**
 * Hotel Search Results Component
 * 
 * Displays hotel search results with:
 * - Hotel cards in grid layout
 * - Filter controls (refundable, star rating, meal type)
 * - Hotel details (name, location, price, amenities)
 * - Empty results and mock mode indication
 * 
 * Requirements: 1.3, 1.4, 8.3
 */

import React, { useState, useMemo } from 'react';
import { getHotelSearchService } from '../../services/hotelSearchService';
import type { HotelResult, HotelSearchResult } from '../../services/hotelSearchService';
import type { HotelSearchFilters } from '../../types/tboHotelApi';
import './HotelSearchResults.css';

interface HotelSearchResultsProps {
  searchResult: HotelSearchResult;
  onHotelSelect?: (hotel: HotelResult) => void;
}

const HotelSearchResults: React.FC<HotelSearchResultsProps> = ({
  searchResult,
  onHotelSelect,
}) => {
  const hotelSearchService = getHotelSearchService();
  
  // Filter state
  const [filters, setFilters] = useState<HotelSearchFilters>({});
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'name'>('price');

  // Apply filters and sorting
  const filteredAndSortedHotels = useMemo(() => {
    // Apply filters
    let filtered = hotelSearchService.filterResults(searchResult.hotels, filters);

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price.offeredPrice - b.price.offeredPrice;
        case 'rating':
          return b.starRating - a.starRating;
        case 'name':
          return a.hotelName.localeCompare(b.hotelName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchResult.hotels, filters, sortBy, hotelSearchService]);

  const handleFilterChange = (filterKey: keyof HotelSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value === '' || value === undefined ? undefined : value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).some(
    key => filters[key as keyof HotelSearchFilters] !== undefined
  );

  return (
    <div className="hotel-search-results">
      {/* Mock Mode Indicator */}
      {searchResult.isMockData && (
        <div className="mock-mode-banner">
          <span className="mock-icon">ℹ️</span>
          <div className="mock-text">
            <strong>Demo Mode:</strong> Showing sample hotel data. Real API is unavailable.
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="results-header">
        <h2>
          {filteredAndSortedHotels.length} {filteredAndSortedHotels.length === 1 ? 'Hotel' : 'Hotels'} Found
        </h2>
        <p className="search-summary">
          {searchResult.searchCriteria.cityCode && `in ${searchResult.searchCriteria.cityCode}`}
        </p>
      </div>

      {/* Filters and Sort */}
      <div className="filters-section">
        <div className="filters-row">
          {/* Star Rating Filter */}
          <div className="filter-group">
            <label htmlFor="starRating">Star Rating</label>
            <select
              id="starRating"
              value={filters.StarRating || ''}
              onChange={(e) => handleFilterChange('StarRating', e.target.value ? parseInt(e.target.value) : undefined)}
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
            </select>
          </div>

          {/* Refundable Filter */}
          <div className="filter-group">
            <label htmlFor="refundable">Cancellation</label>
            <select
              id="refundable"
              value={filters.Refundable === undefined ? '' : filters.Refundable ? 'true' : 'false'}
              onChange={(e) => handleFilterChange('Refundable', e.target.value === '' ? undefined : e.target.value === 'true')}
            >
              <option value="">All Hotels</option>
              <option value="true">Refundable Only</option>
              <option value="false">Non-Refundable</option>
            </select>
          </div>

          {/* Meal Type Filter */}
          <div className="filter-group">
            <label htmlFor="mealType">Meal Plan</label>
            <select
              id="mealType"
              value={filters.MealType || ''}
              onChange={(e) => handleFilterChange('MealType', e.target.value ? parseInt(e.target.value) : undefined)}
            >
              <option value="">All Meal Plans</option>
              <option value="1">Room Only</option>
              <option value="2">Breakfast Included</option>
              <option value="3">Half Board</option>
              <option value="4">Full Board</option>
              <option value="5">All Inclusive</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="filter-group">
            <label htmlFor="sortBy">Sort By</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'price' | 'rating' | 'name')}
            >
              <option value="price">Price (Low to High)</option>
              <option value="rating">Star Rating (High to Low)</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <button onClick={handleClearFilters} className="btn-clear-filters">
            Clear All Filters
          </button>
        )}
      </div>

      {/* Results Grid */}
      {filteredAndSortedHotels.length > 0 ? (
        <div className="hotels-grid">
          {filteredAndSortedHotels.map((hotel) => (
            <HotelCard
              key={hotel.bookingCode}
              hotel={hotel}
              onSelect={() => onHotelSelect?.(hotel)}
            />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <div className="no-results-icon">🏨</div>
          <h3>No Hotels Found</h3>
          <p>Try adjusting your filters or search criteria</p>
          {hasActiveFilters && (
            <button onClick={handleClearFilters} className="btn primary">
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Hotel Card Component
interface HotelCardProps {
  hotel: HotelResult;
  onSelect: () => void;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, onSelect }) => {
  return (
    <div className="hotel-card">
      {/* Hotel Image */}
      <div className="hotel-image">
        <img src={hotel.hotelPicture} alt={hotel.hotelName} />
        {hotel.refundable && (
          <span className="refundable-badge">Free Cancellation</span>
        )}
      </div>

      {/* Hotel Info */}
      <div className="hotel-info">
        <div className="hotel-header">
          <h3 className="hotel-name">{hotel.hotelName}</h3>
          <div className="star-rating">
            {Array.from({ length: hotel.starRating }, (_, i) => (
              <span key={i} className="star">⭐</span>
            ))}
          </div>
        </div>

        <p className="hotel-location">
          📍 {hotel.address}, {hotel.cityName}
        </p>

        <div className="hotel-details">
          <span className="room-type">{hotel.roomType}</span>
          <span className="meal-type">🍽️ {hotel.mealType}</span>
        </div>

        {/* Amenities */}
        {hotel.amenities.length > 0 && (
          <div className="amenities">
            {hotel.amenities.slice(0, 4).map((amenity, index) => (
              <span key={index} className="amenity-tag">
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > 4 && (
              <span className="amenity-tag more">
                +{hotel.amenities.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Pricing */}
        <div className="hotel-pricing">
          <div className="price-info">
            {hotel.price.discount > 0 && (
              <span className="original-price">
                {hotel.price.currency} {hotel.price.publishedPrice.toFixed(2)}
              </span>
            )}
            <div className="current-price">
              <span className="currency">{hotel.price.currency}</span>
              <span className="amount">{hotel.price.offeredPrice.toFixed(2)}</span>
            </div>
            <span className="price-label">per night</span>
          </div>

          <button onClick={onSelect} className="btn-select">
            View Details
          </button>
        </div>

        {/* Available Rooms */}
        {hotel.availableRooms <= 3 && (
          <div className="availability-warning">
            Only {hotel.availableRooms} room{hotel.availableRooms !== 1 ? 's' : ''} left!
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelSearchResults;
