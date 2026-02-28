/**
 * Hotel Details Modal Component
 * 
 * Displays detailed hotel information in a modal:
 * - Hotel description and overview
 * - Amenities and facilities
 * - Hotel images in gallery
 * - Check-in/check-out times
 * - Cancellation policies
 * 
 * Requirements: 2.2, 2.5
 */

import React, { useState, useEffect } from 'react';
import { getHotelDetailsService } from '../../services/hotelDetailsService';
import type { HotelResult } from '../../services/hotelSearchService';
import type { HotelDetail } from '../../types/tboHotelApi';
import './HotelDetailsModal.css';

interface HotelDetailsModalProps {
  hotel: HotelResult;
  isOpen: boolean;
  onClose: () => void;
  onBookNow?: (hotel: HotelResult) => void;
}

const HotelDetailsModal: React.FC<HotelDetailsModalProps> = ({
  hotel,
  isOpen,
  onClose,
  onBookNow,
}) => {
  const hotelDetailsService = getHotelDetailsService();
  
  const [hotelDetails, setHotelDetails] = useState<HotelDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen && hotel) {
      loadHotelDetails();
    }
  }, [isOpen, hotel]);

  const loadHotelDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const details = await hotelDetailsService.getHotelDetails(hotel.hotelCode);
      // @ts-expect-error - API returns array but we expect single object
      setHotelDetails(details);
    } catch (err) {
      console.error('Failed to load hotel details:', err);
      setError('Unable to load hotel details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleBookNow = () => {
    onBookNow?.(hotel);
  };

  const handlePrevImage = () => {
    const images = hotelDetails?.Images || hotel.hotelImages;
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    const images = hotelDetails?.Images || hotel.hotelImages;
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!isOpen) return null;

  const images = hotelDetails?.Images || hotel.hotelImages || [hotel.hotelPicture];
  const currentImage = images[currentImageIndex];

  return (
    <div className="hotel-details-modal-overlay" onClick={handleBackdropClick}>
      <div className="hotel-details-modal">
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {/* Image Gallery */}
        <div className="modal-image-gallery">
          <img src={currentImage} alt={hotel.hotelName} />
          
          {images.length > 1 && (
            <>
              <button
                className="gallery-nav-btn prev"
                onClick={handlePrevImage}
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                className="gallery-nav-btn next"
                onClick={handleNextImage}
                aria-label="Next image"
              >
                ›
              </button>
              <div className="gallery-indicators">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Modal Content */}
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <div className="hotel-title-section">
              <h2>{hotel.hotelName}</h2>
              <div className="star-rating">
                {Array.from({ length: hotel.starRating }, (_, i) => (
                  <span key={i} className="star">⭐</span>
                ))}
              </div>
            </div>
            <p className="hotel-address">
              📍 {hotelDetails?.Address || hotel.address}, {hotel.cityName}, {hotel.countryName}
            </p>
            {hotelDetails?.PhoneNumber && (
              <p className="hotel-contact">📞 {hotelDetails.PhoneNumber}</p>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="loading-section">
              <div className="loading-spinner"></div>
              <p>Loading hotel details...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-section">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {/* Hotel Details */}
          {!isLoading && !error && (
            <>
              {/* Description */}
              {hotelDetails?.Description && (
                <section className="details-section">
                  <h3>About This Hotel</h3>
                  <p className="hotel-description">{hotelDetails.Description}</p>
                </section>
              )}

              {/* Room Details */}
              <section className="details-section">
                <h3>Room Details</h3>
                <div className="room-info-grid">
                  <div className="info-item">
                    <span className="info-label">Room Type:</span>
                    <span className="info-value">{hotel.roomType}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Meal Plan:</span>
                    <span className="info-value">{hotel.mealType}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Available Rooms:</span>
                    <span className="info-value">{hotel.availableRooms}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Cancellation:</span>
                    <span className={`info-value ${hotel.refundable ? 'refundable' : 'non-refundable'}`}>
                      {hotel.refundable ? 'Free Cancellation' : 'Non-Refundable'}
                    </span>
                  </div>
                </div>
              </section>

              {/* Amenities */}
              {(hotel.amenities.length > 0 || hotelDetails?.HotelFacilities) && (
                <section className="details-section">
                  <h3>Amenities & Facilities</h3>
                  <div className="amenities-grid">
                    {(hotelDetails?.HotelFacilities || hotel.amenities).map((amenity, index) => (
                      <div key={index} className="amenity-item">
                        <span className="amenity-icon">✓</span>
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Hotel Policy */}
              {hotelDetails?.HotelPolicy && (
                <section className="details-section">
                  <h3>Hotel Policies</h3>
                  <div className="policy-grid">
                    <div className="policy-item">
                      <span className="policy-icon">🕐</span>
                      <div className="policy-content">
                        <strong>Check-in Time:</strong>
                        <p>{hotelDetails.HotelPolicy.CheckInTime}</p>
                      </div>
                    </div>
                    <div className="policy-item">
                      <span className="policy-icon">🕐</span>
                      <div className="policy-content">
                        <strong>Check-out Time:</strong>
                        <p>{hotelDetails.HotelPolicy.CheckOutTime}</p>
                      </div>
                    </div>
                    {hotelDetails.HotelPolicy.CancellationPolicy && (
                      <div className="policy-item full-width">
                        <span className="policy-icon">📋</span>
                        <div className="policy-content">
                          <strong>Cancellation Policy:</strong>
                          <p>{hotelDetails.HotelPolicy.CancellationPolicy}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Nearby Attractions */}
              {hotelDetails?.Attractions && hotelDetails.Attractions.length > 0 && (
                <section className="details-section">
                  <h3>Nearby Attractions</h3>
                  <div className="attractions-list">
                    {hotelDetails.Attractions.map((attraction, index) => (
                      <div key={index} className="attraction-item">
                        <span className="attraction-icon">📍</span>
                        <div>
                          <strong>{attraction.Key}</strong>
                          <p>{attraction.Value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Location Map */}
              {hotelDetails?.Map && (
                <section className="details-section">
                  <h3>Location</h3>
                  <div className="map-info">
                    <p>
                      <strong>Coordinates:</strong> {hotelDetails.Map.Latitude}, {hotelDetails.Map.Longitude}
                    </p>
                  </div>
                </section>
              )}
            </>
          )}

          {/* Pricing and Booking */}
          <div className="modal-footer">
            <div className="price-section">
              <div className="price-details">
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
            </div>
            
            <button className="btn-book-now" onClick={handleBookNow}>
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetailsModal;
