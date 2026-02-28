import React from 'react';
import { useNavigate } from 'react-router-dom';
import DestinationGrid from '../components/destination/DestinationGrid';
import { MOCK_DESTINATIONS } from '../services/mockDataService';
import './HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handlePlanTrip = (destinationId: string) => {
    navigate(`/plan-trip?destination=${destinationId}`);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Discover Your Perfect Journey</h1>
          <p>AI-powered travel planning with confidence scores to help you make the best decisions</p>
          <div className="hero-cta">
            <button className="btn-hero btn-hero-primary" onClick={() => navigate('/plan-trip')}>
              ✈️ Plan Your Trip
            </button>
            <button className="btn-hero btn-hero-secondary" onClick={() => navigate('/book-hotels')}>
              🏨 Book Hotels
            </button>
            <button className="btn-hero btn-hero-secondary" onClick={() => navigate('/itinerary')}>
              📅 View Itineraries
            </button>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="destinations-section">
        <div className="section-header-centered">
          <h2>Explore Top Destinations</h2>
          <p>Handpicked destinations with AI-powered confidence scores</p>
        </div>
        <DestinationGrid
          destinations={MOCK_DESTINATIONS}
          onPlanTrip={handlePlanTrip}
        />
      </section>
      
      {/* Emergency Section */}
      <div className="emergency-banner" onClick={() => navigate('/emergency-support')}>
         <p>🚑 Need Emergency Support? 24/7 assistance available - Click here</p>
      </div>
    </div>
  );
};

export default HomePage;