import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Calendar, MapPin, Users, ArrowRight, ChevronDown, 
  ChevronUp, Star, Play, Check, Sparkles, Compass, 
  ArrowLeft, Heart, ShieldCheck, Mail
} from 'lucide-react';
import DestinationGrid from '../components/destination/DestinationGrid';
import { MOCK_DESTINATIONS } from '../services/mockDataService';
import { FloatingAIAssistant } from '../components/home/FloatingAIAssistant';
import './HomePage.css';


const CURATED_EVENTS = [
  {
    id: 'swiss-alps',
    title: 'Exploring the Hidden Wonders of the Alpine Adventure',
    location: 'Zermatt, Switzerland',
    dates: 'May 14 - May 21',
    rating: 4.9,
    price: '$420',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80',
    tag: 'Mountain Hike',
    destinationId: 'santorini'
  },
  {
    id: 'kyoto-cultural',
    title: 'Embark on a Cultural Journey Across Ancient Temples',
    location: 'Kyoto, Japan',
    dates: 'Jun 10 - Jun 18',
    rating: 4.8,
    price: '$340',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
    tag: 'Heritage & Food',
    destinationId: 'tokyo'
  },
  {
    id: 'banff-lakes',
    title: 'Discover Majestic Turquoise Lakes and Scenic Wilderness',
    location: 'Banff, Canada',
    dates: 'Jul 04 - Jul 12',
    rating: 4.9,
    price: '$460',
    image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800&q=80',
    tag: 'Eco Adventure',
    destinationId: 'bali'
  }
];

const FAQ_ITEMS = [
  {
    q: "How do I plan a trip with TravelSphere?",
    a: "Simply head to the Plan Trip section and enter your preferred destination, travel dates, budget, and interests. Our AI will analyze flight options, hotel availability, and local experiences to generate a personalized itinerary within seconds."
  },
  {
    q: "Can I customize my AI-generated itinerary?",
    a: "Yes! Every activity, meal recommendation, and hotel selection can be adjusted or swapped. You can add custom notes, change activity timings, or ask the AI Travel Assistant to optimize for a relaxed or packed pace."
  },
  {
    q: "How does the AI Confidence Engine work?",
    a: "Our proprietary Confidence Engine evaluates thousands of factors including weather reliability, safety indexes, booking demand, user satisfaction, and pricing trends to compute a transparent 0-100 score for every destination and hotel."
  },
  {
    q: "What types of trips can I organize?",
    a: "From weekend getaways and solo backpacking trips to romantic honeymoons, luxury retreats, and family vacations, TravelSphere tailors activities and pacing to match your exact group dynamic and preferences."
  },
  {
    q: "How does 24/7 emergency support work?",
    a: "Our Emergency Support hub provides immediate contact information for local embassies, hospitals, and police services for your active destination, alongside 24/7 AI-guided SOS protocols and quick rebooking assistance."
  }
];

