/**
 * Flight Segment Display Component
 * 
 * Displays flight segments with layover information for connecting flights.
 * 
 * Requirements: 2.3 - Add layover information to flight details display
 */

import React from 'react';
import type { FlightSegment } from '../../services/flightSearchService';
import { formatLayoverDuration } from '../../utils/layoverUtils';
import './FlightSegmentDisplay.css';

interface FlightSegmentDisplayProps {
  segments: FlightSegment[];
  showLayoverWarnings?: boolean;
}

/**
 * Component to display flight segments with layover information
 * 
 * Requirement 2.3: Display complete itinerary information including layover details
 */
export const FlightSegmentDisplay: React.FC<FlightSegmentDisplayProps> = ({
  segments,
  showLayoverWarnings = false,
}) => {
  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getLayoverWarning = (minutes: number): string | null => {
    if (minutes < 45) {
      return 'Short layover - may be tight for connections';
    }
    if (minutes > 360) {
      return 'Long layover - consider airport amenities';
    }
    return null;
  };

  return (
    <div className="flight-segment-display">
      {segments.map((segment, index) => (
        <React.Fragment key={`${segment.flightNumber}-${index}`}>
          {/* Flight Segment */}
          <div className="flight-segment">
            <div className="segment-header">
              <span className="airline-info">
                {segment.airline} {segment.flightNumber}
              </span>
              <span className="aircraft-info">{segment.aircraft}</span>
            </div>

            <div className="segment-route">
              <div className="route-point">
                <div className="airport-code">{segment.origin}</div>
                <div className="time">{formatTime(segment.departureTime)}</div>
                <div className="date">{formatDate(segment.departureTime)}</div>
                <div className="airport-name">{segment.originAirport}</div>
              </div>

              <div className="route-line">
                <div className="flight-duration">
                  {formatLayoverDuration(segment.duration)}
                </div>
                <div className="route-arrow">→</div>
              </div>

              <div className="route-point">
                <div className="airport-code">{segment.destination}</div>
                <div className="time">{formatTime(segment.arrivalTime)}</div>
                <div className="date">{formatDate(segment.arrivalTime)}</div>
                <div className="airport-name">{segment.destinationAirport}</div>
              </div>
            </div>

            <div className="segment-details">
              <span className="baggage-info">
                <strong>Baggage:</strong> {segment.baggage}
              </span>
              <span className="cabin-baggage-info">
                <strong>Cabin:</strong> {segment.cabinBaggage}
              </span>
            </div>
          </div>

          {/* Layover Information */}
          {segment.layoverDuration !== undefined && (
            <div className="layover-info">
              <div className="layover-icon">⏱️</div>
              <div className="layover-content">
                <div className="layover-duration">
                  <strong>Layover:</strong> {formatLayoverDuration(segment.layoverDuration)}
                </div>
                <div className="layover-location">
                  at {segment.destination} ({segment.destinationAirport})
                </div>
                {showLayoverWarnings && getLayoverWarning(segment.layoverDuration) && (
                  <div className="layover-warning">
                    ⚠️ {getLayoverWarning(segment.layoverDuration)}
                  </div>
                )}
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default FlightSegmentDisplay;
