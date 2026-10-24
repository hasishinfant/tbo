import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Hotel, HeartPulse, FileText, Compass, 
  Clock, CheckCircle2, AlertCircle, AlertTriangle, 
  Send, User, ShieldCheck, MapPin, Calendar, Building, 
  Check, Phone, Mail, MessageSquare, ChevronRight, FileCheck
} from 'lucide-react';
import { 
  complaintService, 
  EmergencyComplaintRecord, 
  RequestStatus, 
  FollowUpMessage 
} from '@/services/complaintService';

interface ComplaintDetailViewProps {
  requestId: string;
  onBack: () => void;
}

export const ComplaintDetailView: React.FC<ComplaintDetailViewProps> = ({
  requestId,
  onBack,
}) => {
  const [record, setRecord] = useState<EmergencyComplaintRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [newReplyText, setNewReplyText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendSuccessHint, setSendSuccessHint] = useState<string | null>(null);

  const loadRecord = () => {
    setIsLoading(true);
    const found = complaintService.getRequestById(requestId);
    setRecord(found);
    setIsLoading(false);
  };

  useEffect(() => {
    loadRecord();
    window.addEventListener('emergency-requests-updated', loadRecord);
    return () => window.removeEventListener('emergency-requests-updated', loadRecord);
  }, [requestId]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyText.trim() || !record) return;

    setIsSending(true);
    try {
      const updated = await complaintService.addFollowUpMessage(
        record.id,
        newReplyText.trim(),
        record.userName || 'Demo Traveler'
      );
      setRecord(updated);
      setNewReplyText('');
      setSendSuccessHint('Your message was sent to the support team.');
      setTimeout(() => setSendSuccessHint(null), 4000);
    } catch (err) {
      console.error('Failed to send follow-up message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSimulateStatus = async (newStatus: RequestStatus) => {
    if (!record) return;
    try {
      const updated = await complaintService.updateRequestStatus(
        record.id,
        newStatus,
        `Status updated to ${newStatus.replace('_', ' ').toUpperCase()} by customer assistance portal.`
      );
      setRecord(updated);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="emergency-form-container">
        <div className="history-loading-state">
          <div className="submit-spinner"></div>
          <p>Loading ticket #{requestId}...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="emergency-form-container">
        <div className="history-empty-state">
          <AlertCircle size={40} className="text-amber-500 mb-2" />
          <h3>Ticket Not Found</h3>
          <p>We could not find an emergency or complaint record with reference <strong>{requestId}</strong>.</p>
          <button type="button" className="btn-primary-green mt-4" onClick={onBack}>
            Back to Tickets
          </button>
        </div>
      </div>
    );
  }

  // Stepper steps
  const steps: { key: RequestStatus; label: string }[] = [
    { key: 'submitted', label: '1. Submitted' },
    { key: 'under_review', label: '2. Under Review' },
    { key: 'in_progress', label: '3. In Progress' },
    { key: 'resolved', label: '4. Resolved' },
  ];

  const getStepIndex = (status: RequestStatus) => {
    if (status === 'rejected') return 1;
    switch (status) {
      case 'submitted': return 0;
      case 'under_review': return 1;
      case 'in_progress': return 2;
      case 'resolved': return 3;
      default: return 0;
    }
  };

  const currentStepIndex = getStepIndex(record.status);

  return (
    <div className="emergency-detail-container">
      {/* Top Header Bar */}
      <div className="detail-header-bar">
        <button 
          type="button" 
          className="back-link-btn" 
          onClick={onBack}
          aria-label="Back to Tickets"
        >
          <ArrowLeft size={18} />
          <span>Back to All Tickets</span>
        </button>

        <div className="detail-header-info">
          <div className="detail-title-badge-row">
            <span className="detail-ref-badge">{record.id}</span>
            <span className={`status-pill status-${record.status.replace('_', '')}`}>
              <span className="status-dot"></span>
              {record.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <h1 className="detail-main-title">
            {record.category === 'hotel' 
              ? (record as any).complaintSubject || `${(record as any).hotelName} Complaint`
              : record.category === 'medical'
              ? `Medical Case: ${(record as any).assistanceType?.replace('_', ' ')}`
              : record.category === 'passport'
              ? `Lost Document: ${(record as any).documentType?.toUpperCase()}`
              : `Local Assistance: ${(record as any).assistanceType?.replace('_', ' ')}`}
          </h1>
          <p className="detail-created-date">
            Created on {new Date(record.createdAt).toLocaleDateString(undefined, { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="status-stepper-card">
        <div className="stepper-track">
          {steps.map((st, idx) => {
            const isCompleted = idx < currentStepIndex || record.status === 'resolved';
            const isCurrent = idx === currentStepIndex && record.status !== 'resolved';
            return (
              <div 
                key={st.key} 
                className={`stepper-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}
              >
                <div className="step-circle">
                  {isCompleted ? <Check size={14} /> : idx + 1}
                </div>
                <span className="step-label">{st.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="detail-layout-grid">
        {/* Left Column: Complaint Details */}
        <div className="detail-left-col">
          {/* Main Case Info Card */}
          <div className="detail-card">
            <h2 className="detail-card-title flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-600" />
              <span>Case Information</span>
            </h2>

            {record.category === 'hotel' && (
              <div className="case-fields-list">
                <div className="case-field-row">
                  <span className="case-label">Associated Hotel</span>
                  <div className="case-value font-semibold text-slate-900 flex items-center gap-1.5">
                    <Building size={16} className="text-emerald-600" />
                    <span>{(record as any).hotelName}</span>
                    {(record as any).isExternalHotel && (
                      <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded">External Booking</span>
                    )}
                  </div>
                </div>

                <div className="case-field-row">
                  <span className="case-label">City / Destination</span>
                  <div className="case-value">{(record as any).hotelCity}</div>
                </div>

                {(record as any).bookingReference && (
                  <div className="case-field-row">
                    <span className="case-label">Booking Reference</span>
                    <div className="case-value font-mono font-medium text-emerald-700">
                      {(record as any).bookingReference}
                    </div>
                  </div>
                )}

                {(record as any).roomNumber && (
                  <div className="case-field-row">
                    <span className="case-label">Room Number</span>
                    <div className="case-value">Room {(record as any).roomNumber}</div>
                  </div>
                )}

                <div className="case-field-row">
                  <span className="case-label">Issue Category</span>
                  <div className="case-value capitalize">
                    {(record as any).complaintCategory?.replace(/_/g, ' ')}
                  </div>
                </div>

                <div className="case-field-row">
                  <span className="case-label">Severity Level</span>
                  <div className="case-value">
                    <span className={`severity-tag severity-${(record as any).severity}`}>
                      {(record as any).severity?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="case-field-row">
                  <span className="case-label">Desired Resolution</span>
                  <div className="case-value capitalize font-medium text-slate-700">
                    {(record as any).preferredResolution?.replace(/_/g, ' ')}
                  </div>
                </div>

                <div className="case-field-row-full mt-3">
                  <span className="case-label">Complaint Description</span>
                  <p className="case-description-text">
                    {(record as any).detailedDescription}
                  </p>
                </div>

                {(record as any).attachments && (record as any).attachments.length > 0 && (
                  <div className="case-field-row-full mt-3">
                    <span className="case-label">Supporting Attachments</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(record as any).attachments.map((att: string, i: number) => (
                        <span key={i} className="attachment-chip-view">
                          <FileCheck size={14} className="text-emerald-600" />
                          <span>{att}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {record.category === 'medical' && (
              <div className="case-fields-list">
                <div className="case-field-row">
                  <span className="case-label">Assistance Type</span>
                  <div className="case-value capitalize">{(record as any).assistanceType?.replace('_', ' ')}</div>
                </div>
                <div className="case-field-row">
                  <span className="case-label">Urgency</span>
                  <div className="case-value capitalize font-semibold text-rose-600">
                    {(record as any).urgency?.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="case-field-row">
                  <span className="case-label">Patient Location</span>
                  <div className="case-value">{(record as any).location}</div>
                </div>
                <div className="case-field-row">
                  <span className="case-label">Insurance Provider</span>
                  <div className="case-value">{(record as any).insuranceProvider || 'None declared'}</div>
                </div>
                {(record as any).medicalConditionsOrAllergies && (
                  <div className="case-field-row">
                    <span className="case-label">Allergies / Conditions</span>
                    <div className="case-value">{(record as any).medicalConditionsOrAllergies}</div>
                  </div>
                )}
                <div className="case-field-row-full mt-3">
                  <span className="case-label">Symptoms & Incident Description</span>
                  <p className="case-description-text">{(record as any).description}</p>
                </div>
              </div>
            )}

            {record.category === 'passport' && (
              <div className="case-fields-list">
                <div className="case-field-row">
                  <span className="case-label">Document Type</span>
                  <div className="case-value capitalize">{(record as any).documentType?.replace('_', ' ')}</div>
                </div>
                <div className="case-field-row">
                  <span className="case-label">Issuing Country</span>
                  <div className="case-value font-semibold">{(record as any).issuingCountry}</div>
                </div>
                <div className="case-field-row">
                  <span className="case-label">Incident Location</span>
                  <div className="case-value">{(record as any).incidentLocation}</div>
                </div>
                <div className="case-field-row">
                  <span className="case-label">Police Report Status</span>
                  <div className="case-value">
                    {(record as any).policeReportFiled 
                      ? `Filed (Ref: ${(record as any).policeReportNumber || 'Recorded'})` 
                      : 'Pending'}
                  </div>
                </div>
                {(record as any).upcomingDepartureDate && (
                  <div className="case-field-row">
                    <span className="case-label">Departure Flight Date</span>
                    <div className="case-value text-blue-700 font-medium">{(record as any).upcomingDepartureDate}</div>
                  </div>
                )}
                <div className="case-field-row-full mt-3">
                  <span className="case-label">Report Description</span>
                  <p className="case-description-text">{(record as any).description}</p>
                </div>
              </div>
            )}

            {record.category === 'local' && (
              <div className="case-fields-list">
                <div className="case-field-row">
                  <span className="case-label">Service Type</span>
                  <div className="case-value capitalize">{(record as any).assistanceType?.replace('_', ' ')}</div>
                </div>
                <div className="case-field-row">
                  <span className="case-label">Current Location</span>
                  <div className="case-value">{(record as any).location}</div>
                </div>
                <div className="case-field-row">
                  <span className="case-label">Urgency</span>
                  <div className="case-value capitalize">{(record as any).urgency}</div>
                </div>
                <div className="case-field-row-full mt-3">
                  <span className="case-label">Request Description</span>
                  <p className="case-description-text">{(record as any).description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Audit Status History Timeline */}
          <div className="detail-card mt-6">
            <h2 className="detail-card-title flex items-center gap-2">
              <Clock size={18} className="text-slate-600" />
              <span>Official Event Log</span>
            </h2>
            <div className="timeline-events-list">
              {record.statusHistory?.map((item, idx) => (
                <div key={idx} className="timeline-event-item">
                  <div className="event-bullet"></div>
                  <div className="event-content">
                    <div className="event-header-row">
                      <span className="event-status-tag font-semibold text-slate-900">
                        {item.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="event-time text-xs text-slate-500">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="event-note text-sm text-slate-600 mt-0.5">{item.note}</p>
                    {item.agentName && (
                      <span className="event-agent text-xs text-emerald-700 font-medium mt-1 block">
                        Logged by: {item.agentName}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Liaison Messaging */}
        <div className="detail-right-col">
          <div className="detail-card messages-chat-card">
            <div className="chat-card-header">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-emerald-600" />
                <h2 className="text-base font-semibold text-slate-900">Support & Hotel Liaison</h2>
              </div>
              <span className="live-indicator">
                <span className="live-pulse"></span>
                <span>Live Channel</span>
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="messages-thread-container">
              {record.followUpMessages && record.followUpMessages.length > 0 ? (
                record.followUpMessages.map((msg: FollowUpMessage) => (
                  <div 
                    key={msg.id} 
                    className={`chat-bubble-row ${msg.sender === 'user' ? 'sender-user' : 'sender-support'}`}
                  >
                    <div className="bubble-avatar">
                      {msg.sender === 'user' ? <User size={14} /> : <ShieldCheck size={14} />}
                    </div>
                    <div className="bubble-body">
                      <div className="bubble-meta">
                        <span className="bubble-author">{msg.senderName}</span>
                        <span className="bubble-time">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="bubble-text">{msg.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-messages-placeholder">
                  <p>No messages exchanged yet.</p>
                </div>
              )}
            </div>

            {/* Send Reply Form */}
            <form onSubmit={handleSendReply} className="chat-reply-form">
              {sendSuccessHint && (
                <div className="reply-success-alert mb-2">
                  <Check size={14} />
                  <span>{sendSuccessHint}</span>
                </div>
              )}
              <div className="chat-input-row">
                <input
                  type="text"
                  className="chat-reply-input"
                  placeholder="Type an update or question for the liaison desk..."
                  value={newReplyText}
                  onChange={(e) => setNewReplyText(e.target.value)}
                  disabled={isSending}
                />
                <button
                  type="submit"
                  className="btn-send-reply"
                  disabled={isSending || !newReplyText.trim()}
                  title="Send message"
                >
                  {isSending ? <span className="submit-spinner-sm"></span> : <Send size={16} />}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Actions & Demo Status Controls */}
          <div className="detail-card mt-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Ticket Actions</h3>
            <div className="ticket-actions-stack">
              <div className="status-update-row">
                <span className="text-xs text-slate-500 block mb-1">Simulate Status Transition (Demo):</span>
                <div className="flex flex-wrap gap-1.5">
                  <button 
                    type="button" 
                    className="btn-xs-tag"
                    onClick={() => handleSimulateStatus('in_progress')}
                  >
                    Mark In Progress
                  </button>
                  <button 
                    type="button" 
                    className="btn-xs-tag btn-resolve"
                    onClick={() => handleSimulateStatus('resolved')}
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
