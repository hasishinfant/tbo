import React, { useState } from 'react';
import { 
  HeartPulse, ArrowLeft, CheckCircle2, AlertTriangle, 
  MapPin, Phone, ShieldCheck, Clock, Check, 
  AlertCircle, Navigation, Activity, Stethoscope, Pill
} from 'lucide-react';
import { 
  complaintService, 
  MedicalEmergencyRecord 
} from '@/services/complaintService';

interface MedicalEmergencyViewProps {
  onBack: () => void;
  onSuccessTrack: (requestId: string) => void;
}

export const MedicalEmergencyView: React.FC<MedicalEmergencyViewProps> = ({
  onBack,
  onSuccessTrack,
}) => {
  const [assistanceType, setAssistanceType] = useState<MedicalEmergencyRecord['assistanceType']>('illness');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [urgency, setUrgency] = useState<MedicalEmergencyRecord['urgency']>('within_2_hours');
  const [contactNumber, setContactNumber] = useState<string>('+1 (555) 234-5678');
  const [contactPreference, setContactPreference] = useState<'phone' | 'email' | 'whatsapp'>('phone');
  const [hasTravelInsurance, setHasTravelInsurance] = useState<boolean>(true);
  const [insuranceProvider, setInsuranceProvider] = useState<string>('Allianz Global Assistance');
  const [medicalConditionsOrAllergies, setMedicalConditionsOrAllergies] = useState<string>('');

  // UI state
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRecord, setSubmittedRecord] = useState<MedicalEmergencyRecord | null>(null);

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
        const geoString = `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)}) - Near current device position`;
        setLocation(geoString);
        setLocationSuccessMsg('Current GPS coordinates detected successfully');
        setIsLocating(false);
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        setIsLocating(false);
        alert('Could not access current location. Please enter your location manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!description.trim()) {
      errors.description = 'Please describe the symptoms or medical situation.';
    } else if (description.trim().length < 15) {
      errors.description = 'Please provide at least 15 characters of detail.';
    }

    if (!location.trim()) {
      errors.location = 'Please enter your current city, address, or hotel location.';
    }

    if (!contactNumber.trim()) {
      errors.contactNumber = 'Contact phone number is required.';
    } else if (contactNumber.trim().length < 7) {
      errors.contactNumber = 'Please enter a valid phone number with country code.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const record = await complaintService.submitMedicalEmergency({
        assistanceType,
        description: description.trim(),
        location: location.trim(),
        latitude,
        longitude,
        urgency,
        hasTravelInsurance,
        insuranceProvider: hasTravelInsurance ? insuranceProvider : undefined,
        medicalConditionsOrAllergies: medicalConditionsOrAllergies.trim() || undefined,
        contactNumber: contactNumber.trim(),
        contactPreference,
      });

      setSubmittedRecord(record);
    } catch (err) {
      console.error('Failed to submit medical emergency:', err);
      alert('Failed to log medical request. Please try again or call the emergency hotline.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (submittedRecord) {
    return (
      <div className="emergency-form-container">
        <div className="success-confirmation-card">
          <div className="success-icon-badge badge-medical">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>

          <span className="success-pretitle">Medical Request Registered</span>
          <h2 className="success-title">Your Case Has Been Dispatched</h2>
          <p className="success-desc">
            A dedicated TravelSphere medical coordinator has received your case and is actively reviewing 
            verified clinics, doctors, and hospital partners in your area.
          </p>

          <div className="reference-code-box">
            <span className="ref-label">Medical Case Reference ID</span>
            <div className="ref-code">{submittedRecord.id}</div>
            <span className="ref-hint">Please save this reference for coordination with physicians and travel insurance.</span>
          </div>

          <div className="success-details-summary">
            <div className="summary-row">
              <span className="sum-label">Assistance Type</span>
              <span className="sum-val capitalize">{submittedRecord.assistanceType.replace('_', ' ')}</span>
            </div>
            <div className="summary-row">
              <span className="sum-label">Location</span>
              <span className="sum-val">{submittedRecord.location}</span>
            </div>
            <div className="summary-row">
              <span className="sum-label">Urgency</span>
              <span className="sum-val font-semibold text-amber-600 capitalize">
                {submittedRecord.urgency.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="summary-row">
              <span className="sum-label">Contact Target</span>
              <span className="sum-val">{submittedRecord.contactNumber} ({submittedRecord.contactPreference})</span>
            </div>
            <div className="summary-row">
              <span className="sum-label">Status</span>
              <span className="status-pill status-submitted">
                <span className="status-dot"></span> Under Review
              </span>
            </div>
          </div>

          <div className="emergency-notice-compact mb-6">
            <AlertCircle size={18} className="notice-icon text-red-500" />
            <div className="notice-text">
              <strong>Need Immediate Hospitalization?</strong>
              <p>This service does not replace municipal ambulances. Call local emergency (112 / 911) if acute life danger exists.</p>
            </div>
          </div>

          <div className="success-actions">
            <button 
              type="button" 
              className="btn-primary-green flex-1"
              onClick={() => onSuccessTrack(submittedRecord.id)}
            >
              <Activity size={18} />
              <span>Track Request & Live Timeline</span>
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
          <div className="header-icon-pill bg-rose-50 text-rose-600 border border-rose-200">
            <HeartPulse size={24} />
          </div>
          <div>
            <h1 className="form-title">Medical Assistance Request</h1>
            <p className="form-subtitle">
              Get assistance locating certified English-speaking clinics, physicians, or prescription replacements.
            </p>
          </div>
        </div>
      </div>

      {/* Critical Medical Disclaimer Banner */}
      <div className="emergency-notice-compact mb-6">
        <AlertTriangle size={20} className="notice-icon text-rose-600" />
        <div className="notice-text">
          <strong className="text-rose-900">Immediate Life-Threatening Emergency?</strong>
          <p className="text-rose-700">
            If you or a travel companion are experiencing severe trauma, chest pain, or loss of consciousness, 
            <strong> dial municipal emergency services (112 in Europe/India, 911 in North America) immediately.</strong> 
            TravelSphere coordinates travel health support, English-speaking clinics, and insurance claims.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="complaint-card-form" noValidate>
        {/* Section 1: Type & Urgency */}
        <div className="form-section">
          <div className="section-title-wrap">
            <span className="section-step-num">1</span>
            <div className="section-title-content">
              <h3>Medical Situation & Urgency</h3>
              <p>Help us route your case to the appropriate healthcare specialist</p>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="field-group">
              <label className="field-label" htmlFor="assistanceType">
                Assistance Needed <span className="req">*</span>
              </label>
              <select 
                id="assistanceType"
                className="select-input"
                value={assistanceType}
                onChange={(e) => setAssistanceType(e.target.value as any)}
              >
                <option value="illness">Illness / Infection / High Fever</option>
                <option value="injury">Physical Injury / Fall / Sprain</option>
                <option value="prescription">Prescription Drug Refill / Lost Medication</option>
                <option value="dental">Emergency Dental Care</option>
                <option value="hospital_referral">Hospital / Specialist Referral</option>
                <option value="other">Other Medical Query</option>
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">
                Urgency Level <span className="req">*</span>
              </label>
              <div className="urgency-selector-grid">
                {[
                  { value: 'immediate', label: 'Urgent', desc: 'Needs help ASAP' },
                  { value: 'within_2_hours', label: 'Within 2 Hours', desc: 'Same-day consultation' },
                  { value: 'within_24_hours', label: 'Standard', desc: 'Within 24 hours' },
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

          <div className="field-group mt-4">
            <label className="field-label" htmlFor="description">
              Describe Symptoms / Medical Situation <span className="req">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              className={`textarea-input ${formErrors.description ? 'has-error' : ''}`}
              placeholder="Please provide details of current symptoms, when they began, any medications taken, or assistance required..."
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

        {/* Section 2: Location & Detection */}
        <div className="form-section">
          <div className="section-title-wrap">
            <span className="section-step-num">2</span>
            <div className="section-title-content">
              <h3>Current Location</h3>
              <p>Where are you currently located so we can locate the nearest doctor or hospital?</p>
            </div>
          </div>

          <div className="field-group">
            <div className="flex-between items-center mb-1">
              <label className="field-label" htmlFor="location">
                City, Address or Hotel Name <span className="req">*</span>
              </label>
              <button
                type="button"
                className="detect-location-btn"
                onClick={handleDetectLocation}
                disabled={isLocating}
              >
                <Navigation size={14} className={isLocating ? 'animate-spin' : ''} />
                <span>{isLocating ? 'Detecting GPS...' : 'Use My Current Location'}</span>
              </button>
            </div>

            <div className="input-with-icon-left">
              <MapPin size={18} className="input-icon" />
              <input
                id="location"
                type="text"
                className={`text-input with-icon ${formErrors.location ? 'has-error' : ''}`}
                placeholder="e.g., Room 402, The Grand Palace Hotel, Mumbai, India"
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
        </div>

        {/* Section 3: Health Profile & Insurance */}
        <div className="form-section">
          <div className="section-title-wrap">
            <span className="section-step-num">3</span>
            <div className="section-title-content">
              <h3>Health Background & Insurance (Optional)</h3>
              <p>Crucial for avoiding medication contraindications and expediting insurance approvals</p>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="field-group">
              <label className="field-label" htmlFor="allergies">
                Pre-existing Conditions or Allergies
              </label>
              <input
                id="allergies"
                type="text"
                className="text-input"
                placeholder="e.g., Penicillin allergy, Asthma, Diabetes, none"
                value={medicalConditionsOrAllergies}
                onChange={(e) => setMedicalConditionsOrAllergies(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="insuranceProvider">
                Travel Health Insurance Provider
              </label>
              <input
                id="insuranceProvider"
                type="text"
                className="text-input"
                placeholder="e.g., Allianz Global, AXA, SafetyWing, etc."
                value={insuranceProvider}
                onChange={(e) => setInsuranceProvider(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Contact Information */}
        <div className="form-section">
          <div className="section-title-wrap">
            <span className="section-step-num">4</span>
            <div className="section-title-content">
              <h3>Emergency Contact Details</h3>
              <p>How our medical response coordinator should reach you</p>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="field-group">
              <label className="field-label" htmlFor="contactNumber">
                Direct Contact Phone Number <span className="req">*</span>
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
              <label className="field-label">Preferred Contact Channel</label>
              <div className="contact-pref-row">
                {(['phone', 'whatsapp', 'email'] as const).map(pref => (
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

        {/* Submit Actions */}
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
                <span>Submitting Case...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Submit Medical Assistance Request</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
