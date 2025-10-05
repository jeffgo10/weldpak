'use client';

import React from 'react';
import { Badge } from 'react-bootstrap';
import { apiService } from '@/services/apiService';

const ApiStatusIndicator: React.FC = () => {
  const isUsingFirebase = apiService.isUsingFirebaseFunctions();
  const config = apiService.getConfig();
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Production mode - show only a subtle dot
  if (!isDevelopment) {
    return (
      <div className="d-flex justify-content-center mb-3">
        <div 
          className={`rounded-circle shadow-sm ${isUsingFirebase ? 'bg-success' : 'bg-info'}`}
          style={{ width: '8px', height: '8px' }}
          title={isUsingFirebase ? 'Firebase Functions' : 'Next.js API'}
        />
      </div>
    );
  }

  // Development mode - show full badge with details
  return (
    <div className="d-flex align-items-center gap-2 mb-3">
      <small className="text-muted">
        <i className="fas fa-server me-1"></i>
        Backend:
      </small>
      <Badge 
        bg={isUsingFirebase ? "success" : "info"}
        className="d-flex align-items-center gap-1"
      >
        <i className={`fas fa-${isUsingFirebase ? 'cloud' : 'server'}`}></i>
        {isUsingFirebase ? 'Firebase Functions' : 'Next.js API'}
      </Badge>
      
      <small className="text-muted">
        (Config: USE_FIREBASE_FUNCTIONS={config.useFirebaseFunctions ? 'true' : 'false'})
      </small>
    </div>
  );
};

export default ApiStatusIndicator;
