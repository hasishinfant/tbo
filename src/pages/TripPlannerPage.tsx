// Trip planner page
import React from 'react';
import TripPlannerForm from '../components/trip-planner/TripPlannerForm';

const TripPlannerPage: React.FC = () => {
  return (
    <div className="trip-planner-page">
      <div className="page-header">
        <h1>Plan Your Perfect Trip</h1>
        <p>Tell us about your travel preferences and we'll create a personalized itinerary just for you</p>
      </div>
      <TripPlannerForm />
    </div>
  );
};

export default TripPlannerPage;