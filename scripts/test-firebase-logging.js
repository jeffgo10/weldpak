#!/usr/bin/env node

/**
 * Firebase Logging Test Script
 * This script tests the Firebase Realtime Database logging functionality
 */

const BASE_URL = 'http://localhost:3000';

async function testFirebaseLogging() {
  console.log('🔥 Testing Firebase Realtime Database Logging');
  console.log('============================================');
  
  try {
    // Step 1: Test file processing with logging
    console.log('\n1️⃣ Testing file processing with logging...');
    
    const testFiles = [
      {
        id: 'test-1',
        name: 'test.js',
        size: 150,
        type: 'application/javascript',
        content: 'console.log("Hello, WeldPak!");\nconst x = 1 + 2;',
        order: 0
      }
    ];
    
    const sessionId = `test-session-${Date.now()}`;
    const userLocation = {
      country: 'Test Country',
      region: 'Test Region',
      city: 'Test City',
      timezone: 'UTC'
    };
    
    // First, get CSRF token
    console.log('🔐 Fetching CSRF token...');
    const csrfResponse = await fetch(`${BASE_URL}/api/csrf`);
    
    if (!csrfResponse.ok) {
      console.error(`❌ Failed to fetch CSRF token: ${csrfResponse.status}`);
      return;
    }
    
    const csrfData = await csrfResponse.json();
    console.log('✅ CSRF token received');
    
    // Now test file processing
    console.log('📁 Processing test files...');
    const processResponse = await fetch(`${BASE_URL}/api/process-files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfData.csrfToken,
        'User-Agent': 'Firebase-Logging-Test/1.0'
      },
      body: JSON.stringify({
        files: testFiles,
        sessionId: sessionId,
        userLocation: userLocation
      })
    });
    
    console.log(`📊 Process response status: ${processResponse.status}`);
    
    if (processResponse.ok) {
      const result = await processResponse.json();
      console.log('✅ File processing successful!');
      console.log('📄 Result ID:', result.id);
      console.log('📊 Compression ratio:', result.compressionRatio);
      console.log('🔑 Session ID:', result.sessionId);
      
      console.log('\n📊 Check Firebase Realtime Database:');
      console.log('   • Emulator UI: http://localhost:4000');
      console.log('   • Look for session:', sessionId);
      console.log('   • Check logs/file_processing/ and logs/user_activities/');
      
    } else {
      const error = await processResponse.text();
      console.error('❌ File processing failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the development server is running:');
    console.log('   npm run dev:local');
    console.log('\n💡 And check Firebase emulator is running:');
    console.log('   http://localhost:4000');
  }
}

// Run the test
testFirebaseLogging();
