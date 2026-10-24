import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Search, Filter, Hotel, HeartPulse, 
  FileText, Compass, Clock, CheckCircle2, AlertCircle, 
  ChevronRight, Calendar, MapPin, Plus, RefreshCw, MessageSquare
} from 'lucide-react';
import { 
  complaintService, 
  EmergencyComplaintRecord, 
  RequestStatus, 
  EmergencyCategory 
} from '@/services/complaintService';

interface ComplaintHistoryViewProps {
  onBack: () => void;
  onSelectRequest: (requestId: string) => void;
  onNewRequest: (category?: EmergencyCategory) => void;
}

export const ComplaintHistoryView: React.FC<ComplaintHistoryViewProps> = ({
  onBack,
  onSelectRequest,
  onNewRequest,
}) => {
  const [requests, setRequests] = useState<EmergencyComplaintRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadRequests = () => {
    setIsLoading(true);
    const data = complaintService.getStoredRequests();
    setRequests(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadRequests();
    window.addEventListener('emergency-requests-updated', loadRequests);
    return () => window.removeEventListener('emergency-requests-updated', loadRequests);
  }, []);

  const getCategoryIcon = (category: EmergencyCategory) => {
    switch (category) {
      case 'hotel':
        return <Hotel size={18} className="text-emerald-600" />;
      case 'medical':
        return <HeartPulse size={18} className="text-rose-600" />;
      case 'passport':
        return <FileText size={18} className="text-blue-600" />;
      case 'local':
        return <Compass size={18} className="text-amber-600" />;
      default:
        return <AlertCircle size={18} className="text-slate-600" />;
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'submitted':
        return <span className="status-pill status-submitted"><span className="status-dot"></span> Submitted</span>;
      case 'under_review':
        return <span className="status-pill status-review"><span className="status-dot"></span> Under Review</span>;
      case 'in_progress':
        return <span className="status-pill status-progress"><span className="status-dot"></span> In Progress</span>;
      case 'resolved':
        return <span className="status-pill status-resolved"><span className="status-dot"></span> Resolved</span>;
      case 'rejected':
        return <span className="status-pill status-rejected"><span className="status-dot"></span> Rejected</span>;
      default:
        return null;
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    // Category filter
    if (categoryFilter !== 'all' && req.category !== categoryFilter) {
      return false;
    }

    // Status filter
    if (statusFilter === 'active') {
      if (req.status === 'resolved' || req.status === 'rejected') return false;
    } else if (statusFilter === 'resolved') {
      if (req.status !== 'resolved') return false;
    } else if (statusFilter !== 'all' && req.status !== statusFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesId = req.id.toLowerCase().includes(q);
      const matchesCat = req.categoryLabel.toLowerCase().includes(q);
      let matchesContent = false;

      if (req.category === 'hotel') {
        matchesContent = (req as any).hotelName?.toLowerCase().includes(q) || 
                         (req as any).complaintSubject?.toLowerCase().includes(q);
      } else if (req.category === 'medical') {
        matchesContent = (req as any).description?.toLowerCase().includes(q) || 
                         (req as any).location?.toLowerCase().includes(q);
      } else if (req.category === 'passport') {
        matchesContent = (req as any).issuingCountry?.toLowerCase().includes(q) || 
                         (req as any).description?.toLowerCase().includes(q);
      } else if (req.category === 'local') {
        matchesContent = (req as any).location?.toLowerCase().includes(q) || 
                         (req as any).description?.toLowerCase().includes(q);
      }

      return matchesId || matchesCat || matchesContent;
    }

    return true;
  });

  const getSubjectOrSummary = (req: EmergencyComplaintRecord): string => {
    if (req.category === 'hotel') {
      return (req as any).complaintSubject || `${(req as any).hotelName} Complaint`;
    }
    if (req.category === 'medical') {
      return `Medical: ${(req as any).assistanceType?.replace('_', ' ')} (${(req as any).location})`;
    }
    if (req.category === 'passport') {
      return `Lost ${(req as any).documentType?.toUpperCase()} - ${(req as any).issuingCountry}`;
    }
    if (req.category === 'local') {
      return (req as any).assistanceType ? `Local: ${(req as any).assistanceType.replace('_', ' ')} at ${(req as any).location}` : 'Local Assistance';
    }
    return (req as any).categoryLabel || 'Assistance Request';
  };

  return (
    <div className="emergency-history-container">
      {/* Header bar */}
      <div className="history-header-bar">
        <div className="history-header-left">
          <button 
            type="button" 
            className="back-link-btn" 
            onClick={onBack}
            aria-label="Back to Support Hub"
          >
            <ArrowLeft size={18} />
            <span>Support Hub</span>
          </button>
          <div className="history-title-block">
            <h1 className="history-title">My Assistance & Complaint Tickets</h1>
            <p className="history-subtitle">
              Track real-time status updates, liaison messages, and hotel management responses.
            </p>
          </div>
        </div>

        <div className="history-header-actions">
          <button 
            type="button" 
            className="btn-refresh-icon"
            onClick={loadRequests}
            title="Refresh tickets"
          >
            <RefreshCw size={16} />
          </button>
          <button 
            type="button" 
            className="btn-primary-green btn-new-ticket"
            onClick={() => onNewRequest()}
          >
            <Plus size={16} />
            <span>New Assistance Request</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="history-filters-card">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="history-search-input"
            placeholder="Search by ticket ID (e.g. TS-HTL-2026-...), hotel name, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              type="button" 
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>

        <div className="filters-row">
          <div className="filter-item">
            <span className="filter-label">Category:</span>
            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories ({requests.length})</option>
              <option value="hotel">Hotel Complaints ({requests.filter(r => r.category === 'hotel').length})</option>
              <option value="medical">Medical Emergencies ({requests.filter(r => r.category === 'medical').length})</option>
              <option value="passport">Passport & Documents ({requests.filter(r => r.category === 'passport').length})</option>
              <option value="local">Local Assistance ({requests.filter(r => r.category === 'local').length})</option>
            </select>
          </div>

          <div className="filter-item">
            <span className="filter-label">Status:</span>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Tickets Only</option>
              <option value="submitted">Submitted</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ticket List */}
      {isLoading ? (
        <div className="history-loading-state">
          <div className="submit-spinner"></div>
          <p>Loading your assistance tickets...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="history-empty-state">
          <div className="empty-icon-circle">
            <CheckCircle2 size={36} className="text-emerald-500" />
          </div>
          <h3>No Tickets Found</h3>
          <p>
            {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'No requests match your current search and filter criteria. Try resetting filters.'
              : 'You do not have any active emergency assistance requests or hotel complaints recorded.'}
          </p>
          {(searchQuery || categoryFilter !== 'all' || statusFilter !== 'all') ? (
            <button
              type="button"
              className="btn-outline-neutral mt-4"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
            >
              Clear All Filters
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary-green mt-4"
              onClick={() => onNewRequest('hotel')}
            >
              <Plus size={16} />
              <span>Raise an Issue or Request</span>
            </button>
          )}
        </div>
      ) : (
        <div className="history-ticket-grid">
          {filteredRequests.map(ticket => (
            <div 
              key={ticket.id} 
              className="ticket-card"
              onClick={() => onSelectRequest(ticket.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectRequest(ticket.id);
                }
              }}
            >
              <div className="ticket-card-top">
                <div className="ticket-cat-badge">
                  {getCategoryIcon(ticket.category)}
                  <span className="font-semibold">{ticket.categoryLabel}</span>
                </div>
                {getStatusBadge(ticket.status)}
              </div>

              <h3 className="ticket-title">
                {getSubjectOrSummary(ticket)}
              </h3>

              {ticket.category === 'hotel' && (
                <div className="ticket-meta-line text-emerald-800 font-medium">
                  <Hotel size={14} />
                  <span>{(ticket as any).hotelName}</span>
                  {(ticket as any).bookingReference && (
                    <span className="text-slate-400 font-normal">| Ref: {(ticket as any).bookingReference}</span>
                  )}
                </div>
              )}

              <div className="ticket-meta-footer">
                <div className="ticket-meta-info">
                  <span className="ticket-ref-id">{ticket.id}</span>
                  <span className="ticket-date">
                    <Clock size={13} />
                    {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <div className="ticket-msg-count">
                  <MessageSquare size={14} />
                  <span>{ticket.followUpMessages?.length || 0}</span>
                  <ChevronRight size={16} className="text-slate-400 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
