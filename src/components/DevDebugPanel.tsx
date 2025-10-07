'use client';

import React, { useState } from 'react';
import { Badge, Button, Collapse, Card } from 'react-bootstrap';
import { useUserTracking } from '@/hooks/useUserTracking';
import { testLogging } from '@/services/loggingService';

const DevDebugPanel: React.FC = () => {
  const { sessionId, location, isLocationLoading, error, logActivity } = useUserTracking();
  const [showDetails, setShowDetails] = useState(false);

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const testLogActivity = () => {
    logActivity('test_activity', { 
      timestamp: new Date().toISOString(),
      testData: 'This is a test log entry'
    });
  };

  const testFirebaseLogging = async () => {
    await testLogging();
  };

  return (
    <Card className="mb-3" style={{ fontSize: '0.875rem' }}>
      <Card.Header className="py-2">
        <div className="d-flex justify-content-between align-items-center">
          <Badge bg="secondary">
            <i className="fas fa-bug me-1"></i>
            Dev Debug Panel
          </Badge>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>
        </div>
      </Card.Header>
      
      <Collapse in={showDetails}>
        <Card.Body className="py-2">
          <div className="row">
            <div className="col-md-6">
              <strong>Session Info:</strong>
              <div className="mb-2">
                <Badge bg="info" className="text-break" style={{ fontSize: '0.75rem' }}>
                  {sessionId || 'Not initialized'}
                </Badge>
              </div>
              
              <strong>Location Status:</strong>
              <div className="mb-2">
                {isLocationLoading ? (
                  <Badge bg="warning">Loading...</Badge>
                ) : error ? (
                  <Badge bg="danger">{error}</Badge>
                ) : location ? (
                  <Badge bg="success">Detected</Badge>
                ) : (
                  <Badge bg="secondary">Unknown</Badge>
                )}
              </div>
            </div>
            
            <div className="col-md-6">
              {location && (
                <>
                  <strong>Location Details:</strong>
                  <div className="mb-2">
                    <div><small>City: {location.city || 'N/A'}</small></div>
                    <div><small>Region: {location.region || 'N/A'}</small></div>
                    <div><small>Country: {location.country || 'N/A'}</small></div>
                    <div><small>Timezone: {location.timezone || 'N/A'}</small></div>
                    {location.latitude && location.longitude && (
                      <div><small>Coords: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</small></div>
                    )}
                  </div>
                </>
              )}
              
              <div className="mt-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={testLogActivity}
                  className="me-2"
                >
                  <i className="fas fa-paper-plane me-1"></i>
                  Test Log Activity
                </Button>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={testFirebaseLogging}
                >
                  <i className="fas fa-database me-1"></i>
                  Test Firebase Logging
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-2 pt-2 border-top">
            <small className="text-muted">
              <i className="fas fa-info-circle me-1"></i>
              This panel only appears in development mode. Check the Firebase Emulator UI at{' '}
              <a href="http://localhost:4000" target="_blank" rel="noopener noreferrer">
                http://localhost:4000
              </a>{' '}
              to view logged data.
            </small>
          </div>
        </Card.Body>
      </Collapse>
    </Card>
  );
};

export default DevDebugPanel;
