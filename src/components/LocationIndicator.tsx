'use client';

import React from 'react';
import { Badge, Spinner } from 'react-bootstrap';
import { useUserTracking } from '@/hooks/useUserTracking';

const LocationIndicator: React.FC = () => {
  // Only show location badge in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const { location, isLocationLoading, error } = useUserTracking();

  if (isLocationLoading) {
    return (
      <Badge bg="secondary" className="d-flex align-items-center gap-1">
        <Spinner size="sm" />
        <span>Detecting location...</span>
      </Badge>
    );
  }

  if (error) {
    return (
      <Badge bg="warning" text="dark">
        <i className="fas fa-exclamation-triangle me-1"></i>
        Location unavailable
      </Badge>
    );
  }

  if (!location) {
    return (
      <Badge bg="secondary">
        <i className="fas fa-question-circle me-1"></i>
        Location unknown
      </Badge>
    );
  }

  const locationText = [location.city, location.region, location.country]
    .filter(Boolean)
    .join(', ');

  return (
    <Badge bg="info" title={`Timezone: ${location.timezone}`}>
      <i className="fas fa-map-marker-alt me-1"></i>
      {locationText}
    </Badge>
  );
};

export default LocationIndicator;
