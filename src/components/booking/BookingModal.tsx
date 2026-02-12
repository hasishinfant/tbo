import React, { useState } from 'react';
import './BookingModal.css';

interface BookingModalProps {
  destination: string;
  onClose: () => void;
  onBook: (bookingData: BookingData) => void;
}

export interface BookingData {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomType: string;
  totalPrice: number;
}

const BookingModal: React.FC<BookingModalProps> = ({ destination, onClose, onBook }) => {
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 2,
    roomType: 'standard',
  });

  const roomPrices = {
    standard: 120,
    deluxe: 180,
    suite: 280,
  };

  const calculateTotal = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) return 0;
    
    const basePrice = roomPrices[formData.roomType as keyof typeof roomPrices];
    return basePrice * nights;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bookingData: BookingData = {
      destination,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      guests: formData.guests,
      roomType: formData.roomType,
      totalPrice: calculateTotal(),
    };
    
    onBook(bookingData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const total = calculateTotal();
  const nights = formData.checkIn && formData.checkOut 
    ? Math.ceil((new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="booking-header">
          <h2>Book Your Stay</h2>
          <p className="booking-destination">📍 {destination}</p>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="checkIn">Check-in Date</label>
              <input
                type="date"
                id="checkIn"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="checkOut">Check-out Date</label>
              <input
                type="date"
                id="checkOut"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleChange}
                min={formData.checkIn || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="guests">Number of Guests</label>
              <input
                type="number"
                id="guests"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                min="1"
                max="10"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="roomType">Room Type</label>
              <select
                id="roomType"
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
                required
              >
                <option value="standard">Standard Room - $120/night</option>
                <option value="deluxe">Deluxe Room - $180/night</option>
                <option value="suite">Suite - $280/night</option>
              </select>
            </div>
          </div>

          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <div className="summary-row">
              <span>Room Type:</span>
              <span className="summary-value">
                {formData.roomType.charAt(0).toUpperCase() + formData.roomType.slice(1)}
              </span>
            </div>
            <div className="summary-row">
              <span>Guests:</span>
              <span className="summary-value">{formData.guests}</span>
            </div>
            {nights > 0 && (
              <>
                <div className="summary-row">
                  <span>Nights:</span>
                  <span className="summary-value">{nights}</span>
                </div>
                <div className="summary-row">
                  <span>Price per night:</span>
                  <span className="summary-value">
                    ${roomPrices[formData.roomType as keyof typeof roomPrices]}
                  </span>
                </div>
              </>
            )}
            <div className="summary-divider"></div>
            <div className="summary-row summary-total">
              <span>Total:</span>
              <span className="summary-value">${total}</span>
            </div>
          </div>

          <div className="booking-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={total === 0}>
              Confirm Booking
            </button>
          </div>
        </form>

        <div className="booking-features">
          <div className="feature">
            <span className="feature-icon">✓</span>
            <span>Free cancellation</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✓</span>
            <span>No prepayment needed</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✓</span>
            <span>Best price guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
