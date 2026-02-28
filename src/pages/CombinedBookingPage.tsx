/**
 * Combined Booking Page
 * 
 * Page component that demonstrates the combined flight + hotel booking flow.
 * Allows users to book flights and hotels together in a unified experience.
 */

import React, { useState } from 'react';
import { CombinedBookingWorkflow, CombinedItineraryView } from '../components/booking';
import type { CombinedBookingConfirmation } from '../services/combinedBookingService';
import styles from './CombinedBookingPage.module.css';

export const CombinedBookingPage: React.FC = () => {
  const [confirmation, setConfirmation] = useState<CombinedBookingConfirmation | null>(null);
  const [showWorkflow, setShowWorkflow] = useState(true);

  const handleBookingComplete = (bookingConfirmation: CombinedBookingConfirmation) => {
    setConfirmation(bookingConfirmation);
    setShowWorkflow(false);
  };

  const handleCancel = () => {
    // Navigate back to search or home page
    window.history.back();
  };

  const handleDownload = () => {
    // Implementation for downloading itinerary
    console.log('Download itinerary');
    alert('Download functionality would be implemented here');
  };

  const handleEmail = () => {
    // Implementation for emailing itinerary
    console.log('Email itinerary');
    alert('Email functionality would be implemented here');
  };

  return (
    <div className={styles.page}>
      {showWorkflow && !confirmation && (
        <CombinedBookingWorkflow
          onComplete={handleBookingComplete}
          onCancel={handleCancel}
        />
      )}

      {confirmation && (
        <CombinedItineraryView
          confirmation={confirmation}
          onDownload={handleDownload}
          onEmail={handleEmail}
        />
      )}
    </div>
  );
};

export default CombinedBookingPage;
