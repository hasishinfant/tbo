import React from 'react';
import { dateUtils } from '../../utils/dateUtils';
import './DateRangePicker.css';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  startDateError?: string;
  endDateError?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startDateError,
  endDateError
}) => {
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 2);
  const maxDateString = maxDate.toISOString().split('T')[0];

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      const date = new Date(value);
      onStartDateChange(date);
      
      // If end date is before new start date, clear it
      if (endDate && date > endDate) {
        onEndDateChange(null);
      }
    } else {
      onStartDateChange(null);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      onEndDateChange(new Date(value));
    } else {
      onEndDateChange(null);
    }
  };

  const getMinEndDate = () => {
    if (startDate) {
      const minDate = new Date(startDate);
      minDate.setDate(minDate.getDate() + 1);
      return minDate.toISOString().split('T')[0];
    }
    return today;
  };

  return (
    <div className="date-range-picker">
      <label className="form-label">
        Travel Dates *
      </label>
      <div className="date-inputs">
        <div className="date-input-group">
          <label htmlFor="start-date" className="date-label">
            Departure Date
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate ? dateUtils.formatDateForInput(startDate) : ''}
            onChange={handleStartDateChange}
            min={today}
            max={maxDateString}
            className={`date-input ${startDateError ? 'error' : ''}`}
          />
          {startDateError && <div className="error-message">{startDateError}</div>}
        </div>

        <div className="date-separator">
          <span className="separator-icon">✈️</span>
        </div>

        <div className="date-input-group">
          <label htmlFor="end-date" className="date-label">
            Return Date
          </label>
          <input
            id="end-date"
            type="date"
            value={endDate ? dateUtils.formatDateForInput(endDate) : ''}
            onChange={handleEndDateChange}
            min={getMinEndDate()}
            max={maxDateString}
            className={`date-input ${endDateError ? 'error' : ''}`}
            disabled={!startDate}
          />
          {endDateError && <div className="error-message">{endDateError}</div>}
        </div>
      </div>

      {startDate && endDate && (
        <div className="trip-duration">
          <span className="duration-icon">📅</span>
          <span className="duration-text">
            {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
          </span>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;