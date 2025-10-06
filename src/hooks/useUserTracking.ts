import { useState, useEffect, useCallback } from 'react';
import { getUserLocation, getIPLocation, generateSessionId, logUserActivity, UserLocation } from '@/services/loggingService';

export interface UserTrackingState {
  sessionId: string;
  location: UserLocation | null;
  isLocationLoading: boolean;
  error: string | null;
}

export function useUserTracking() {
  const [state, setState] = useState<UserTrackingState>({
    sessionId: '',
    location: null,
    isLocationLoading: true,
    error: null,
  });

  // Initialize session and location tracking
  useEffect(() => {
    const initializeTracking = async () => {
      try {
        // Generate or retrieve session ID
        const sessionId = sessionStorage.getItem('weldpak_session_id') || generateSessionId();
        sessionStorage.setItem('weldpak_session_id', sessionId);

        // Try to get precise location first, fallback to IP location
        let location: UserLocation;
        try {
          location = await getUserLocation();
        } catch (error) {
          console.warn('Failed to get precise location, trying IP location:', error);
          const ipData = await getIPLocation();
          location = ipData.location;
        }

        setState({
          sessionId,
          location,
          isLocationLoading: false,
          error: null,
        });

        // Log page visit activity
        logUserActivity({
          sessionId,
          location,
          activity: 'page_visit',
          details: {
            page: window.location.pathname,
            referrer: document.referrer,
          },
          userAgent: navigator.userAgent,
        }).catch(error => {
          console.error('Failed to log page visit:', error);
        });

      } catch (error) {
        console.error('Failed to initialize user tracking:', error);
        setState(prev => ({
          ...prev,
          isLocationLoading: false,
          error: error instanceof Error ? error.message : 'Failed to initialize tracking',
        }));
      }
    };

    initializeTracking();
  }, []);

  // Function to log custom activities
  const logActivity = useCallback(async (activity: string, details?: Record<string, any>) => {
    if (!state.sessionId || !state.location) {
      console.warn('Cannot log activity: session or location not initialized');
      return;
    }

    try {
      await logUserActivity({
        sessionId: state.sessionId,
        location: state.location,
        activity: activity as any,
        details,
        userAgent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }, [state.sessionId, state.location]);

  // Function to refresh location
  const refreshLocation = useCallback(async () => {
    setState(prev => ({ ...prev, isLocationLoading: true, error: null }));
    
    try {
      const location = await getUserLocation();
      setState(prev => ({
        ...prev,
        location,
        isLocationLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLocationLoading: false,
        error: error instanceof Error ? error.message : 'Failed to get location',
      }));
    }
  }, []);

  return {
    ...state,
    logActivity,
    refreshLocation,
  };
}
