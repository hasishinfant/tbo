import React, { useState, useEffect } from 'react';
import type { DestinationCardProps } from '@/types/destination';
import { Button, Icon } from '@/components/shared';
import LazyImage from '@/components/shared/LazyImage';
import { ConfidenceBadge, ConfidenceBreakdownModal, useConfidenceScore } from '@/confidence-engine';
import { trackImplicitSignal } from '@/confidence-engine/services/preferenceLearningService';
import './DestinationCard.css';

const DestinationCard: React.FC<DestinationCardProps> = ({
  id,
  name,
  description,
  imageUrl,
  vrPreviewUrl,
  priority = false,
  onPlanTrip,
  onVRPreview,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { score, loading } = useConfidenceScore(id);

  // Track view when component mounts
  useEffect(() => {
    const viewStartTime = Date.now();
    
    try {
      trackImplicitSignal({
        destinationId: id,
        action: 'view',
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
    
    // Track duration when component unmounts
    return () => {
      try {
        const duration = Date.now() - viewStartTime;
        if (duration > 1000) { // Only track if viewed for more than 1 second
          trackImplicitSignal({
            destinationId: id,
            action: 'view',
            duration,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error('Error tracking duration:', error);
      }
    };
  }, [id]);

  const handlePlanTrip = () => {
    try {
      trackImplicitSignal({
        destinationId: id,
        action: 'click',
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
    onPlanTrip(id);
  };

  const handleVRPreview = () => {
    if (vrPreviewUrl) {
      try {
        trackImplicitSignal({
          destinationId: id,
          action: 'click',
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error tracking VR click:', error);
      }
      onVRPreview(vrPreviewUrl);
    }
  };

  const handleBadgeClick = () => {
    if (score) {
      try {
        trackImplicitSignal({
          destinationId: id,
          action: 'click',
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error tracking badge click:', error);
      }
      setShowBreakdown(true);
    }
  };

  return (
    <article 
      className="destination-card card optimized-animation"
      role="article"
      aria-labelledby={`destination-${id}-title`}
    >
      <div className="destination-image-container">
        <LazyImage
          src={imageUrl}
          alt={`Beautiful view of ${name}`}
          className="destination-image"
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={85}
        />
        <div className="destination-overlay" />
        
        {/* Confidence Badge Overlay */}
        {!loading && score && (
          <div className="confidence-badge-overlay">
            <ConfidenceBadge 
              score={score.score}
              badge={score.badge}
              onClick={handleBadgeClick}
              size="sm"
            />
          </div>
        )}
      </div>
      
      <div className="destination-content">
        <h3 
          id={`destination-${id}-title`}
          className="destination-title"
        >
          <Icon name="location" size="sm" />
          {name}
        </h3>
        
        <p className="destination-description">
          {description}
        </p>
        
        <div className="destination-actions">
          {vrPreviewUrl && (
            <Button 
              variant="secondary"
              icon="vr"
              onClick={handleVRPreview}
              className="vr-button"
            >
              Preview in VR
            </Button>
          )}
          
          <Button 
            variant="primary"
            icon="plane"
            onClick={handlePlanTrip}
            className="plan-button"
          >
            Plan My Trip
          </Button>
        </div>
      </div>
      
      {/* Confidence Breakdown Modal */}
      {showBreakdown && score && (
        <ConfidenceBreakdownModal 
          score={score}
          onClose={() => setShowBreakdown(false)}
        />
      )}
    </article>
  );
};

export default DestinationCard;