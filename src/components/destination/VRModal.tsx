import React, { useEffect, useRef, useState } from 'react';
import { Button, Icon, LoadingSpinner } from '@/components/shared';
import './VRModal.css';

interface VRModalProps {
  vrUrl: string;
  onClose: () => void;
  isOpen: boolean;
}

const VRModal: React.FC<VRModalProps> = ({ vrUrl, onClose, isOpen }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Handle iframe load events
  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [isOpen, vrUrl]);

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    if (iframeRef.current) {
      iframeRef.current.src = vrUrl;
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="vr-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="vr-modal-title"
      aria-describedby="vr-modal-description"
    >
      <div
        ref={modalRef}
        className="vr-modal-container"
        tabIndex={-1}
      >
        {/* Modal Header */}
        <div className="vr-modal-header">
          <h2 id="vr-modal-title" className="vr-modal-title">
            <Icon name="vr" size="lg" />
            Virtual Reality Preview
          </h2>
          <p id="vr-modal-description" className="vr-modal-description">
            Explore this destination in 360° virtual reality
          </p>
          <button
            className="vr-modal-close"
            onClick={onClose}
            aria-label="Close VR preview"
            type="button"
          >
            <Icon name="close" size="lg" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="vr-modal-content">
          {isLoading && (
            <div className="vr-modal-loading">
              <LoadingSpinner 
                size="lg"
                message="Loading VR experience..."
              />
            </div>
          )}

          {hasError && (
            <div className="vr-modal-error">
              <div className="error-container">
                <Icon name="warning" size="2xl" className="error-icon" />
                <h3>VR Content Unavailable</h3>
                <p>
                  We're unable to load the VR preview at this time. 
                  Please try again later or contact support if the problem persists.
                </p>
                <div className="error-actions">
                  <Button 
                    variant="secondary"
                    icon="arrow-right"
                    onClick={handleRetry}
                  >
                    Try Again
                  </Button>
                  <Button 
                    variant="primary"
                    icon="close"
                    onClick={onClose}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          {vrUrl && (
            <iframe
              ref={iframeRef}
              src={vrUrl}
              className={`vr-modal-iframe ${isLoading ? 'loading' : ''} ${hasError ? 'error' : ''}`}
              title="Virtual Reality Preview"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-scripts allow-same-origin allow-presentation"
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="vr-modal-footer">
          <div className="vr-modal-controls">
            <Button
              variant="secondary"
              icon="close"
              onClick={onClose}
            >
              Close Preview
            </Button>
            <div className="vr-modal-tips">
              <Icon name="info" size="sm" className="tip-icon" />
              <span className="tip-text">
                Use your mouse or touch to look around in 360°
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VRModal;