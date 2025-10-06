#!/usr/bin/env node

/**
 * Firebase Debug Script
 * This script helps debug Firebase Realtime Database connection issues
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { initializeApp, getApps } = require('firebase/app');
const { getDatabase, ref, set, connectDatabaseEmulator } = require('firebase/database');

async function debugFirebase() {
  console.log('🔍 Firebase Realtime Database Debug');
  console.log('==================================');
  
  try {
    // Check environment variables
    console.log('\n1️⃣ Environment Variables:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    console.log('NEXT_PUBLIC_FIREBASE_DATABASE_URL:', process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL);
    
    // Initialize Firebase
    console.log('\n2️⃣ Initializing Firebase...');
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'http://localhost:9000?ns=demo-project-default-rtdb',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef',
    };
    
    console.log('Firebase Config:', firebaseConfig);
    
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase app initialized');
    } else {
      app = getApps()[0];
      console.log('✅ Using existing Firebase app');
    }
    
    // Get database
    console.log('\n3️⃣ Getting Database...');
    const database = getDatabase(app);
    console.log('✅ Database instance created');
    
    // Connect to emulator in development
    if (process.env.NODE_ENV === 'development') {
      console.log('\n4️⃣ Connecting to Firebase Emulator...');
      try {
        connectDatabaseEmulator(database, 'localhost', 9000);
        console.log('✅ Connected to Firebase emulator at localhost:9000');
      } catch (error) {
        console.log('⚠️  Emulator connection warning (might already be connected):', error.message);
      }
    }
    
    // Test write operation
    console.log('\n5️⃣ Testing Database Write...');
    const testRef = ref(database, 'test/connection');
    const testData = {
      timestamp: new Date().toISOString(),
      message: 'Firebase connection test successful',
      environment: process.env.NODE_ENV || 'development'
    };
    
    await set(testRef, testData);
    console.log('✅ Test data written successfully');
    console.log('📊 Test data:', testData);
    
    // Test logging structure
    console.log('\n6️⃣ Testing Logging Structure...');
    const sessionId = `test-session-${Date.now()}`;
    const logRef = ref(database, `logs/file_processing/${sessionId}`);
    const logData = {
      sessionId: sessionId,
      timestamp: new Date().toISOString(),
      location: {
        country: 'Test Country',
        region: 'Test Region',
        city: 'Test City',
        timezone: 'UTC'
      },
      files: [{
        id: 'test-file-1',
        name: 'test.js',
        size: 100,
        type: 'application/javascript'
      }],
      processingResult: {
        originalSize: 100,
        minifiedSize: 50,
        compressionRatio: 0.5,
        processingTime: 100
      },
      userAgent: 'Firebase-Debug-Script/1.0',
      ipAddress: '127.0.0.1'
    };
    
    await set(logRef, logData);
    console.log('✅ Log data written successfully');
    console.log('🔑 Session ID:', sessionId);
    console.log('📊 Check Firebase Emulator UI: http://localhost:4000');
    console.log('🗂️  Path: logs/file_processing/' + sessionId);
    
  } catch (error) {
    console.error('❌ Firebase debug failed:', error);
    console.error('🔍 Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    console.log('\n💡 Troubleshooting Tips:');
    console.log('1. Make sure Firebase emulator is running: firebase emulators:start --only database');
    console.log('2. Check if port 9000 is available: lsof -i :9000');
    console.log('3. Verify .env.local has correct Firebase configuration');
    console.log('4. Check Firebase Emulator UI: http://localhost:4000');
  }
}

// Run the debug
debugFirebase();
