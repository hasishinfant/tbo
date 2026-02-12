import React, { useState, useRef, useEffect } from 'react';
import { SAMPLE_DESTINATIONS } from '../../utils/constants';
import './DestinationDropdown.css';

interface DestinationDropdownProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const DestinationDropdown: React.FC<DestinationDropdownProps> = ({
  value,
  onChange,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDestinations, setFilteredDestinations] = useState(SAMPLE_DESTINATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter destinations based on search term
  useEffect(() => {
    const filtered = SAMPLE_DESTINATIONS.filter(destination =>
      destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDestinations(filtered);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedDestination = SAMPLE_DESTINATIONS.find(dest => dest.id === value);

  const handleSelect = (destinationId: string) => {
    onChange(destinationId);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="destination-dropdown" ref={dropdownRef}>
      <label htmlFor="destination" className="form-label">
        Destination *
      </label>
      <div className="dropdown-container">
        <button
          type="button"
          className={`dropdown-trigger ${error ? 'error' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="dropdown-value">
            {selectedDestination ? selectedDestination.name : 'Select a destination'}
          </span>
          <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>
            ▼
          </span>
        </button>

        {isOpen && (
          <div className="dropdown-menu" role="listbox">
            <div className="dropdown-search">
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                autoFocus
              />
            </div>
            <div className="dropdown-options">
              {filteredDestinations.length > 0 ? (
                filteredDestinations.map((destination) => (
                  <button
                    key={destination.id}
                    type="button"
                    className={`dropdown-option ${value === destination.id ? 'selected' : ''}`}
                    onClick={() => handleSelect(destination.id)}
                    role="option"
                    aria-selected={value === destination.id}
                  >
                    <img
                      src={destination.imageUrl}
                      alt={destination.name}
                      className="destination-image"
                    />
                    <div className="destination-info">
                      <div className="destination-name">{destination.name}</div>
                      <div className="destination-description">{destination.description}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="no-results">
                  No destinations found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default DestinationDropdown;