/**
 * Guest Details Form Component
 * 
 * Collects guest information for each room in the booking.
 * Supports multiple rooms with different guest configurations.
 * Validates all required fields before submission.
 * 
 * Requirements: 4.1
 */

import React, { useState } from 'react';
import { GuestDetails, CustomerName, HotelBookingSession, PaymentInfo } from '../../services/hotelBookingService';
import './GuestDetailsForm.css';

// ============================================================================
// Types
// ============================================================================

interface GuestDetailsFormProps {
  session: HotelBookingSession;
  onSubmit: (guestDetails: GuestDetails[], paymentInfo: PaymentInfo) => void;
  onBack: () => void;
}

interface FormErrors {
  [key: string]: string;
}

// ============================================================================
// Component
// ============================================================================

export const GuestDetailsForm: React.FC<GuestDetailsFormProps> = ({
  session,
  onSubmit,
  onBack,
}) => {
  const [guestDetails, setGuestDetails] = useState<GuestDetails[]>(
    initializeGuestDetails(session)
  );
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGuestChange = (
    roomIndex: number,
    guestIndex: number,
    field: keyof CustomerName,
    value: string
  ) => {
    const updated = [...guestDetails];
    updated[roomIndex].customerNames[guestIndex] = {
      ...updated[roomIndex].customerNames[guestIndex],
      [field]: value,
    };
    setGuestDetails(updated);

    // Clear error for this field
    const errorKey = `room${roomIndex}_guest${guestIndex}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate phone
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]{10,}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Validate guest details
    guestDetails.forEach((room, roomIndex) => {
      room.customerNames.forEach((guest, guestIndex) => {
        if (!guest.title) {
          newErrors[`room${roomIndex}_guest${guestIndex}_title`] = 'Title is required';
        }
        if (!guest.firstName.trim()) {
          newErrors[`room${roomIndex}_guest${guestIndex}_firstName`] = 'First name is required';
        }
        if (!guest.lastName.trim()) {
          newErrors[`room${roomIndex}_guest${guestIndex}_lastName`] = 'Last name is required';
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const paymentInfo: PaymentInfo = {
        method: 'credit_card',
        emailId: email,
        phoneNumber: phone,
      };

      onSubmit(guestDetails, paymentInfo);
    } catch (error) {
      console.error('Form submission error:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="guest-details-form">
      <div className="form-header">
        <h2>Guest Details</h2>
        <p>Please provide information for all guests</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Guest Information by Room */}
        {guestDetails.map((room, roomIndex) => (
          <div key={roomIndex} className="room-section">
            <h3>Room {roomIndex + 1}</h3>
            <p className="room-info">
              {session.searchCriteria.paxRooms[roomIndex].adults} Adult(s)
              {session.searchCriteria.paxRooms[roomIndex].children > 0 && 
                `, ${session.searchCriteria.paxRooms[roomIndex].children} Child(ren)`
              }
            </p>

            <div className="guests-grid">
              {room.customerNames.map((guest, guestIndex) => (
                <div key={guestIndex} className="guest-card">
                  <h4>
                    {guest.type === 'Adult' ? 'Adult' : 'Child'} {guestIndex + 1}
                  </h4>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor={`room${roomIndex}_guest${guestIndex}_title`}>
                        Title <span className="required">*</span>
                      </label>
                      <select
                        id={`room${roomIndex}_guest${guestIndex}_title`}
                        value={guest.title}
                        onChange={(e) => handleGuestChange(roomIndex, guestIndex, 'title', e.target.value)}
                        className={errors[`room${roomIndex}_guest${guestIndex}_title`] ? 'error' : ''}
                      >
                        <option value="">Select</option>
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Ms">Ms</option>
                        <option value="Miss">Miss</option>
                        <option value="Dr">Dr</option>
                      </select>
                      {errors[`room${roomIndex}_guest${guestIndex}_title`] && (
                        <span className="error-message">
                          {errors[`room${roomIndex}_guest${guestIndex}_title`]}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor={`room${roomIndex}_guest${guestIndex}_firstName`}>
                        First Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id={`room${roomIndex}_guest${guestIndex}_firstName`}
                        value={guest.firstName}
                        onChange={(e) => handleGuestChange(roomIndex, guestIndex, 'firstName', e.target.value)}
                        className={errors[`room${roomIndex}_guest${guestIndex}_firstName`] ? 'error' : ''}
                        placeholder="Enter first name"
                      />
                      {errors[`room${roomIndex}_guest${guestIndex}_firstName`] && (
                        <span className="error-message">
                          {errors[`room${roomIndex}_guest${guestIndex}_firstName`]}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor={`room${roomIndex}_guest${guestIndex}_lastName`}>
                        Last Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id={`room${roomIndex}_guest${guestIndex}_lastName`}
                        value={guest.lastName}
                        onChange={(e) => handleGuestChange(roomIndex, guestIndex, 'lastName', e.target.value)}
                        className={errors[`room${roomIndex}_guest${guestIndex}_lastName`] ? 'error' : ''}
                        placeholder="Enter last name"
                      />
                      {errors[`room${roomIndex}_guest${guestIndex}_lastName`] && (
                        <span className="error-message">
                          {errors[`room${roomIndex}_guest${guestIndex}_lastName`]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Contact Information */}
        <div className="contact-section">
          <h3>Contact Information</h3>
          <p className="section-description">
            We'll send your booking confirmation to this email and phone number
          </p>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'error' : ''}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                Phone Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={errors.phone ? 'error' : ''}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <span className="error-message">{errors.phone}</span>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onBack}
            className="btn-back"
            disabled={isSubmitting}
          >
            Back
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Continue to Payment'}
          </button>
        </div>
      </form>
    </div>
  );
};

// ============================================================================
// Helper Functions
// ============================================================================

function initializeGuestDetails(session: HotelBookingSession): GuestDetails[] {
  return session.searchCriteria.paxRooms.map((room, roomIndex) => {
    const customerNames: CustomerName[] = [];

    // Add adults
    for (let i = 0; i < room.adults; i++) {
      customerNames.push({
        title: '',
        firstName: '',
        lastName: '',
        type: 'Adult',
      });
    }

    // Add children
    for (let i = 0; i < room.children; i++) {
      customerNames.push({
        title: '',
        firstName: '',
        lastName: '',
        type: 'Child',
      });
    }

    return {
      roomIndex,
      customerNames,
    };
  });
}

export default GuestDetailsForm;
