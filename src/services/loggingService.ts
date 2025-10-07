import { getDatabase, ref, set } from 'firebase/database';
import { initializeApp, getApps } from 'firebase/app';

// Initialize Firebase using environment variables only
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_DATABASE_URL',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required Firebase environment variables:', missingEnvVars);
  console.error('Please set these variables in your .env file');
}

console.log('🔥 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  databaseURL: firebaseConfig.databaseURL,
  nodeEnv: process.env.NODE_ENV
});

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Use emulator in development mode
const database = getDatabase(app);

// Function to connect to emulator
async function connectToEmulator() {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    try {
      const { connectDatabaseEmulator } = await import('firebase/database');
      
      // Connect to emulator (will throw error if already connected)
      try {
        connectDatabaseEmulator(database, 'localhost', 9000);
        console.log('🔥 Connected to Firebase Realtime Database emulator');
        console.log('📊 Database URL: http://localhost:9000');
        console.log('🎛️  Emulator UI: http://localhost:4000');
      } catch {
        // Already connected to emulator, ignore error
        console.log('🔥 Already connected to Firebase emulator');
      }
    } catch (error) {
      console.warn('Could not connect to Firebase Realtime Database emulator:', error);
    }
  } else {
    console.log('🔥 Using production Firebase Realtime Database');
    console.log('📊 Database URL:', firebaseConfig.databaseURL);
    console.log('🌍 Project ID:', firebaseConfig.projectId);
  }
}

// Connect to emulator
connectToEmulator();

export interface UserLocation {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
}

export interface FileProcessingLog {
  sessionId: string;
  userId?: string;
  timestamp: string;
  location: UserLocation;
  files: {
    id: string;
    name: string;
    size: number;
    type: string;
  }[];
  processingResult: {
    originalSize: number;
    minifiedSize: number;
    compressionRatio: number;
    processingTime: number;
  };
  userAgent: string;
  ipAddress?: string;
}

export interface UserActivityLog {
  sessionId: string;
  userId?: string;
  timestamp: string;
  location: UserLocation;
  activity: 'page_visit' | 'file_upload' | 'file_processing' | 'download' | 'error';
  details?: Record<string, unknown>;
  userAgent: string;
  ipAddress?: string;
}

/**
 * Log file processing activity to Firebase Realtime Database
 */
export async function logFileProcessing(processingData: Omit<FileProcessingLog, 'timestamp'>): Promise<void> {
  try {
    console.log('🔥 Logging file processing to Firebase...');
    console.log('🔑 Session ID:', processingData.sessionId);
    console.log('📁 Files count:', processingData.files.length);
    console.log('🌍 Location:', processingData.location.city, processingData.location.country);
    console.log('🌐 IP Address:', processingData.ipAddress);
    
    // Check if database is available
    if (!database) {
      throw new Error('Firebase database not initialized');
    }
    
    // Use session ID as the key for the log entry
    const logRef = ref(database, `logs/file_processing/${processingData.sessionId}`);
    
    const logEntry: FileProcessingLog = {
      ...processingData,
      timestamp: new Date().toISOString(),
    };
    
    console.log('📝 Writing to Firebase path:', `logs/file_processing/${processingData.sessionId}`);
    console.log('📝 Log entry data:', JSON.stringify(logEntry, null, 2));
    await set(logRef, logEntry);
    console.log('✅ File processing logged successfully with session ID:', processingData.sessionId);
    console.log('📊 Check Firebase at: https://console.firebase.google.com/project/weldpak/database/weldpak-default-rtdb/data');
  } catch (error) {
    console.error('❌ Failed to log file processing:', error);
    console.error('🔍 Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as { code?: string })?.code,
      stack: error instanceof Error ? error.stack : undefined
    });
    // Don't throw error to avoid breaking the main functionality
  }
}

/**
 * Log general user activity to Firebase Realtime Database
 */
export async function logUserActivity(activityData: Omit<UserActivityLog, 'timestamp'>): Promise<void> {
  try {
    // Use session ID as the key for the log entry
    const logRef = ref(database, `logs/user_activities/${activityData.sessionId}`);
    
    const logEntry: UserActivityLog = {
      ...activityData,
      timestamp: new Date().toISOString(),
    };
    
    console.log('📝 Writing to Firebase path:', `logs/user_activities/${activityData.sessionId}`);
    console.log('📝 Activity entry data:', JSON.stringify(logEntry, null, 2));
    await set(logRef, logEntry);
    console.log('✅ User activity logged successfully with session ID:', activityData.sessionId);
    console.log('📊 Check Firebase at: https://console.firebase.google.com/project/weldpak/database/weldpak-default-rtdb/data');
  } catch (error) {
    console.error('Failed to log user activity:', error);
    // Don't throw error to avoid breaking the main functionality
  }
}

/**
 * Get user's location using browser geolocation API
 */
export async function getUserLocation(): Promise<UserLocation> {
  return new Promise((resolve) => {
    // Default location data
    const defaultLocation: UserLocation = {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    // Check if geolocation is available
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      resolve(defaultLocation);
      return;
    }

    // Get current position
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        try {
          // Use reverse geocoding to get location details
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          
          if (response.ok) {
            const data = await response.json();
            resolve({
              country: data.countryName || 'Unknown',
              region: data.principalSubdivision || 'Unknown',
              city: data.city || data.locality || 'Unknown',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              latitude,
              longitude,
              accuracy,
            });
          } else {
            resolve({
              ...defaultLocation,
              latitude,
              longitude,
              accuracy,
            });
          }
        } catch (error) {
          console.warn('Failed to get location details:', error);
          resolve({
            ...defaultLocation,
            latitude,
            longitude,
            accuracy,
          });
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        resolve(defaultLocation);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

/**
 * Get user's IP address and approximate location
 */
export async function getIPLocation(): Promise<{ ip: string; location: UserLocation }> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (response.ok) {
      const data = await response.json();
      return {
        ip: data.ip,
        location: {
          country: data.country_name || 'Unknown',
          region: data.region || 'Unknown',
          city: data.city || 'Unknown',
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          latitude: data.latitude,
          longitude: data.longitude,
        },
      };
    }
  } catch (error) {
    console.warn('Failed to get IP location:', error);
  }
  
  return {
    ip: 'Unknown',
    location: {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };
}

/**
 * Generate a unique session ID for tracking user sessions
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Test function to verify Firebase connection and logging
 */
export async function testLogging(): Promise<void> {
  try {
    console.log('🧪 Testing Firebase logging...');
    
    // First test simple connection
    const testRef = ref(database, 'test/browser-connection');
    await set(testRef, { 
      message: 'Browser connection test', 
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent 
    });
    console.log('✅ Simple Firebase connection test passed');
    
    const testSessionId = generateSessionId();
    const testLocation: UserLocation = {
      country: 'Test Country',
      region: 'Test Region',
      city: 'Test City',
      timezone: 'UTC',
    };

    // Test user activity logging
    await logUserActivity({
      sessionId: testSessionId,
      location: testLocation,
      activity: 'file_processing',
      details: { test: true, timestamp: new Date().toISOString() },
      userAgent: navigator.userAgent,
      ipAddress: '127.0.0.1',
    });

    console.log('✅ Test logging completed successfully');
    console.log('📊 Check Firebase Realtime Database at:', process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : 'https://console.firebase.google.com/project/' + firebaseConfig.projectId + '/database');
    console.log('🔑 Session ID used:', testSessionId);
    console.log('🗂️  Check path: logs/user_activities/' + testSessionId);
  } catch (error) {
    console.error('❌ Test logging failed:', error);
    console.error('🔍 Error details:', error);
  }
}
