// Emergency page
import React from 'react';
import EmergencyDashboard from '../components/emergency/EmergencyDashboard';
import type { EmergencyType } from '@/types/api';

const EmergencyPage: React.FC = () => {
  const handleEmergencyRequest = (type: EmergencyType) => {
    console.log('Emergency request:', type);
    // Emergency handling is done within the EmergencyDashboard component
  };

  return (
    <div className="emergency-page">
      <div className="page-header">
        <h1>Emergency Support</h1>
        <p>Get immediate assistance for urgent travel situations</p>
      </div>
      <EmergencyDashboard onEmergencyRequest={handleEmergencyRequest} />
    </div>
  );
};

export default EmergencyPage;