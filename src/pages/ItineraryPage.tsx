// TravelSphere — My Trips & Itinerary Page
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Compass, Calendar, Sparkles, MapPin, 
  Clock, Heart, Bookmark, CheckCircle, ArrowRight 
} from 'lucide-react';
import ItineraryTimeline from '../components/itinerary/ItineraryTimeline';
import ActionButtons from '../components/itinerary/ActionButtons';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import BookingModal, { BookingData } from '../components/booking/BookingModal';
import { activateTripMode, deactivateTripMode, isTripModeActive } from '../confidence-engine/services/assistantService';
import { generateMockItinerary } from '../services/mockDataService';
import type { ItineraryDay } from '@/types/itinerary';
import './ItineraryPage.css';

interface CuratedTripSample {
  id: string;
  title: string;
  destinationName: string;
  durationDays: number;
  image: string;
  tag: string;
  description: string;
  budget: 'low' | 'medium' | 'luxury';
  interests: string[];
}

const SAMPLE_CURATED_TRIPS: CuratedTripSample[] = [
  {
    id: 'sample-tokyo',
    title: 'Tokyo Cultural & Modern Neon Journey',
    destinationName: 'Tokyo, Japan',
    durationDays: 5,
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    tag: 'Culture & Tech',
    description: 'Ancient shrines, futuristic Shibuya crossings, and Tsukiji morning market delicacies.',
    budget: 'medium',
    interests: ['culture', 'food', 'technology']
  },
  {
    id: 'sample-santorini',
    title: 'Santorini Mediterranean Romance & Sunsets',
    destinationName: 'Santorini, Greece',
    durationDays: 4,
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
    tag: 'Romance & Scenic',
    description: 'Iconic whitewashed caldera cliffs, Oia sunset viewpoints, and authentic Greek tavernas.',
    budget: 'luxury',
    interests: ['romance', 'nature', 'food']
  },
  {
    id: 'sample-bali',
    title: 'Bali Tropical Wellness & Heritage Retreat',
    destinationName: 'Bali, Indonesia',
    durationDays: 6,
    image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&q=80',
    tag: 'Nature & Zen',
    description: 'Emerald Ubud rice terraces, sacred water temples, and sunset beach relaxation in Uluwatu.',
    budget: 'medium',
    interests: ['nature', 'culture', 'relaxation']
  }
];

const ItineraryPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState<ItineraryDay[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [tripMode, setTripMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'offers'>('itinerary');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTripMode(isTripModeActive());
  }, []);

  useEffect(() => {
    // Load itinerary from sessionStorage (set by TripPlannerForm)
    const loadItinerary = () => {
      try {
        // First try sessionStorage (from trip planner form)
        const generatedItinerary = sessionStorage.getItem('generatedItinerary');
        
        if (generatedItinerary) {
          const itineraryData = JSON.parse(generatedItinerary);
          
          if (itineraryData.itinerary && Array.isArray(itineraryData.itinerary)) {
            const itineraryWithDates = itineraryData.itinerary.map((day: any) => ({
              ...day,
              date: typeof day.date === 'string' ? new Date(day.date) : day.date,
            }));
            setItinerary(itineraryWithDates);
            localStorage.setItem('currentTrip', generatedItinerary);
            setLoading(false);
            return;
          }
        }
        
        // Fallback to localStorage
        const savedTrip = localStorage.getItem('currentTrip');
        
        if (savedTrip) {
          const trip = JSON.parse(savedTrip);
          
          if (trip.itinerary && Array.isArray(trip.itinerary)) {
            const itineraryWithDates = trip.itinerary.map((day: any) => ({
              ...day,
              date: typeof day.date === 'string' ? new Date(day.date) : day.date,
            }));
            setItinerary(itineraryWithDates);
            setLoading(false);
            return;
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading itinerary:', error);
        setLoading(false);
      }
    };

    loadItinerary();
  }, [tripId]);

  const handleChatWithAssistant = () => {
    navigate(`/chat${tripId ? `/${tripId}` : ''}`);
  };

  const handleSaveTrip = () => {
    try {
      const savedTrip = localStorage.getItem('currentTrip') || sessionStorage.getItem('generatedItinerary');
      if (savedTrip) {
        const trip = JSON.parse(savedTrip);
        const savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
        savedTrips.push({
          ...trip,
          savedAt: new Date().toISOString(),
        });
        localStorage.setItem('savedTrips', JSON.stringify(savedTrips));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving trip:', error);
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
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push({
      ...bookingData,
      bookingId: `booking-${Date.now()}`,
      bookedAt: new Date().toISOString(),
    });
    localStorage.setItem('bookings', JSON.stringify(bookings));
    setShowBookingModal(false);
  };

  const handleLoadSample = (sample: CuratedTripSample) => {
    setLoading(true);
    try {
      const result = generateMockItinerary({
        destination: sample.destinationName,
        startDate: new Date(),
        endDate: new Date(Date.now() + sample.durationDays * 24 * 60 * 60 * 1000),
        budget: sample.budget,
        interests: sample.interests as any
      });

      if (result.success && result.data) {
        setItinerary(result.data.itinerary);
        sessionStorage.setItem('generatedItinerary', JSON.stringify(result.data));
        localStorage.setItem('currentTrip', JSON.stringify(result.data));
      }
    } catch (e) {
      console.error('Failed to load sample itinerary:', e);
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Mock offers data
  const offers = [
    {
      id: 1,
      title: 'Luxury Boutique Stay Package',
      destination: itinerary?.[0]?.places[0]?.name ? `${itinerary[0].places[0].name} Quarter` : 'City Center',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      originalPrice: 450,
      discountPrice: 299,
      discount: '33% OFF',
      rating: 4.8,
      reviews: 1234,
      features: ['Free Breakfast', 'Airport Transfer', 'Spa Access'],
    },
    {
      id: 2,
      title: 'VIP Guided Excursion Bundle',
      destination: 'Local Landmarks & Highlights',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      originalPrice: 380,
      discountPrice: 249,
      discount: '35% OFF',
      rating: 4.9,
      reviews: 856,
      features: ['Skip-the-line Pass', 'Private Transport', 'Audio Guide'],
    },
    {
      id: 3,
      title: 'Scenic Panorama & Sunset Cruise',
      destination: 'Coastal & Waterfront Zone',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      originalPrice: 520,
      discountPrice: 349,
      discount: '33% OFF',
      rating: 4.7,
      reviews: 2103,
      features: ['Welcome Drinks', 'Chef Tasting Dinner', 'Live Music'],
    },
    {
      id: 4,
      title: 'City Explorer All-Access Pass',
      destination: 'Downtown & Cultural District',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
      originalPrice: 280,
      discountPrice: 199,
      discount: '29% OFF',
      rating: 4.6,
      reviews: 1567,
      features: ['10+ Museums', 'Unlimited Metro', 'Food Tasting Discounts'],
    },
  ];

  if (loading) {
    return (
      <div className="itinerary-page-wrapper">
        <div className="itinerary-page-content">
          <LoadingSpinner size="lg" message="Loading your travel itinerary..." />
        </div>
      </div>
    );
  }

  // Destination name from places or stored data
  const totalPlaces = itinerary 
    ? itinerary.reduce((acc, day) => acc + (day.places?.length || 0), 0)
    : 0;

  return (
    <div className="itinerary-page-wrapper">
      <div className="itinerary-page-content">
        {/* Page Header */}
        <div className="itinerary-page-header">
          <div className="itinerary-header-pill">
            <Compass size={14} />
            <span>Personal Travel Hub</span>
          </div>

          <div className="itinerary-header-top-row">
            <div>
              <h1 className="itinerary-main-heading">
                My <span className="text-highlight">Trips & Itineraries</span>
              </h1>
              <p className="itinerary-header-subtext">
                Explore your personalized day-by-day travel plan, active trip companion modes, and verified travel deals.
              </p>
            </div>

            {itinerary && itinerary.length > 0 && (
              <button 
                type="button"
                className={`trip-mode-pill-btn ${tripMode ? 'active' : ''}`}
                onClick={handleToggleTripMode}
              >
                <span className="mode-dot"></span>
                <span>{tripMode ? 'Trip Mode Active' : 'Start Trip Mode'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. EMPTY STATE WITH CURATED SAMPLES */}
        {(!itinerary || itinerary.length === 0) ? (
          <div className="empty-itinerary-hub">
            <div className="empty-state-card">
              <div className="empty-state-icon-circle">
                <Compass size={36} />
              </div>
              <h2>No Active Trip Itinerary Yet</h2>
              <p>
                You haven't generated or saved a trip itinerary yet. Create a customized journey tailored to your preferences, or preview one of our curated destination samples below.
              </p>
              <button 
                type="button" 
                className="btn-pill-green"
                onClick={() => navigate('/plan-trip')}
              >
                <Sparkles size={16} />
                <span>Plan a New Trip</span>
              </button>
            </div>

            {/* Curated Sample Itineraries */}
            <div className="curated-samples-section">
              <div className="curated-samples-header">
                <div>
                  <h3>Explore Curated Itineraries</h3>
                  <p>Click any journey to preview and load its interactive day-by-day schedule.</p>
                </div>
              </div>

              <div className="sample-trips-grid">
                {SAMPLE_CURATED_TRIPS.map((sample) => (
                  <article key={sample.id} className="sample-trip-card">
                    <div className="sample-trip-image-wrap">
                      <img src={sample.image} alt={sample.title} loading="lazy" />
                      <span className="sample-trip-badge">{sample.tag}</span>
                    </div>

                    <div className="sample-trip-body">
                      <h4 className="sample-trip-title">{sample.title}</h4>
                      <p className="sample-trip-desc">{sample.description}</p>

                      <div className="sample-trip-footer">
                        <span className="sample-duration">{sample.durationDays} Days Curated</span>
                        <button
                          type="button"
                          className="btn-load-sample"
                          onClick={() => handleLoadSample(sample)}
                        >
                          <span>Load Itinerary</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* 2. ACTIVE ITINERARY DISPLAY */
          <div>
            {/* Trip Overview Summary Card */}
            <div className="itinerary-summary-card">
              <div className="summary-details">
                <div className="summary-destination-badge">
                  <MapPin size={15} />
                  <span>Personalized Travel Route</span>
                </div>
                <h2 className="summary-title">
                  {itinerary.length}-Day Curated Journey Schedule
                </h2>
                <div className="summary-meta-pills">
                  <span className="summary-meta-pill">
                    <Calendar size={13} />
                    <span>{itinerary.length} Travel Days</span>
                  </span>
                  <span className="summary-meta-pill">
                    <Clock size={13} />
                    <span>{totalPlaces} Curated Places</span>
                  </span>
                  <span className="summary-meta-pill">
                    <Sparkles size={13} />
                    <span>AI Route Optimized</span>
                  </span>
                </div>
              </div>

              <div className="summary-actions">
                <button
                  type="button"
                  className="btn-pill-green"
                  onClick={handleChatWithAssistant}
                >
                  <span>Chat with Assistant</span>
                </button>
                <button
                  type="button"
                  className="btn-pill-outline"
                  onClick={handleSaveTrip}
                >
                  <Bookmark size={15} />
                  <span>{saveSuccess ? 'Saved to Trips ✓' : 'Save Trip'}</span>
                </button>
                <button
                  type="button"
                  className="btn-pill-outline"
                  onClick={() => navigate('/plan-trip')}
                >
                  <span>Plan Another</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs (Malvora Pill Tabs) */}
            <div className="itinerary-nav-row">
              <div className="itinerary-tabs-group">
                <button
                  type="button"
                  className={`itinerary-nav-tab ${activeTab === 'itinerary' ? 'active' : ''}`}
                  onClick={() => setActiveTab('itinerary')}
                >
                  <Calendar size={15} />
                  <span>Day-by-Day Itinerary</span>
                </button>
                <button
                  type="button"
                  className={`itinerary-nav-tab ${activeTab === 'offers' ? 'active' : ''}`}
                  onClick={() => setActiveTab('offers')}
                >
                  <Sparkles size={15} />
                  <span>Exclusive Deals & Offers</span>
                </button>
              </div>
            </div>

            {/* Tab 1: Itinerary Timeline */}
            {activeTab === 'itinerary' && (
              <div>
                <ItineraryTimeline itinerary={itinerary} />
                <ActionButtons
                  onChatWithAssistant={handleChatWithAssistant}
                  onSaveTrip={handleSaveTrip}
                />
              </div>
            )}

            {/* Tab 2: Special Deals & Offers */}
            {activeTab === 'offers' && (
              <div className="offers-section">
                <div className="offers-header">
                  <h2>Curated Benefits & Deals</h2>
                  <p>Exclusive hotel discounts and tour packages verified for your journey.</p>
                </div>

                <div className="offers-grid">
                  {offers.map((offer) => (
                    <div key={offer.id} className="offer-card">
                      <div className="offer-image-container">
                        <img src={offer.image} alt={offer.title} className="offer-image" loading="lazy" />
                        <span className="offer-badge">{offer.discount}</span>
                      </div>

                      <div className="offer-content">
                        <h3>{offer.title}</h3>
                        <p className="offer-destination">📍 {offer.destination}</p>

                        <div className="offer-rating">
                          <span className="stars">★ {offer.rating}</span>
                          <span className="reviews">({offer.reviews} verified reviews)</span>
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
                            type="button"
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
    </div>
  );
};

export default ItineraryPage;