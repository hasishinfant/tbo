import React, { useState } from 'react';
import { 
  Compass, ArrowLeft, CheckCircle2, MapPin, 
  Phone, ShieldCheck, Clock, Navigation, Check, 
  HelpCircle, MessageSquare, AlertCircle, Car, Languages
} from 'lucide-react';
import { 
  complaintService, 
  LocalAssistanceRecord 
} from '@/services/complaintService';

interface LocalAssistanceViewProps {
  onBack: () => void;
  onSuccessTrack: (requestId: string) => void;
}

export const LocalAssistanceView: React.FC<LocalAssistanceViewProps> = ({
  onBack,
  onSuccessTrack,
}) => {
  const [assistanceType, setAssistanceType] = useState<LocalAssistanceRecord['assistanceType']>('transportation');
  const [location, setLocation] = useState<string>('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [description, setDescription] = useState<string>('');
  const [urgency, setUrgency] = useState<LocalAssistanceRecord['urgency']>('standard');
  const [contactNumber, setContactNumber] = useState<string>('+1 (555) 234-5678');
  const [contactPreference, setContactPreference] = useState<'phone' | 'email' | 'whatsapp'>('whatsapp');

  // UI state
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRecord, setSubmittedRecord] = useState<LocalAssistanceRecord | null>(null);

  // Browser Geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setLocationSuccessMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        const geoString = `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        setLocation(geoString);
        setLocationSuccessMsg('GPS coordinates captured');
        setIsLocating(false);
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        setIsLocating(false);
        alert('Could not detect position. Please type your location manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!location.trim()) {
      errors.location = 'Please provide your current city or location.';
    }

    if (!description.trim()) {
      errors.description = 'Please describe the assistance you need.';
    } else if (description.trim().length < 15) {
      errors.description = 'Please provide at least 15 characters of detail.';
    }

    if (!contactNumber.trim()) {
      errors.contactNumber = 'Contact phone number is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const record = await complaintService.submitLocalAssistance({
        assistanceType,
        location: location.trim(),
        latitude,
        longitude,
        description: description.trim(),
        urgency,
        contactNumber: contactNumber.trim(),
        contactPreference,
      });

      setSubmittedRecord(record);
    } catch (err) {
      console.error('Failed to submit local assistance request:', err);
      alert('Failed to log local assistance request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (submittedRecord) {
    return (
      <div className="emergency-form-container">
        <div className="success-confirmation-card">
          <div className="success-icon-badge badge-local">
            <CheckCircle2 size={40} className="text-amber-500" />
          </div>

          <span className="success-pretitle">Concierge Request Queued</span>
          <h2 className="success-title">Local Assistance Initiated</h2>
          <p className="success-desc">
            Your request for on-the-ground support in <strong>{submittedRecord.location}</strong> has been received. 
            Our regional concierge team is matching your case with local travel guides and operators.
          </p>

          <div className="reference-code-box">
            <span className="ref-label">Local Request Reference ID</span>
            <div className="ref-code">{submittedRecord.id}</div>
            <span className="ref-hint">Keep this reference handy for quick lookup with our support agents.</span>
          </div>

          <div className="success-details-summary">
            <div className="summary-row">
              <span className="sum-label">Assistance Type</span>
              <span className="sum-val capitalize">{submittedRecord.assistanceType.replace('_', ' ')}</span>
            </div>
            <div className="summary-row">
              <span className="sum-label">Current Location</span>
              <span className="sum-val">{submittedRecord.location}</span>
            </div>
            <div className="summary-row">
              <span className="sum-label">Urgency</span>
              <span className="sum-val capitalize font-medium">{submittedRecord.urgency}</span>
            </div>
            <div className="summary-row">
              <span className="sum-label">Contact</span>
              <span className="sum-val">{submittedRecord.contactNumber} ({submittedRecord.contactPreference})</span>
            </div>
            <div className="summary-row">
              <span className="sum-label">Status</span>
              <span className="status-pill status-submitted">
                <span className="status-dot"></span> Under Review
              </span>
            </div>
          </div>

          <div className="success-actions">
            <button 
              type="button" 
              className="btn-primary-green flex-1"
              onClick={() => onSuccessTrack(submittedRecord.id)}
            >
              <Clock size={18} />
              <span>Track Concierge Response</span>
            </button>
            <button 
              type="button" 
              className="btn-outline-neutral"
              onClick={onBack}
            >
              Back to Support Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="emergency-form-container">
      {/* Top Breadcrumb Header */}
      <div className="form-header-bar">
        <button 
          type="button" 
          className="back-link-btn" 
          onClick={onBack}
          aria-label="Back to Emergency Support"
        >
          <ArrowLeft size={18} />
          <span>Back to Emergency Support</span>
        </button>

        <div className="form-header-title-row">
          <div className="header-icon-pill bg-amber-50 text-amber-600 border border-amber-200">
            <Compass size={24} />
          </div>
          <div>
            <h1 className="form-title">Local Travel Assistance</h1>
            <p className="form-subtitle">
              Get on-the-ground support for transit disruption, translations, lost baggage, or local safety advisories.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="complaint-card-form" noValidate>
        {/* Section 1: Request Category & Urgency */}
        <div className="form-section">
          <div className="section-title-wrap">
            <span className="section-step-num">1</span>
            <div className="section-title-content">
              <h3>Type of Local Assistance</h3>
              <p>Choose what kind of guidance or service you require</p>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="field-group">
              <label className="field-label" htmlFor="assistanceType">
                Assistance Category <span className="req">*</span>
              </label>
              <select
                id="assistanceType"
                className="select-input"
                value={assistanceType}
                onChange={(e) => setAssistanceType(e.target.value as any)}
              >
                <option value="transportation">Transport Disruption / Stranded / Taxi Dispute</option>
                <option value="directions">Directions / Navigation / Safe Neighborhood Routing</option>
                <option value="translation">Language & Translation Support (Local Dialect)</option>
                <option value="safety">Local Safety Advisory & Curfew Verification</option>
                <option value="lost_item">Lost Personal Belongings / Luggage Tracking</option>
                <option value="other">General Destination Query</option>
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">
                Urgency Level <span className="req">*</span>
              </label>
              <div className="urgency-selector-grid">
                {[
                  { value: 'high', label: 'High Priority', desc: 'Active trip in progress' },
                  { value: 'medium', label: 'Medium', desc: 'Response within 1-2 hours' },
                  { value: 'standard', label: 'Standard', desc: 'General non-critical inquiry' },
                ].map(item => (
                  <button
                    key={item.value}
                    type="button"
                    className={`urgency-chip ${urgency === item.value ? 'selected urgency-' + item.value : ''}`}
                    onClick={() => setUrgency(item.value as any)}
                  >
                    <span className="urgency-title">{item.label}</span>
                    <span className="urgency-sub">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Location */}
        <div className="form-section">
          <div className="section-title-wrap">
            <span className="section-step-num">2</span>
            <div className="section-title-content">
              <h3>Where Are You?</h3>
              <p>Help us find local contacts nearest to your current spot</p>
            </div>
          </div>

          <div className="field-group">
            <div className="flex-between items-center mb-1">
              <label className="field-label" htmlFor="location">
                City, Area or Landmark <span className="req">*</span>
              </label>
              <button
                type="button"
                className="detect-location-btn"
                onClick={handleDetectLocation}
                disabled={isLocating}
              >
                <Navigation size={14} className={isLocating ? 'animate-spin' : ''} />
                <span>{isLocating ? 'Detecting GPS...' : 'Use My GPS Location'}</span>
              </button>
            </div>

            <div className="input-with-icon-left">
              <MapPin size={18} className="input-icon" />
              <input
                id="location"
                type="text"
                className={`text-input with-icon ${formErrors.location ? 'has-error' : ''}`}
                placeholder="e.g., Near Tokyo Station, Marunouchi exit or Hotel lobby"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (formErrors.location) setFormErrors(prev => ({ ...prev, location: '' }));
                }}
              />
            </div>
            {locationSuccessMsg && (
              <span className="field-success-hint flex items-center gap-1 mt-1 text-emerald-600 text-xs">
                <Check size={14} /> {locationSuccessMsg}
              </span>
            )}
            {formErrors.location && (
              <span className="field-error-msg">{formErrors.location}</span>
            )}
          </div>

          <div className="field-group mt-4">
            <label className="field-label" htmlFor="description">
              Describe What You Need <span className="req">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              className={`textarea-input ${formErrors.description ? 'has-error' : ''}`}
              placeholder="Provide context, names of transport stations or what specific assistance would solve your issue..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (formErrors.description) setFormErrors(prev => ({ ...prev, description: '' }));
              }}
            />
            {formErrors.description && (
              <span className="field-error-msg">{formErrors.description}</span>
            )}
          </div>
        </div>

        {/* Section 3: Contact */}
        <div className="form-section">
          <div className="section-title-wrap">
            <span className="section-step-num">3</span>
            <div className="section-title-content">
              <h3>Contact Information</h3>
              <p>Where our local travel coordinator should send directions and answers</p>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="field-group">
              <label className="field-label" htmlFor="contactNumber">
                Phone Number / WhatsApp <span className="req">*</span>
              </label>
              <div className="input-with-icon-left">
                <Phone size={18} className="input-icon" />
                <input
                  id="contactNumber"
                  type="tel"
                  className={`text-input with-icon ${formErrors.contactNumber ? 'has-error' : ''}`}
                  value={contactNumber}
                  onChange={(e) => {
                    setContactNumber(e.target.value);
                    if (formErrors.contactNumber) setFormErrors(prev => ({ ...prev, contactNumber: '' }));
                  }}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              {formErrors.contactNumber && (
                <span className="field-error-msg">{formErrors.contactNumber}</span>
              )}
            </div>

            <div className="field-group">
              <label className="field-label">Preferred Response Channel</label>
              <div className="contact-pref-row">
                {(['whatsapp', 'phone', 'email'] as const).map(pref => (
                  <button
                    key={pref}
                    type="button"
                    className={`contact-chip ${contactPreference === pref ? 'selected' : ''}`}
                    onClick={() => setContactPreference(pref)}
                  >
                    <span className="capitalize">{pref}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="form-submit-row">
          <button
            type="button"
            className="btn-outline-neutral"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn-primary-green"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="submit-spinner"></span>
                <span>Submitting Request...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Submit Local Assistance Request</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
