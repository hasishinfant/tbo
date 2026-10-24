import React, { useState } from 'react';
import { 
  FileText, ArrowLeft, CheckCircle2, AlertTriangle, 
  MapPin, Phone, ShieldCheck, Calendar, Clock, 
  HelpCircle, Building2, ExternalLink, AlertCircle
} from 'lucide-react';
import { 
  complaintService, 
  PassportEmergencyRecord 
} from '@/services/complaintService';

interface LostPassportViewProps {
  onBack: () => void;
  onSuccessTrack: (requestId: string) => void;
}

export const LostPassportView: React.FC<LostPassportViewProps> = ({
  onBack,
  onSuccessTrack,
}) => {
  const [documentType, setDocumentType] = useState<PassportEmergencyRecord['documentType']>('passport');
  const [issuingCountry, setIssuingCountry] = useState<string>('United States');
  const [incidentDate, setIncidentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [incidentLocation, setIncidentLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [policeReportFiled, setPoliceReportFiled] = useState<boolean>(false);
  const [policeReportNumber, setPoliceReportNumber] = useState<string>('');
  const [upcomingDepartureDate, setUpcomingDepartureDate] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('+1 (555) 234-5678');
  const [contactPreference, setContactPreference] = useState<'phone' | 'email' | 'whatsapp'>('phone');

  // UI state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRecord, setSubmittedRecord] = useState<PassportEmergencyRecord | null>(null);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!issuingCountry.trim()) {
      errors.issuingCountry = 'Please enter or select the issuing country.';
    }

    if (!incidentLocation.trim()) {
      errors.incidentLocation = 'Please specify where the document was lost or stolen.';
    }

    if (!description.trim()) {
      errors.description = 'Please provide a brief description of the incident.';
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
      const record = await complaintService.submitPassportEmergency({
        documentType,
        issuingCountry: issuingCountry.trim(),
        incidentDate,
        incidentLocation: incidentLocation.trim(),
        description: description.trim(),
        policeReportFiled,
        policeReportNumber: policeReportFiled ? policeReportNumber.trim() : undefined,
        upcomingDepartureDate: upcomingDepartureDate || undefined,
        contactNumber: contactNumber.trim(),
        contactPreference,
      });

      setSubmittedRecord(record);
    } catch (err) {
      console.error('Failed to submit lost passport case:', err);
      alert('Failed to log document assistance request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (submittedRecord) {
    return (
      <div className="emergency-form-container">
        <div className="success-confirmation-card">
          <div className="success-icon-badge badge-passport">
            <CheckCircle2 size={40} className="text-blue-500" />
          </div>

          <span className="success-pretitle">Consular Case Initiated</span>
          <h2 className="success-title">Document Report Logged</h2>
          <p className="success-desc">
            Your lost document request has been filed. Our consular liaison team is compiling 
            the verified emergency travel certificate procedures for citizens of <strong>{submittedRecord.issuingCountry}</strong>.
          </p>

          <div className="reference-code-box">
            <span className="ref-label">Document Case Reference ID</span>
            <div className="ref-code">{submittedRecord.id}</div>
            <span className="ref-hint">Present this number to your consular officer or local police precinct.</span>
          </div>

          <div className="success-details-summary">
            <div className="summary-row">
              <span className="sum-label">Document Reported</span>
              <span className="sum-val capitalize">{submittedRecord.documentType.replace('_', ' ')}</span>
            </div>
            <div className="summary-row">
              <span className="sum-label">Issuing Country</span>
              <span className="sum-val font-semibold">{submittedRecord.issuingCountry}</span>
            </div>
            <div className="summary-row">
              <span className="sum-label">Approximate Location</span>
              <span className="sum-val">{submittedRecord.incidentLocation}</span>
            </div>
            <div className="summary-row">
              <span className="sum-label">Police Report</span>
              <span className="sum-val">
                {submittedRecord.policeReportFiled 
                  ? `Filed (Ref: ${submittedRecord.policeReportNumber || 'Pending'})` 
                  : 'Not yet filed - Recommended'}
              </span>
            </div>
            <div className="summary-row">
              <span className="sum-label">Status</span>
              <span className="status-pill status-submitted">
                <span className="status-dot"></span> Under Review
              </span>
            </div>
          </div>

          {/* Consular Next Steps Advice */}
          <div className="consular-guide-box mb-6">
            <Building2 size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="consular-guide-content text-left">
              <h4 className="text-sm font-semibold text-slate-900 mb-1">Recommended Next Steps:</h4>
              <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-4">
                <li>Visit the nearest local police station to obtain an official <strong>Police Loss Certificate (PIR)</strong>. Consulates require this to issue emergency passports.</li>
                <li>Carry digital copies of your passport, birth certificate, or national identity card if stored securely.</li>
                <li>Check with our support agent via the timeline below for the nearest embassy address and emergency appointment slots.</li>
              </ol>
            </div>
          </div>

          <div className="success-actions">
            <button 
              type="button" 
              className="btn-primary-green flex-1"
              onClick={() => onSuccessTrack(submittedRecord.id)}
            >
              <Clock size={18} />
              <span>Track Case & Embassy Updates</span>
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
          <div className="header-icon-pill bg-blue-50 text-blue-600 border border-blue-200">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="form-title">Lost Passport & Documents Assistance</h1>
            <p className="form-subtitle">
              Report lost or stolen passports, visas, or IDs to obtain consular guidance and emergency transit permits.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="info-privacy-notice mb-6">
        <ShieldCheck size={18} className="text-blue-600 flex-shrink-0" />
        <span className="text-xs text-slate-600">
          <strong>Privacy Protected:</strong> We never ask for full unredacted passport document numbers. Only general incident information is required to coordinate with your embassy.
        </span>
      </div>

      <form onSubmit={handleSubmit} className="complaint-card-form" noValidate>
        {/* Section 1: Document Details */}
        <div className="form-section">
          <div className="section-title-wrap">
            <span className="section-step-num">1</span>
            <div className="section-title-content">
              <h3>Document Information</h3>
              <p>Identify the missing travel credentials</p>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="field-group">
              <label className="field-label" htmlFor="documentType">
                Document Type <span className="req">*</span>
              </label>
              <select
                id="documentType"
                className="select-input"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as any)}
              >
                <option value="passport">Passport (Primary Book)</option>
                <option value="visa">Entry Visa / Electronic Visa (e-Visa)</option>
                <option value="national_id">National ID Card / Green Card</option>
                <option value="driving_license">International Driving Permit / License</option>
                <option value="boarding_pass">Physical Tickets / Boarding Passes</option>
              </select>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="issuingCountry">
                Issuing Country / Citizenship <span className="req">*</span>
              </label>
              <input
                id="issuingCountry"
                type="text"
                className={`text-input ${formErrors.issuingCountry ? 'has-error' : ''}`}
                placeholder="e.g., United States, United Kingdom, India, Australia, Germany..."
                value={issuingCountry}
                onChange={(e) => {
                  setIssuingCountry(e.target.value);
                  if (formErrors.issuingCountry) setFormErrors(prev => ({ ...prev, issuingCountry: '' }));
                }}
              />
              {formErrors.issuingCountry && (
                <span className="field-error-msg">{formErrors.issuingCountry}</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Incident Details */}
        <div className="form-section">
          <div className="section-title-wrap">
            <span className="section-step-num">2</span>
            <div className="section-title-content">
              <h3>Incident Circumstances</h3>
              <p>When and where were the documents misplaced or stolen?</p>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="field-group">
              <label className="field-label" htmlFor="incidentDate">
                Approximate Date of Loss <span className="req">*</span>
              </label>
              <div className="input-with-icon-left">
                <Calendar size={18} className="input-icon" />
                <input
                  id="incidentDate"
                  type="date"
                  className="text-input with-icon"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="departureDate">
                Upcoming Flight / Departure Date (If applicable)
              </label>
              <div className="input-with-icon-left">
                <Calendar size={18} className="input-icon" />
                <input
                  id="departureDate"
                  type="date"
                  className="text-input with-icon"
                  value={upcomingDepartureDate}
                  onChange={(e) => setUpcomingDepartureDate(e.target.value)}
                />
              </div>
              <span className="field-hint">Helps the embassy prioritize emergency same-day travel certificates.</span>
            </div>
          </div>

          <div className="field-group mt-4">
            <label className="field-label" htmlFor="incidentLocation">
              Approximate Location / City / Airport / Venue <span className="req">*</span>
            </label>
            <div className="input-with-icon-left">
              <MapPin size={18} className="input-icon" />
              <input
                id="incidentLocation"
                type="text"
                className={`text-input with-icon ${formErrors.incidentLocation ? 'has-error' : ''}`}
                placeholder="e.g., Terminal 2, Heathrow Airport, London or taxi near Central Station"
                value={incidentLocation}
                onChange={(e) => {
                  setIncidentLocation(e.target.value);
                  if (formErrors.incidentLocation) setFormErrors(prev => ({ ...prev, incidentLocation: '' }));
                }}
              />
            </div>
            {formErrors.incidentLocation && (
              <span className="field-error-msg">{formErrors.incidentLocation}</span>
            )}
          </div>

          <div className="field-group mt-4">
            <label className="field-label" htmlFor="description">
              Description of Incident <span className="req">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              className={`textarea-input ${formErrors.description ? 'has-error' : ''}`}
              placeholder="Describe where the documents were last seen, whether personal bags or wallets were also taken, and any relevant details..."
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

        {/* Section 3: Police Report */}
        <div className="form-section">
          <div className="section-title-wrap">
            <span className="section-step-num">3</span>
            <div className="section-title-content">
              <h3>Police Loss Report</h3>
              <p>Almost all embassies require a local police report before issuing replacement papers</p>
            </div>
          </div>

          <div className="checkbox-card-row mb-3">
            <label className="checkbox-card-label">
              <input
                type="checkbox"
                className="custom-checkbox"
                checked={policeReportFiled}
                onChange={(e) => setPoliceReportFiled(e.target.checked)}
              />
              <div className="checkbox-card-text">
                <span className="font-semibold text-slate-800 text-sm">I have already filed a police report with local authorities</span>
                <span className="text-xs text-slate-500 block">Check this box if you have a police reference number or loss slip.</span>
              </div>
            </label>
          </div>

          {policeReportFiled && (
            <div className="field-group pl-7">
              <label className="field-label" htmlFor="policeRef">
                Police Report / Case Reference Number
              </label>
              <input
                id="policeRef"
                type="text"
                className="text-input"
                placeholder="e.g., MET-POL-2026-98124"
                value={policeReportNumber}
                onChange={(e) => setPoliceReportNumber(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Section 4: Contact Details */}
        <div className="form-section">
          <div className="section-title-wrap">
            <span className="section-step-num">4</span>
            <div className="section-title-content">
              <h3>How to Reach You</h3>
              <p>Provide a phone number or hotel phone where consular liaison updates can be delivered</p>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="field-group">
              <label className="field-label" htmlFor="contactNumber">
                Contact Phone / WhatsApp <span className="req">*</span>
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
              <label className="field-label">Contact Preference</label>
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

        {/* Submit Row */}
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
                <span>Registering Report...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Submit Document Assistance Report</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
