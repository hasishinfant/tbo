// Itinerary page
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ItineraryTimeline from '../components/itinerary/ItineraryTimeline';
import ActionButtons from '../components/itinerary/ActionButtons';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import BookingModal, { BookingData } from '../components/booking/BookingModal';
import { activateTripMode, deactivateTripMode, isTripModeActive } from '../confidence-engine/services/assistantService';
import type { ItineraryDay } from '@/types/itinerary';
import './ItineraryPage.css';

const ItineraryPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState<ItineraryDay[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [tripMode, setTripMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'offers'>('itinerary');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<string>('');

  useEffect(() => {
    setTripMode(isTripModeActive());
  }, []);

  useEffect(() => {
    // Load itinerary from sessionStorage (set by TripPlannerForm)
    const loadItinerary = () => {
      try {
        console.log('Loading itinerary...');
        
        // First try sessionStorage (from trip planner form)
        const generatedItinerary = sessionStorage.getItem('generatedItinerary');
        console.log('SessionStorage data:', generatedItinerary ? 'Found' : 'Not found');
        
        if (generatedItinerary) {
          const itineraryData = JSON.parse(generatedItinerary);
          console.log('Parsed itinerary data:', itineraryData);
          
          if (itineraryData.itinerary && Array.isArray(itineraryData.itinerary)) {
            setItinerary(itineraryData.itinerary);
            // Also save to localStorage for persistence
            localStorage.setItem('currentTrip', generatedItinerary);
            setLoading(false);
            return;
          }
        }
        
        // Fallback to localStorage
        const savedTrip = localStorage.getItem('currentTrip');
        console.log('LocalStorage data:', savedTrip ? 'Found' : 'Not found');
        
        if (savedTrip) {
          const trip = JSON.parse(savedTrip);
          console.log('Parsed saved trip:', trip);
          
          if (trip.itinerary && Array.isArray(trip.itinerary)) {
            setItinerary(trip.itinerary);
            setLoading(false);
            return;
          }
        }
        
        // No valid itinerary found
        console.log('No valid itinerary found, redirecting to trip planner');
        setLoading(false);
        setTimeout(() => {
          navigate('/plan-trip');
        }, 100);
        
      } catch (error) {
        console.error('Error loading itinerary:', error);
        setLoading(false);
        setTimeout(() => {
          navigate('/plan-trip');
        }, 100);
      }
    };

    loadItinerary();
  }, [tripId, navigate]);

  const handleChatWithAssistant = () => {
    navigate(`/chat${tripId ? `/${tripId}` : ''}`);
  };

  const handleSaveTrip = () => {
    try {
      const savedTrip = localStorage.getItem('currentTrip');
      if (savedTrip) {
        const trip = JSON.parse(savedTrip);
        const savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
        savedTrips.push({
          ...trip,
          savedAt: new Date().toISOString(),
        });
        localStorage.setItem('savedTrips', JSON.stringify(savedTrips));
        alert('Trip saved successfully!');
      }
    } catch (error) {
      console.error('Error saving trip:', error);
      alert('Failed to save trip. Please try again.');
    }
  };

  const handleToggleTripMode = () => {
    if (tripMode) {
      deactivateTripMode();
      setTripMode(false);
    } else {
      activateTripMode();
      setTripMode(true);
    }
  };

  const handleBookOffer = (offerDestination: string) => {
    setSelectedOffer(offerDestination);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = (bookingData: BookingData) => {
    // Save booking to localStorage
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push({
      ...bookingData,
      bookingId: `booking-${Date.now()}`,
      bookedAt: new Date().toISOString(),
    });
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    setShowBookingModal(false);
    alert(`Booking confirmed for ${bookingData.destination}!\nTotal: $${bookingData.totalPrice}`);
  };

  // Mock offers data
  const offers = [
    {
      id: 1,
      title: 'Luxury Hotel Package',
      destination: itinerary?.[0]?.places[0]?.name || 'Paris',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      originalPrice: 450,
      discountPrice: 299,
      discount: '33% OFF',
      rating: 4.8,
      reviews: 1234,
      features: ['Free Breakfast', 'Airport Transfer', 'Spa Access'],
    },
    {
      id: 2,
      title: 'Adventure Tour Bundle',
      destination: itinerary?.[0]?.places[1]?.name || 'Tokyo',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      originalPrice: 380,
      discountPrice: 249,
      discount: '35% OFF',
      rating: 4.9,
      reviews: 856,
      features: ['Guided Tours', 'All Meals', 'Equipment Included'],
    },
    {
      id: 3,
      title: 'Beach Resort Special',
      destination: 'Bali',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      originalPrice: 520,
      discountPrice: 349,
      discount: '33% OFF',
      rating: 4.7,
      reviews: 2103,
      features: ['Ocean View', 'Water Sports', 'Sunset Dinner'],
    },
    {
      id: 4,
      title: 'City Explorer Pass',
      destination: 'New York',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
      originalPrice: 280,
      discountPrice: 199,
      discount: '29% OFF',
      rating: 4.6,
      reviews: 1567,
      features: ['Museum Access', 'City Tours', 'Metro Pass'],
    },
  ];

  if (loading) {
    return (
      <div className="itinerary-page">
        <LoadingSpinner size="lg" message="Loading your itinerary..." />
      </div>
    );
  }

  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="itinerary-page">
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h2>No Itinerary Found</h2>
          <p>It looks like you haven't created a trip yet. Let's plan your perfect journey!</p>
          <button className="btn-hero btn-hero-primary" onClick={() => navigate('/plan-trip')}>
            ✈️ Plan Your Trip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="itinerary-page">
      <div className="page-header">
        <h1>Your Personalized Itinerary</h1>
        <p>Here's your day-by-day travel plan with recommendations</p>
        <button 
          className={`trip-mode-toggle ${tripMode ? 'active' : ''}`}
          onClick={handleToggleTripMode}
        >
          {tripMode ? '✓ Trip Mode Active' : 'Start Trip Mode'}
        </button>
      </div>

      {/* Tabs */}
      <div className="itinerary-tabs">
        <button
          className={`tab ${activeTab === 'itinerary' ? 'active' : ''}`}
          onClick={() => setActiveTab('itinerary')}
        >
          📅 Itinerary
        </button>
        <button
          className={`tab ${activeTab === 'offers' ? 'active' : ''}`}
          onClick={() => setActiveTab('offers')}
        >
          🎁 Special Offers
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'itinerary' ? (
        <>
          <ItineraryTimeline itinerary={itinerary} />
          <ActionButtons
            onChatWithAssistant={handleChatWithAssistant}
            onSaveTrip={handleSaveTrip}
          />
        </>
      ) : (
        <div className="offers-section">
          <div className="offers-header">
            <h2>Exclusive Offers for Your Trip</h2>
            <p>Save big on hotels, tours, and experiences</p>
          </div>
          
          <div className="offers-grid">
            {offers.map((offer) => (
              <div key={offer.id} className="offer-card">
                <div className="offer-image-container">
                  <img src={offer.image} alt={offer.title} className="offer-image" />
                  <span className="offer-badge">{offer.discount}</span>
                </div>
                
                <div className="offer-content">
                  <h3>{offer.title}</h3>
                  <p className="offer-destination">📍 {offer.destination}</p>
                  
                  <div className="offer-rating">
                    <span className="stars">⭐ {offer.rating}</span>
                    <span className="reviews">({offer.reviews} reviews)</span>
                  </div>
                  
                  <div className="offer-features">
                    {offer.features.map((feature, index) => (
                      <span key={index} className="feature-tag">
                        ✓ {feature}
                      </span>
                    ))}
                  </div>
                  
                  <div className="offer-pricing">
                    <div className="price-info">
                      <span className="original-price">${offer.originalPrice}</span>
                      <span className="discount-price">${offer.discountPrice}</span>
                    </div>
                    <button 
                      className="btn-book"
                      onClick={() => handleBookOffer(offer.destination)}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          destination={selectedOffer}
          onClose={() => setShowBookingModal(false)}
          onBook={handleConfirmBooking}
        />
      )}
    </div>
  );
};

export default ItineraryPage;