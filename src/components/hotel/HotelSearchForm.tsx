/**
 * Hotel Search Form Component
 * 
 * Provides hotel search functionality with:
 * - Location, check-in/check-out dates, rooms, and guest configuration
 * - Form validation for all inputs
 * - Integration with hotelSearchService
 * - Loading state during search
 * 
 * Requirements: 1.1
 */

import React, { useState } from 'react';
import { getHotelSearchService } from '../../services/hotelSearchService';
import type { HotelSearchCriteria, PaxRoomInput, HotelSearchResult } from '../../services/hotelSearchService';
import './HotelSearchForm.css';

interface FormErrors {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guestNationality?: string;
  rooms?: string;
  submit?: string;
}

interface RoomConfig {
  adults: number;
  children: number;
  childrenAges: number[];
}

interface HotelSearchFormProps {
  onSearchComplete?: (results: HotelSearchResult) => void;
  onSearchError?: (error: string) => void;
}

const HotelSearchForm: React.FC<HotelSearchFormProps> = ({
  onSearchComplete,
  onSearchError,
}) => {
  const hotelSearchService = getHotelSearchService();
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Form state
  const [cityCode, setCityCode] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestNationality, setGuestNationality] = useState('US');
  const [rooms, setRooms] = useState<RoomConfig[]>([
    { adults: 2, children: 0, childrenAges: [] }
  ]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate location
    if (!cityCode.trim()) {
      newErrors.location = 'Please enter a city code';
    }

    // Validate check-in date
    if (!checkIn) {
      newErrors.checkIn = 'Please select a check-in date';
    } else {
      const checkInDate = new Date(checkIn);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (checkInDate < today) {
        newErrors.checkIn = 'Check-in date cannot be in the past';
      }
    }

    // Validate check-out date
    if (!checkOut) {
      newErrors.checkOut = 'Please select a check-out date';
    } else if (checkIn) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      
      if (checkOutDate <= checkInDate) {
        newErrors.checkOut = 'Check-out date must be after check-in date';
      }
    }

    // Validate guest nationality
    if (!guestNationality.trim()) {
      newErrors.guestNationality = 'Please select guest nationality';
    }

    // Validate rooms
    if (rooms.length === 0) {
      newErrors.rooms = 'At least one room is required';
    } else {
      for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];
        
        if (room.adults < 1) {
          newErrors.rooms = `Room ${i + 1}: At least one adult is required`;
          break;
        }
        
        if (room.children > 0 && room.childrenAges.length !== room.children) {
          newErrors.rooms = `Room ${i + 1}: Please provide ages for all children`;
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Build search criteria
      const criteria: HotelSearchCriteria = {
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        cityCode: cityCode.trim(),
        guestNationality: guestNationality.trim(),
        paxRooms: rooms.map(room => ({
          adults: room.adults,
          children: room.children,
          childrenAges: room.childrenAges,
        })),
        isDetailedResponse: true,
      };

      // Call search service
      const results = await hotelSearchService.search(criteria);

      // Notify parent component
      if (onSearchComplete) {
        onSearchComplete(results);
      }

    } catch (error) {
      console.error('Hotel search error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to search hotels. Please try again.';
      
      setErrors({ submit: errorMessage });
      
      if (onSearchError) {
        onSearchError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRoom = () => {
    if (rooms.length < 9) {
      setRooms([...rooms, { adults: 2, children: 0, childrenAges: [] }]);
    }
  };

  const handleRemoveRoom = (index: number) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter((_, i) => i !== index));
    }
  };

  const handleRoomChange = (index: number, field: keyof RoomConfig, value: number) => {
    const newRooms = [...rooms];
    
    if (field === 'adults' || field === 'children') {
      newRooms[index][field] = value;
      
      // Adjust children ages array when children count changes
      if (field === 'children') {
        const currentAges = newRooms[index].childrenAges;
        if (value > currentAges.length) {
          // Add default ages for new children
          newRooms[index].childrenAges = [
            ...currentAges,
            ...Array(value - currentAges.length).fill(5)
          ];
        } else {
          // Remove excess ages
          newRooms[index].childrenAges = currentAges.slice(0, value);
        }
      }
    }
    
    setRooms(newRooms);
  };

  const handleChildAgeChange = (roomIndex: number, childIndex: number, age: number) => {
    const newRooms = [...rooms];
    newRooms[roomIndex].childrenAges[childIndex] = age;
    setRooms(newRooms);
  };

  const handleReset = () => {
    setCityCode('');
    setCheckIn('');
    setCheckOut('');
    setGuestNationality('US');
    setRooms([{ adults: 2, children: 0, childrenAges: [] }]);
    setErrors({});
  };

  // Get minimum check-out date (day after check-in)
  const getMinCheckOutDate = (): string => {
    if (!checkIn) return '';
    const date = new Date(checkIn);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  // Get today's date for min check-in
  const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="hotel-search-form">
      <div className="form-header">
        <h2>Search Hotels</h2>
        <p>Find the perfect accommodation for your stay</p>
      </div>

      {errors.submit && (
        <div className="error-message submit-error">
          <span className="error-icon">⚠️</span>
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-container">
        {/* Location */}
        <div className="form-group">
          <label htmlFor="cityCode">
            City Code <span className="required">*</span>
          </label>
          <input
            id="cityCode"
            type="text"
            value={cityCode}
            onChange={(e) => setCityCode(e.target.value)}
            placeholder="e.g., NYC, LON, PAR"
            className={errors.location ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.location && (
            <span className="error-text">{errors.location}</span>
          )}
        </div>

        {/* Dates */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="checkIn">
              Check-in Date <span className="required">*</span>
            </label>
            <input
              id="checkIn"
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={getTodayDate()}
              className={errors.checkIn ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.checkIn && (
              <span className="error-text">{errors.checkIn}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="checkOut">
              Check-out Date <span className="required">*</span>
            </label>
            <input
              id="checkOut"
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={getMinCheckOutDate()}
              className={errors.checkOut ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.checkOut && (
              <span className="error-text">{errors.checkOut}</span>
            )}
          </div>
        </div>

        {/* Guest Nationality */}
        <div className="form-group">
          <label htmlFor="guestNationality">
            Guest Nationality <span className="required">*</span>
          </label>
          <select
            id="guestNationality"
            value={guestNationality}
            onChange={(e) => setGuestNationality(e.target.value)}
            className={errors.guestNationality ? 'error' : ''}
            disabled={isLoading}
          >
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="IT">Italy</option>
            <option value="ES">Spain</option>
            <option value="IN">India</option>
            <option value="CN">China</option>
            <option value="JP">Japan</option>
          </select>
          {errors.guestNationality && (
            <span className="error-text">{errors.guestNationality}</span>
          )}
        </div>

        {/* Rooms Configuration */}
        <div className="rooms-section">
          <div className="rooms-header">
            <h3>Rooms & Guests</h3>
            {rooms.length < 9 && (
              <button
                type="button"
                onClick={handleAddRoom}
                className="btn-add-room"
                disabled={isLoading}
              >
                + Add Room
              </button>
            )}
          </div>

          {errors.rooms && (
            <span className="error-text">{errors.rooms}</span>
          )}

          {rooms.map((room, roomIndex) => (
            <div key={roomIndex} className="room-config">
              <div className="room-header">
                <h4>Room {roomIndex + 1}</h4>
                {rooms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRoom(roomIndex)}
                    className="btn-remove-room"
                    disabled={isLoading}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`adults-${roomIndex}`}>Adults</label>
                  <select
                    id={`adults-${roomIndex}`}
                    value={room.adults}
                    onChange={(e) => handleRoomChange(roomIndex, 'adults', parseInt(e.target.value))}
                    disabled={isLoading}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor={`children-${roomIndex}`}>Children</label>
                  <select
                    id={`children-${roomIndex}`}
                    value={room.children}
                    onChange={(e) => handleRoomChange(roomIndex, 'children', parseInt(e.target.value))}
                    disabled={isLoading}
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>

              {room.children > 0 && (
                <div className="children-ages">
                  <label>Children Ages</label>
                  <div className="ages-grid">
                    {room.childrenAges.map((age, childIndex) => (
                      <div key={childIndex} className="age-input">
                        <label htmlFor={`age-${roomIndex}-${childIndex}`}>
                          Child {childIndex + 1}
                        </label>
                        <select
                          id={`age-${roomIndex}-${childIndex}`}
                          value={age}
                          onChange={(e) => handleChildAgeChange(roomIndex, childIndex, parseInt(e.target.value))}
                          disabled={isLoading}
                        >
                          {Array.from({ length: 18 }, (_, i) => i).map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleReset}
            className="btn secondary"
            disabled={isLoading}
          >
            Reset
          </button>
          <button
            type="submit"
            className="btn primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Searching...
              </>
            ) : (
              <>
                <span>🏨</span>
                Search Hotels
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HotelSearchForm;
