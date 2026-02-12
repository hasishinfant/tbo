// Enhanced Emergency dashboard component with icon system
import React from 'react';
import EmergencyButton from './EmergencyButton';
import { Icon, LoadingSpinner } from '@/components/shared';
import { EMERGENCY_TYPES } from '@/utils/constants';
import type { EmergencyType } from '@/types/api';
import './Emergency.css';

export interface EmergencyDashboardProps {
  onEmergencyRequest: (type: EmergencyType) => void;
  isLoading?: boolean;
}

const EmergencyDashboard: React.FC<EmergencyDashboardProps> = ({
  onEmergencyRequest,
  isLoading = false,
}) => {
  return (
    <div className="emergency-dashboard">
      {/* Header */}
      <div className="emergency-header">
        <h1 className="section-title">
          <Icon name="emergency" size="xl" />
          Emergency Support
        </h1>
        <p>Get immediate assistance for urgent travel situations</p>
        <div className="emergency-notice">
          <Icon name="warning" size="lg" />
          <strong>For life-threatening emergencies, call local emergency services immediately</strong>
        </div>
      </div>

      {/* Emergency Options */}
      <div className="emergency-options">
        <h2 className="subsection-title">
          <Icon name="help" size="lg" />
          What type of assistance do you need?
        </h2>
        <div className="emergency-grid">
          {EMERGENCY_TYPES.map((emergency) => (
            <EmergencyButton
              key={emergency.value}
              type={emergency.value}
              label={emergency.label}
              iconName={emergency.iconName}
              color={emergency.color}
              description={emergency.description}
              onPress={onEmergencyRequest}
              disabled={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="loading-overlay">
          <LoadingSpinner 
            size="lg"
            message="Submitting your emergency request..."
          />
        </div>
      )}

      {/* Additional Information */}
      <div className="emergency-info">
        <h3 className="subsection-title">
          <Icon name="info" size="md" />
          What happens next?
        </h3>
        <ul className="space-y-2">
          <li>
            <Icon name="check" size="sm" />
            Our emergency response team will be notified immediately
          </li>
          <li>
            <Icon name="check" size="sm" />
            You'll receive a confirmation with a reference number
          </li>
          <li>
            <Icon name="check" size="sm" />
            A specialist will contact you within 15 minutes
          </li>
          <li>
            <Icon name="check" size="sm" />
            We'll provide local emergency contacts and guidance
          </li>
        </ul>

        <div className="local-emergency">
          <h3 className="subsection-title">
            <Icon name="phone" size="md" />
            Local Emergency Numbers
          </h3>
          <p>If you need immediate emergency services, contact:</p>
          <ul className="space-y-2">
            <li>
              <Icon name="emergency" size="sm" />
              <strong>Police:</strong> Varies by country (911, 112, etc.)
            </li>
            <li>
              <Icon name="medical" size="sm" />
              <strong>Medical:</strong> Varies by country (911, 112, etc.)
            </li>
            <li>
              <Icon name="warning" size="sm" />
              <strong>Fire:</strong> Varies by country (911, 112, etc.)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmergencyDashboard;