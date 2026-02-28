import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HotelBookingWorkflow, HotelSearchForm, HotelSearchResults } from '../components/hotel';
import { hotelBookingService, HotelBookingSession } from '../services/hotelBookingService';
import type { HotelSearchResult, HotelResult } from '../services/hotelSearchService';
import './HotelBookingPage.css';

const HotelBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<HotelBookingSession | null>(null);
  const [searchResults, setSearchResults] = useState<HotelSearchResult | null>(null);

  useEffect(() => {
    // Check if there's an active booking session
    const activeSession = hotelBookingService.getCurrentSession();
    if (activeSession) {
      setSession(activeSession);
    }
  }, []);

  const handleSearchComplete = (results: HotelSearchResult) => {
    setSearchResults(results);
  };

  const handleHotelSelect = (hotel: HotelResult) => {
    if (searchResults) {
      // Start a booking session with the selected hotel
      const newSession = hotelBookingService.startBooking(
        hotel as any, // Type conversion needed - HotelResult vs Hotel type mismatch
        searchResults.searchCriteria
      );
      setSession(newSession);
      setSearchResults(null);
    }
  };

  const handleBookingComplete = (confirmationNumber: string) => {
    // Navigate to itinerary page with the booking confirmation
    navigate(`/itinerary?booking=${confirmationNumber}`);
  };

  const handleCancel = () => {
    hotelBookingService.cancelSession();
    setSession(null);
  };

  const handleBackToSearch = () => {
    setSearchResults(null);
  };

  return (
    <div className="hotel-booking-page">
      <div className="page-header">
        <h1>Book Hotels</h1>
        <p>Find and book the perfect accommodation for your trip</p>
      </div>
      
      {session ? (
        <HotelBookingWorkflow 
          session={session}
          onComplete={handleBookingComplete}
          onCancel={handleCancel}
        />
      ) : searchResults ? (
        <div>
          <button 
            className="back-button"
            onClick={handleBackToSearch}
            style={{ marginBottom: '1rem' }}
          >
            ← Back to Search
          </button>
          <HotelSearchResults 
            searchResult={searchResults}
            onHotelSelect={handleHotelSelect}
          />
        </div>
      ) : (
        <HotelSearchForm onSearchComplete={handleSearchComplete} />
      )}
    </div>
  );
};

export default HotelBookingPage;
