import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  EmergencyLandingView, 
  HotelComplaintView, 
  MedicalEmergencyView, 
  LostPassportView, 
  LocalAssistanceView, 
  ComplaintHistoryView, 
  ComplaintDetailView 
} from '../components/emergency';
import '../components/emergency/Emergency.css';

const EmergencyPage: React.FC = () => {
  const { tab, requestId } = useParams<{ tab?: string; requestId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top on route / tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [tab, requestId, location.pathname]);

  // Handlers for navigation
  const handleSelectCategory = (category: 'medical' | 'passport' | 'hotel' | 'local') => {
    navigate(`/emergency-support/${category}`);
  };

  const handleBackToLanding = () => {
    navigate('/emergency-support');
  };

  const handleViewHistory = () => {
    navigate('/emergency-support/tickets');
  };

  const handleViewRequestDetail = (id: string) => {
    navigate(`/emergency-support/requests/${id}`);
  };

  const handleNewRequest = (category?: 'medical' | 'passport' | 'hotel' | 'local') => {
    if (category) {
      navigate(`/emergency-support/${category}`);
    } else {
      navigate('/emergency-support');
    }
  };

  // 1. Direct Ticket Details Route: /emergency-support/requests/:requestId
  if (requestId) {
    return (
      <div className="emergency-page-wrapper">
        <div className="emergency-page-content">
          <ComplaintDetailView 
            requestId={requestId} 
            onBack={handleViewHistory} 
          />
        </div>
      </div>
    );
  }

  // 2. Specific Category / Tab Route
  if (tab === 'hotel') {
    return (
      <div className="emergency-page-wrapper">
        <div className="emergency-page-content">
          <HotelComplaintView 
            onBack={handleBackToLanding}
            onSuccessTrack={handleViewRequestDetail}
          />
        </div>
      </div>
    );
  }

  if (tab === 'medical') {
    return (
      <div className="emergency-page-wrapper">
        <div className="emergency-page-content">
          <MedicalEmergencyView 
            onBack={handleBackToLanding}
            onSuccessTrack={handleViewRequestDetail}
          />
        </div>
      </div>
    );
  }

  if (tab === 'passport') {
    return (
      <div className="emergency-page-wrapper">
        <div className="emergency-page-content">
          <LostPassportView 
            onBack={handleBackToLanding}
            onSuccessTrack={handleViewRequestDetail}
          />
        </div>
      </div>
    );
  }

  if (tab === 'local') {
    return (
      <div className="emergency-page-wrapper">
        <div className="emergency-page-content">
          <LocalAssistanceView 
            onBack={handleBackToLanding}
            onSuccessTrack={handleViewRequestDetail}
          />
        </div>
      </div>
    );
  }

  if (tab === 'tickets' || tab === 'history') {
    return (
      <div className="emergency-page-wrapper">
        <div className="emergency-page-content">
          <ComplaintHistoryView 
            onBack={handleBackToLanding}
            onSelectRequest={handleViewRequestDetail}
            onNewRequest={handleNewRequest}
          />
        </div>
      </div>
    );
  }

  // 3. Default: Landing View
  return (
    <div className="emergency-page-wrapper">
      <div className="emergency-page-content">
        <EmergencyLandingView 
          onSelectCategory={handleSelectCategory}
          onViewHistory={handleViewHistory}
          onViewRequestDetail={handleViewRequestDetail}
        />
      </div>
    </div>
  );
};

export default EmergencyPage;