const SERVICES_ACCORDION = [
  {
    title: "Consultation & AI Trip Planning",
    desc: "Personalized intelligent destination recommendations and smart budget optimization based on real-time travel intelligence."
  },
  {
    title: "Customized Itinerary & Instant Booking",
    desc: "Day-by-day curated schedules with verified hotel ratings, flight connections, and local hidden gems mapped out seamlessly."
  },
  {
    title: "Seamless Payment & Live Re-pricing",
    desc: "Once your itinerary is finalized, secure bookings with real-time rate tracking, ensuring you get transparent pricing with zero surprise charges."
  },
  {
    title: "Journey Assistance & 24/7 Support",
    desc: "Interactive in-trip AI companion to answer on-the-go queries, suggest nearby eateries, and provide safety assistance whenever you need it."
  }
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Search widget states
  const [activeTab, setActiveTab] = useState<'all' | 'hotels' | 'flights' | 'itineraries'>('all');
  const [searchLocation, setSearchLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2 Guests');
  const [activeFilterTag, setActiveFilterTag] = useState('All');

  // Accordion states
  const [openService, setOpenService] = useState<number | null>(2); // 3rd item open by default like mockup
  const [openFaq, setOpenFaq] = useState<number | null>(0); // 1st FAQ open by default

  const handlePlanTrip = (destinationId: string) => {
    navigate(`/plan-trip?destination=${destinationId}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'hotels') {
      navigate(`/book-hotels${searchLocation ? `?location=${encodeURIComponent(searchLocation)}` : ''}`);
    } else {
      navigate(`/plan-trip${searchLocation ? `?destination=${encodeURIComponent(searchLocation)}` : ''}`);
    }
  };

  const handleFilterClick = (tag: string) => {
    setActiveFilterTag(tag);
  };

  const filteredDestinations = activeFilterTag === 'All' 
    ? MOCK_DESTINATIONS 
    : MOCK_DESTINATIONS.filter(d => 
        d.category.some(c => c.toLowerCase().includes(activeFilterTag.toLowerCase())) ||
        d.name.toLowerCase().includes(activeFilterTag.toLowerCase())
      );

  return (
    <div className="home-page-malvora">
      {/* 1. HERO SECTION */}
      <section className="malvora-hero">
        <div className="hero-background-image" />
        <div className="hero-dark-overlay" />
        
        <div className="hero-content-container">
          {/* Top Pill Chip */}
          <div className="hero-pill-badge">
            <span className="hero-pill-icon">🌿</span>
            <span>Travel More, Worry Less</span>
          </div>

          {/* Main Headline */}
          <h1 className="hero-main-title">
            Explore the World, One <br />
            <span className="hero-title-highlight">Journey at a Time.</span>
          </h1>

          <p className="hero-subtext">
            Our AI travel companion offers personalized and hassle-free travel experiences, 
            tailored to meet your unique preferences and needs with verified confidence.
          </p>

          {/* Floating Search & Booking Card */}
          <div className="hero-search-card">
            {/* Category Pill Tabs */}
            <div className="search-pill-tabs">
              <button 
                type="button" 
                className={`search-tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Destinations
              </button>
              <button 
                type="button" 
                className={`search-tab ${activeTab === 'hotels' ? 'active' : ''}`}
                onClick={() => setActiveTab('hotels')}
              >
                Hotels
              </button>
              <button 
                type="button" 
                className={`search-tab ${activeTab === 'flights' ? 'active' : ''}`}
                onClick={() => setActiveTab('flights')}
              >
                Flights
              </button>
              <button 
                type="button" 
                className={`search-tab ${activeTab === 'itineraries' ? 'active' : ''}`}
                onClick={() => setActiveTab('itineraries')}
              >
                AI Itineraries
              </button>
            </div>

            {/* Inputs Grid */}
            <form onSubmit={handleSearchSubmit} className="search-inputs-form">
              <div className="search-input-field">
                <label>
                  <MapPin size={15} className="input-icon" /> Location
                </label>
                <input 
                  type="text" 
                  placeholder="Type the destination..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>

              <div className="search-input-divider" />

              <div className="search-input-field">
                <label>
                  <Calendar size={15} className="input-icon" /> Check In
                </label>
                <input 
                  type="date" 
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  placeholder="Add date"
                />
              </div>

              <div className="search-input-divider" />

              <div className="search-input-field">
                <label>
                  <Calendar size={15} className="input-icon" /> Check Out
                </label>
                <input 
                  type="date" 
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  placeholder="Add date"
                />
              </div>

              <div className="search-input-divider" />

              <div className="search-input-field">
                <label>
                  <Users size={15} className="input-icon" /> Participants
                </label>
                <select 
                  value={guests} 
                  onChange={(e) => setGuests(e.target.value)}
                  className="guests-select"
                >
                  <option value="1 Guest">1 Guest</option>
                  <option value="2 Guests">2 Guests</option>
                  <option value="3-4 Guests">3-4 Guests</option>
                  <option value="Family (5+)">Family (5+)</option>
                </select>
              </div>

              {/* Green Search Button */}
              <button type="submit" className="btn-hero-search">
                <Search size={18} />
                <span>Search</span>
              </button>
            </form>

            {/* Quick Filter Pills Row */}
            <div className="search-filters-row">
              <span className="filters-label">Filter:</span>
              <div className="filter-pill-group">
                {['All', 'Culture', 'Nature', 'Food', 'Beach', 'Urban'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`filter-chip ${activeFilterTag === tag ? 'active' : ''}`}
                    onClick={() => handleFilterClick(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR DESTINATIONS SECTION */}
      <section className="section-container popular-destinations-section">
        <div className="section-header-split">
          <div>
            <h2 className="section-title">
              Popular <span className="title-bold">destination</span>
            </h2>
            <p className="section-subtitle">Handpicked destinations with AI-powered confidence ratings</p>
          </div>
          <div className="header-slider-controls">
            <button 
              type="button" 
              className="slider-arrow-btn"
              onClick={() => {
                const el = document.querySelector('.destination-grid');
                if (el) el.scrollBy({ left: -320, behavior: 'smooth' });
              }}
              aria-label="Scroll left"
            >
              <ArrowLeft size={18} />
            </button>
            <button 
              type="button" 
              className="slider-arrow-btn"
              onClick={() => {
                const el = document.querySelector('.destination-grid');
                if (el) el.scrollBy({ left: 320, behavior: 'smooth' });
              }}
              aria-label="Scroll right"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <DestinationGrid
          destinations={filteredDestinations.length > 0 ? filteredDestinations : MOCK_DESTINATIONS}
          onPlanTrip={handlePlanTrip}
        />
      </section>

      {/* 4. EXPLORE EVENTS / TOP EXPERIENCES */}
      <section className="section-container explore-events-section">
        <div className="section-header-split">
          <div>
            <h2 className="section-title">
              Explore <span className="title-bold">experiences</span>
            </h2>
            <p className="section-subtitle">Curated adventure routes designed with personalized pacing</p>
          </div>
          <div className="events-search-bar">
            <div className="events-input-box">
              <Search size={16} />
              <input type="text" placeholder="Search by location..." />
            </div>
            <button type="button" className="btn-filter-pill">
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="events-cards-grid">
          {CURATED_EVENTS.map((item) => (
            <article key={item.id} className="event-experience-card">
              <div className="event-image-wrap">
                <img src={item.image} alt={item.title} loading="lazy" />
                <span className="event-pill-tag">{item.tag}</span>
                <button type="button" className="event-save-btn" aria-label="Save experience">
                  <Heart size={16} />
                </button>
              </div>

              <div className="event-body">
                <h3 className="event-card-title">{item.title}</h3>
                
                <div className="event-meta-row">
                  <span className="meta-item"><MapPin size={13} /> {item.location}</span>
                  <span className="meta-item"><Calendar size={13} /> {item.dates}</span>
                  <span className="meta-item rating"><Star size={13} fill="#f59e0b" color="#f59e0b" /> {item.rating}</span>
                </div>

                <div className="event-footer-row">
                  <div className="event-pricing">
                    <span className="price-bold">{item.price}</span>
                    <span className="price-sub">/ Night</span>
                  </div>
                  <button 
                    type="button" 
                    className="btn-view-details"
                    onClick={() => handlePlanTrip(item.destinationId)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5. LET'S TRAVEL / HOW IT WORKS ACCORDION */}
      <section className="section-container how-it-works-section">
        <div className="section-header-split">
          <div>
            <h2 className="section-title">
              How TravelSphere <span className="title-bold">works</span>
            </h2>
            <p className="section-subtitle">Seamless AI travel orchestration from inspiration to destination</p>
          </div>
          <button 
            type="button" 
            className="btn-all-services"
            onClick={() => navigate('/plan-trip')}
          >
            <span>Plan My Trip</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="how-it-works-grid">
          {/* Left Feature Media */}
          <div className="feature-media-card">
            <img 
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80" 
              alt="Traveler with backpack enjoying mountain vista" 
              loading="lazy"
            />
            <div className="media-overlay-content">
              <span className="media-pill-chip">Nature & Wonder</span>
              <button 
                type="button" 
                className="media-play-pill"
                onClick={() => navigate('/plan-trip')}
                title="Start AI Trip Demo"
              >
                <Play size={16} fill="currentColor" />
                <span>Experience Demo</span>
              </button>
            </div>
            <p className="media-caption">
              Begin a journey with a companion where your preferences, budget, and safety are harmonized into every day.
            </p>
          </div>

          {/* Right Accordion */}
          <div className="services-accordion-column">
            {SERVICES_ACCORDION.map((service, index) => {
              const isOpen = openService === index;
              return (
                <div 
                  key={service.title} 
                  className={`service-accordion-item ${isOpen ? 'open' : ''}`}
                  onClick={() => setOpenService(isOpen ? null : index)}
                >
                  <div className="accordion-item-header">
                    <h4>{service.title}</h4>
                    <span className="accordion-arrow">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </div>
                  {isOpen && (
                    <div className="accordion-item-body">
                      <p>{service.desc}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION SECTION */}
      <section className="section-container faq-section">
        <div className="faq-header-split">
          <div>
            <h2 className="section-title">
              Frequently Asked <span className="title-bold">Questions</span>
            </h2>
            <p className="section-subtitle">
              Everything you need to know about planning trips with our AI companion
            </p>
          </div>
          <p className="faq-side-note">
            Our experts and AI assist you in making informed travel choices tailored to different preferences and budgets.
          </p>
        </div>

        <div className="faq-accordion-list">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={item.q}
                className={`faq-item-card ${isOpen ? 'active' : ''}`}
                onClick={() => setOpenFaq(isOpen ? null : index)}
              >
                <div className="faq-question-row">
                  <span className="faq-question-text">{item.q}</span>
                  <span className="faq-toggle-icon">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </div>
                {isOpen && (
                  <div className="faq-answer-row">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. ADVENTURE FULL-WIDTH CTA BANNER */}
      <section className="adventure-cta-banner">
        <div className="adventure-bg-image" />
        <div className="adventure-overlay" />

        <div className="adventure-cta-content">
          <h2 className="adventure-cta-title">
            Discover the World, One <br />
            Adventure at a Time
          </h2>
          <p className="adventure-cta-subtext">
            Travel Beyond Limits. Explore Without Boundaries. See the World Like Never Before.
          </p>
          <button 
            type="button" 
            className="btn-adventure-action"
            onClick={() => navigate('/plan-trip')}
          >
            <span>Get Started</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* 9. MINIMALIST FOOTER */}
      <footer className="malvora-footer">
        <div className="footer-inner-container">
          <div className="footer-top-grid">
            {/* Column 1: Brand & Newsletter */}
            <div className="footer-brand-column">
              <h3 className="footer-tagline">
                Discover Nature's Wonders <br />
                with Expert Guidance
              </h3>

              <div className="footer-logo-row">
                <div className="brand-logo-pill">🌿</div>
                <span className="brand-name">
                  Travel<span className="brand-accent">Sphere</span>
                </span>
              </div>

              <p className="footer-newsletter-text">
                Subscribe to our newsletter to stay up-to-date on curated destinations and exclusive offers.
              </p>

              <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to TravelSphere updates!'); }} className="footer-subscribe-form">
                <div className="subscribe-input-wrap">
                  <Mail size={16} className="mail-icon" />
                  <input type="email" placeholder="Enter your email" required />
                </div>
                <button type="submit" className="btn-pill-green">
                  Subscribe
                </button>
              </form>
            </div>

            {/* Column 2: Navigation */}
            <div className="footer-links-column">
              <h4>Quick Links</h4>
              <ul>
                <li><button type="button" onClick={() => navigate('/')}>Home</button></li>
                <li><button type="button" onClick={() => navigate('/plan-trip')}>Plan Trip</button></li>
                <li><button type="button" onClick={() => navigate('/book-hotels')}>Book Hotels</button></li>
                <li><button type="button" onClick={() => navigate('/itinerary')}>My Trips</button></li>
                <li><button type="button" onClick={() => navigate('/chat')}>AI Travel Assistant</button></li>
                <li><button type="button" onClick={() => navigate('/emergency-support')}>Emergency SOS</button></li>
              </ul>
            </div>

            {/* Column 3: Features */}
            <div className="footer-links-column">
              <h4>Features</h4>
              <ul>
                <li><button type="button" onClick={() => navigate('/plan-trip')}>AI Itineraries</button></li>
                <li><button type="button" onClick={() => navigate('/')}>Confidence Meter</button></li>
                <li><button type="button" onClick={() => navigate('/book-hotels')}>Hotel Comparison</button></li>
                <li><button type="button" onClick={() => navigate('/')}>VR 360° Preview</button></li>
                <li><button type="button" onClick={() => navigate('/chat')}>Voice & Text Chat</button></li>
              </ul>
            </div>

            {/* Column 4: Contact & Safety */}
            <div className="footer-links-column">
              <h4>24/7 Support</h4>
              <p className="footer-contact-item">Emergency Dispatch: +1 (800) 555-SAFE</p>
              <p className="footer-contact-item">AI Assistant: Active 24/7 Online</p>
              <div 
                className="footer-emergency-pill"
                onClick={() => navigate('/emergency-support')}
              >
                <ShieldCheck size={16} />
                <span>Emergency Safety Hub</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <p>© {new Date().getFullYear()} TravelSphere Technologies. All rights reserved.</p>
            <div className="footer-legal-links">
              <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
              <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>
              <a href="#cookies" onClick={(e) => e.preventDefault()}>Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating TravelSphere AI Assistant */}
      <FloatingAIAssistant />
    </div>
  );
};

export default HomePage;