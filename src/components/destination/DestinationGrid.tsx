import React, { useState } from 'react';
import DestinationCard from './DestinationCard';
import VRModal from './VRModal';
import type { Destination } from '@/types/destination';
import './DestinationGrid.css';

interface DestinationGridProps {
  destinations: Destination[];
  onPlanTrip: (destinationId: string) => void;
  loading?: boolean;
  error?: string | null;
}

const DestinationGrid: React.FC<DestinationGridProps> = ({
  destinations,
  onPlanTrip,
  loading = false,
  error = null,
}) => {
  const [vrModalOpen, setVrModalOpen] = useState(false);
  const [currentVrUrl, setCurrentVrUrl] = useState<string>('');

  const handleVRPreview = (vrUrl: string) => {
    setCurrentVrUrl(vrUrl);
    setVrModalOpen(true);
  };

  const handleCloseVRModal = () => {
    setVrModalOpen(false);
    setCurrentVrUrl('');
  };

  if (loading) {
    return (
      <div className="destination-grid-loading">
        <div className="loading-spinner">
          <div className="spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-icon">🌍</div>
          </div>
          <p className="loading-message">Discovering amazing destinations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="destination-grid-error">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Unable to Load Destinations</h3>
          <p>{error}</p>
          <button 
            className="btn primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (destinations.length === 0) {
    return (
      <div className="destination-grid-empty">
        <div className="empty-state">
          <div className="empty-icon">🗺️</div>
          <h3>No Destinations Found</h3>
          <p>We're working on adding more amazing destinations for you to explore.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="destination-grid">
        {destinations.map((destination, index) => (
          <DestinationCard
            key={destination.id}
            id={destination.id}
            name={destination.name}
            description={destination.description}
            imageUrl={destination.imageUrl}
            vrPreviewUrl={destination.vrPreviewUrl}
            priority={index < 3} // Prioritize first 3 cards for above-the-fold loading
            onPlanTrip={onPlanTrip}
            onVRPreview={handleVRPreview}
          />
        ))}
      </div>

      {vrModalOpen && (
        <VRModal
          vrUrl={currentVrUrl}
          onClose={handleCloseVRModal}
          isOpen={vrModalOpen}
        />
      )}
    </>
  );
};

export default DestinationGrid;