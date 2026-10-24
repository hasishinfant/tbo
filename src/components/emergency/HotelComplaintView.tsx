import React, { useState, useEffect } from 'react';
import { 
  Hotel, ArrowLeft, CheckCircle2, AlertTriangle, Search, 
  Calendar, MapPin, Building, ShieldCheck, Upload, Trash2, 
  Clock, Check, Phone, Mail, MessageSquare, AlertCircle
} from 'lucide-react';
import { 
  complaintService, 
  AvailableHotel, 
  HotelComplaintRecord, 
  SeverityLevel 
} from '@/services/complaintService';

interface HotelComplaintViewProps {
  onBack: () => void;
  onSuccessTrack: (requestId: string) => void;
}

export const HotelComplaintView: React.FC<HotelComplaintViewProps> = ({
  onBack,
  onSuccessTrack,
}) => {
  const [hotels, setHotels] = useState<AvailableHotel[]>([]);
  const [hotelSelectionMode, setHotelSelectionMode] = useState<'booked' | 'directory' | 'external'>('booked');
  
  // Selected hotel fields
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');
  const [hotelSearchQuery, setHotelSearchQuery] = useState<string>('');
  const [manualHotelName, setManualHotelName] = useState<string>('');
  const [manualHotelCity, setManualHotelCity] = useState<string>('');
  const [manualBookingRef, setManualBookingRef] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [checkOutDate, setCheckOutDate] = useState<string>('');

  // Complaint details
  const [complaintCategory, setComplaintCategory] = useState<HotelComplaintRecord['complaintCategory']>('room_cleanliness');
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [severity, setSeverity] = useState<SeverityLevel>('medium');
  const [preferredResolution, setPreferredResolution] = useState<HotelComplaintRecord['preferredResolution']>('room_change');
  const [contactNumber, setContactNumber] = useState<string>('+1 (555) 234-5678');
  const [contactPreference, setContactPreference] = useState<'phone' | 'email' | 'whatsapp'>('phone');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [attachmentInput, setAttachmentInput] = useState<string>('');

  // Form states
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRecord, setSubmittedRecord] = useState<HotelComplaintRecord | null>(null);

  useEffect(() => {
    const available = complaintService.getAvailableHotels();
    setHotels(available);

    // Default select first booked hotel if available
    const firstBooking = available.find(h => h.isUserBooking);
    if (firstBooking) {
      setSelectedHotelId(firstBooking.id);
      setCheckInDate(firstBooking.checkIn || '');
      setCheckOutDate(firstBooking.checkOut || '');
    } else if (available.length > 0) {
      setSelectedHotelId(available[0].id);
    }
  }, []);

  const userBookings = hotels.filter(h => h.isUserBooking);
  const directoryHotels = hotels.filter(h => 
    !hotelSearchQuery || 
    h.name.toLowerCase().includes(hotelSearchQuery.toLowerCase()) ||
    h.city.toLowerCase().includes(hotelSearchQuery.toLowerCase())
  );

  const selectedHotel = hotels.find(h => h.id === selectedHotelId);

  const handleSelectBooking = (hotel: AvailableHotel) => {
    setSelectedHotelId(hotel.id);
    if (hotel.checkIn) setCheckInDate(hotel.checkIn);
    if (hotel.checkOut) setCheckOutDate(hotel.checkOut);
  };

  const handleAddAttachment = () => {
    if (!attachmentInput.trim()) return;
    setAttachments(prev => [...prev, attachmentInput.trim()]);
    setAttachmentInput('');
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (hotelSelectionMode === 'external') {
      if (!manualHotelName.trim()) {
        errors.hotelName = 'Please enter the hotel name.';
      }
      if (!manualHotelCity.trim()) {
        errors.hotelCity = 'Please enter the hotel city/location.';
      }
    } else {
      if (!selectedHotelId) {
        errors.hotel = 'Please select a hotel associated with this complaint.';
      }
    }

    if (!subject.trim()) {
      errors.subject = 'Please enter a brief complaint subject.';
    } else if (subject.trim().length < 5) {
      errors.subject = 'Subject should be at least 5 characters long.';
    }

    if (!description.trim()) {
      errors.description = 'Please provide detailed description of the incident.';
    } else if (description.trim().length < 20) {
      errors.description = 'Please write at least 20 characters so the hotel team can investigate.';
    }

    if (!contactNumber.trim()) {
      errors.contactNumber = 'Please provide a valid contact number.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let finalHotelName = '';
      let finalHotelCity = '';
      let finalHotelId = '';
      let finalBookingRef = '';
      let isExternal = false;

      if (hotelSelectionMode === 'external') {
        finalHotelName = manualHotelName.trim();
        finalHotelCity = manualHotelCity.trim();
        finalHotelId = `EXT-${Date.now()}`;
        finalBookingRef = manualBookingRef.trim();
        isExternal = true;
      } else if (selectedHotel) {
        finalHotelName = selectedHotel.name;
        finalHotelCity = selectedHotel.city;
        finalHotelId = selectedHotel.id;
        finalBookingRef = selectedHotel.bookingReference || '';
        isExternal = false;
      }

      const record = await complaintService.submitHotelComplaint({
        hotelId: finalHotelId,
        hotelName: finalHotelName,
        hotelCity: finalHotelCity,
        isExternalHotel: isExternal,
        bookingReference: finalBookingRef,
        roomNumber: roomNumber.trim() || undefined,
        checkInDate: checkInDate || undefined,
        checkOutDate: checkOutDate || undefined,
        complaintCategory,
        complaintSubject: subject.trim(),
        detailedDescription: description.trim(),
        severity,
        preferredResolution,
        contactNumber: contactNumber.trim(),
        contactPreference,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      // Realistic processing delay
      await new Promise(r => setTimeout(r, 600));

      setSubmittedRecord(record);
    } catch (err: any) {
      console.error('Failed to submit hotel complaint:', err);
      alert('Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (submittedRecord) {
    return (
      <div className="complaint-success-card">
        <div className="success-icon-badge">
          <CheckCircle2 size={44} className="text-green" />
        </div>

        <h2 className="success-heading">Complaint Officially Registered</h2>
        <p className="success-subtext">
          Your complaint has been submitted to the TravelSphere Hospitality Liaison Desk and formally logged against <strong>{submittedRecord.hotelName}</strong>.
        </p>

        <div className="success-reference-box">
          <span className="ref-label">Official Reference Number</span>
          <span className="ref-code">{submittedRecord.id}</span>
          <span className="ref-hint">Please save this reference for all communications</span>
        </div>

        <div className="complaint-summary-table">
          <div className="summary-row">
            <span>Hotel Property:</span>
            <strong>{submittedRecord.hotelName} ({submittedRecord.hotelCity})</strong>
          </div>
          {submittedRecord.bookingReference && (
            <div className="summary-row">
              <span>Booking Reference:</span>
              <strong>{submittedRecord.bookingReference}</strong>
            </div>
          )}
          {submittedRecord.roomNumber && (
            <div className="summary-row">
              <span>Room / Suite:</span>
              <strong>{submittedRecord.roomNumber}</strong>
            </div>
          )}
          <div className="summary-row">
            <span>Complaint Category:</span>
            <span className="summary-pill">{submittedRecord.complaintCategory.replace(/_/g, ' ')}</span>
          </div>
          <div className="summary-row">
            <span>Severity Level:</span>
            <span className={`severity-tag severity-${submittedRecord.severity}`}>
              {submittedRecord.severity.toUpperCase()}
            </span>
          </div>
          <div className="summary-row">
            <span>Initial Status:</span>
            <span className="status-pill status-submitted">Submitted</span>
          </div>
        </div>

        <div className="success-action-buttons">
          <button 
            type="button" 
            className="btn-pill-green"
            onClick={() => onSuccessTrack(submittedRecord.id)}
          >
            <span>Track Complaint & Live Updates</span>
            <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
          </button>

          <button 
            type="button" 
            className="btn-pill-secondary"
            onClick={onBack}
          >
            Return to Emergency Support
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="emergency-form-page">
      {/* Back button */}
      <div className="form-page-top-bar">
        <button type="button" className="btn-back-pill" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Emergency Support</span>
        </button>
        <span className="page-category-chip hotel-chip">
          <Hotel size={15} /> Hotel & Accommodation Issue
        </span>
      </div>

      <div className="form-header-area">
        <h1 className="form-main-title">File a Hotel Complaint</h1>
        <p className="form-description">
          Select the specific hotel property, specify your booking or room details, and report your complaint. 
          Our hospitality specialists liaise directly with hotel executives to seek prompt resolution.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="emergency-form-card" noValidate>
        {/* STEP 1: MULTI-HOTEL SELECTOR */}
        <div className="form-section-block">
          <div className="section-label-row">
            <span className="step-num">1</span>
            <div>
              <h3 className="section-block-title">Select Affected Hotel Property</h3>
              <p className="section-block-sub">Choose your specific hotel booking or search our hotel catalog</p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="hotel-selector-tabs">
            <button
              type="button"
              className={`hotel-tab-btn ${hotelSelectionMode === 'booked' ? 'active' : ''}`}
              onClick={() => setHotelSelectionMode('booked')}
            >
              <CheckCircle2 size={15} />
              <span>My Booked Hotels ({userBookings.length})</span>
            </button>
            <button
              type="button"
              className={`hotel-tab-btn ${hotelSelectionMode === 'directory' ? 'active' : ''}`}
              onClick={() => setHotelSelectionMode('directory')}
            >
              <Search size={15} />
              <span>TravelSphere Hotel Directory</span>
            </button>
            <button
              type="button"
              className={`hotel-tab-btn ${hotelSelectionMode === 'external' ? 'active' : ''}`}
              onClick={() => setHotelSelectionMode('external')}
            >
              <Building size={15} />
              <span>Other Hotel (Booked Externally)</span>
            </button>
          </div>

          {/* MODE 1: User Bookings List */}
          {hotelSelectionMode === 'booked' && (
            <div className="booked-hotels-list">
              {userBookings.map((b) => {
                const isSelected = selectedHotelId === b.id;
                return (
                  <div
                    key={b.id}
                    className={`booking-select-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectBooking(b)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSelectBooking(b); }}
                  >
                    <div className="booking-card-left">
                      <div className="hotel-icon-badge">
                        <Hotel size={20} />
                      </div>
                      <div>
                        <h4 className="booking-hotel-name">{b.name}</h4>
                        <p className="booking-hotel-location">
                          <MapPin size={13} /> {b.city} • Ref: <strong>{b.bookingReference}</strong>
                        </p>
                        {b.checkIn && (
                          <span className="booking-dates-pill">
                            <Calendar size={12} /> {b.checkIn} → {b.checkOut}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="booking-radio-indicator">
                      {isSelected ? <CheckCircle2 size={22} className="text-green" /> : <div className="empty-radio-circle" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MODE 2: Search TravelSphere Hotel Directory */}
          {hotelSelectionMode === 'directory' && (
            <div className="directory-search-wrapper">
              <div className="hotel-search-input-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search hotel name or city (e.g. Grand Palace, Mumbai, Jaipur)..."
                  value={hotelSearchQuery}
                  onChange={(e) => setHotelSearchQuery(e.target.value)}
                />
              </div>

              <div className="directory-hotels-grid">
                {directoryHotels.map((h) => {
                  const isSelected = selectedHotelId === h.id;
                  return (
                    <div
                      key={h.id}
                      className={`directory-hotel-pill ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectBooking(h)}
                      tabIndex={0}
                      role="button"
                    >
                      <Hotel size={16} />
                      <div className="dir-text">
                        <strong>{h.name}</strong>
                        <span>{h.city} • {'★'.repeat(h.starRating || 4)}</span>
                      </div>
                      {isSelected && <Check size={16} className="text-green check-icon" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODE 3: Manual Entry for External Bookings */}
          {hotelSelectionMode === 'external' && (
            <div className="manual-hotel-fields-grid">
              <div className="input-group">
                <label htmlFor="manual-hotel-name">Hotel Name *</label>
                <input
                  id="manual-hotel-name"
                  type="text"
                  placeholder="e.g. Marriott Resort & Suites"
                  value={manualHotelName}
                  onChange={(e) => setManualHotelName(e.target.value)}
                  className={formErrors.hotelName ? 'input-error' : ''}
                />
                {formErrors.hotelName && <span className="field-error-text">{formErrors.hotelName}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="manual-hotel-city">City / Destination *</label>
                <input
                  id="manual-hotel-city"
                  type="text"
                  placeholder="e.g. Paris, France"
                  value={manualHotelCity}
                  onChange={(e) => setManualHotelCity(e.target.value)}
                  className={formErrors.hotelCity ? 'input-error' : ''}
                />
                {formErrors.hotelCity && <span className="field-error-text">{formErrors.hotelCity}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="manual-booking-ref">External Booking Reference (Optional)</label>
                <input
                  id="manual-booking-ref"
                  type="text"
                  placeholder="e.g. EXP-9821482"
                  value={manualBookingRef}
                  onChange={(e) => setManualBookingRef(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Room & Stay Dates Row */}
          <div className="stay-details-row">
            <div className="input-group">
              <label htmlFor="room-number">Room / Suite Number (Optional)</label>
              <input
                id="room-number"
                type="text"
                placeholder="e.g. Room 408"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="checkin-date">Check-in Date</label>
              <input
                id="checkin-date"
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="checkout-date">Check-out Date</label>
              <input
                id="checkout-date"
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* STEP 2: COMPLAINT DETAILS */}
        <div className="form-section-block">
          <div className="section-label-row">
            <span className="step-num">2</span>
            <div>
              <h3 className="section-block-title">Complaint Classification & Severity</h3>
              <p className="section-block-sub">Categorize your complaint and specify required urgency</p>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="complaint-category">Complaint Category *</label>
            <select
              id="complaint-category"
              value={complaintCategory}
              onChange={(e) => setComplaintCategory(e.target.value as any)}
              className="styled-select"
            >
              <option value="room_cleanliness">Room Cleanliness & Hygiene</option>
              <option value="booking_reservation">Booking or Reservation Problem</option>
              <option value="amenities_condition">Room Condition, AC or Amenities Malfunction</option>
              <option value="staff_service">Staff Behaviour or Service Quality</option>
              <option value="billing_charges">Billing or Unexpected Extra Charges</option>
              <option value="cancellation_refund">Cancellation or Refund Dispute</option>
              <option value="checkin_checkout">Check-in or Check-out Problem</option>
              <option value="safety_security">Safety or Security Concern</option>
              <option value="other">Other Incident</option>
            </select>
          </div>

          {/* Severity selector */}
          <div className="input-group">
            <label>Complaint Severity *</label>
            <div className="severity-options-row">
              {(['low', 'medium', 'high', 'critical'] as SeverityLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  className={`severity-btn severity-${lvl} ${severity === lvl ? 'selected' : ''}`}
                  onClick={() => setSeverity(lvl)}
                >
                  <span className="severity-indicator" />
                  <span>{lvl.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="complaint-subject">Complaint Subject *</label>
            <input
              id="complaint-subject"
              type="text"
              placeholder="e.g. AC unit leaking water and room uncleaned"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={formErrors.subject ? 'input-error' : ''}
            />
            {formErrors.subject && <span className="field-error-text">{formErrors.subject}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="complaint-desc">Detailed Description of Incident *</label>
            <textarea
              id="complaint-desc"
              rows={5}
              placeholder="Please provide full details including times, staff names spoken with, specific room issues, and impact on your stay..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={formErrors.description ? 'input-error' : ''}
            />
            <div className="desc-counter-row">
              {formErrors.description ? (
                <span className="field-error-text">{formErrors.description}</span>
              ) : (
                <span className="helper-text">Minimum 20 characters required</span>
              )}
              <span className="char-count">{description.length} chars</span>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="preferred-resolution">Preferred Resolution *</label>
            <select
              id="preferred-resolution"
              value={preferredResolution}
              onChange={(e) => setPreferredResolution(e.target.value as any)}
              className="styled-select"
            >
              <option value="room_change">Immediate Room Change / Upgrade</option>
              <option value="refund_compensation">Full or Partial Refund / Compensation</option>
              <option value="apology_explanation">Management Investigation & Written Apology</option>
              <option value="service_credit">Hotel Credit / Meal Voucher</option>
              <option value="facility_repair">Immediate In-Room Maintenance & Sanitization</option>
              <option value="other">Other Resolution</option>
            </select>
          </div>
        </div>

        {/* STEP 3: CONTACT & EVIDENCE */}
        <div className="form-section-block">
          <div className="section-label-row">
            <span className="step-num">3</span>
            <div>
              <h3 className="section-block-title">Contact & Supporting Evidence</h3>
              <p className="section-block-sub">How our liaison team can contact you with updates</p>
            </div>
          </div>

          <div className="contact-preference-grid">
            <div className="input-group">
              <label htmlFor="contact-phone">Contact Phone Number *</label>
              <input
                id="contact-phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className={formErrors.contactNumber ? 'input-error' : ''}
              />
              {formErrors.contactNumber && <span className="field-error-text">{formErrors.contactNumber}</span>}
            </div>

            <div className="input-group">
              <label>Preferred Contact Channel</label>
              <div className="contact-channel-radios">
                {(['phone', 'whatsapp', 'email'] as const).map((pref) => (
                  <label key={pref} className={`channel-pill ${contactPreference === pref ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="contact-channel"
                      value={pref}
                      checked={contactPreference === pref}
                      onChange={() => setContactPreference(pref)}
                    />
                    <span className="channel-icon">
                      {pref === 'phone' ? <Phone size={14} /> : pref === 'whatsapp' ? <MessageSquare size={14} /> : <Mail size={14} />}
                    </span>
                    <span className="channel-text">{pref.toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="attachments-section">
            <label className="attachments-label">
              <Upload size={15} /> Supporting Attachments / Evidence (Photos, Bills, Folios)
            </label>

            <div className="attachment-input-row">
              <input
                type="text"
                placeholder="Enter document / photo name (e.g. ac_water_leak.jpg, folio_receipt.pdf)"
                value={attachmentInput}
                onChange={(e) => setAttachmentInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAttachment(); }}}
              />
              <button
                type="button"
                className="btn-add-file"
                onClick={handleAddAttachment}
              >
                Add File
              </button>
            </div>

            {attachments.length > 0 && (
              <div className="attachments-list">
                {attachments.map((file, idx) => (
                  <div key={idx} className="attachment-chip">
                    <span>📎 {file}</span>
                    <button 
                      type="button" 
                      className="btn-remove-attachment"
                      onClick={() => handleRemoveAttachment(idx)}
                      aria-label="Remove attachment"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="form-submit-footer">
          <button
            type="submit"
            className="btn-pill-green btn-large"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span>Registering Complaint...</span>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Submit Official Complaint</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="btn-pill-secondary"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
