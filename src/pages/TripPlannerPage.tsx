import React, { useEffect } from 'react';
import { Sparkles, Compass } from 'lucide-react';
import TripPlannerForm from '../components/trip-planner/TripPlannerForm';
import '../components/trip-planner/TripPlannerForm.css';

const TripPlannerPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="planner-page-wrapper">
      <div className="planner-page-content">
        {/* Unified TravelSphere Page Header */}
        <div className="planner-page-header">
          <div className="planner-header-pill">
            <Sparkles size={14} />
            <span>AI Trip Architect</span>
          </div>
          <h1 className="planner-main-heading">
            Plan Your <span className="text-highlight">Dream Journey</span>
          </h1>
          <p className="planner-header-subtext">
            Tell us where you want to go and what you love. Our intelligent trip engine crafts a bespoke, 
            day-by-day travel plan with real-time route optimization.
          </p>
        </div>

        {/* Interactive Trip Planner Form Card */}
        <TripPlannerForm />
      </div>
    </div>
  );
};

export default TripPlannerPage;