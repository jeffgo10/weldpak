#!/usr/bin/env node

/**
 * Simple Firebase Test
 * This script tests Firebase connection with minimal setup
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { initializeApp, getApps } = require('firebase/app');
const { getDatabase, ref, set, get, connectDatabaseEmulator } = require('firebase/database');

async function simpleTest() {
  console.log('🧪 Simple Firebase Test');
  console.log('======================');
  
  try {
    // Initialize Firebase
    const firebaseConfig = {
      apiKey: 'demo-api-key',
      authDomain: 'demo-project.firebaseapp.com',
      databaseURL: 'http://localhost:9000?ns=demo-project-default-rtdb',
      projectId: 'demo-project',
      storageBucket: 'demo-project.appspot.com',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:abcdef',
    };
    
    console.log('📊 Database URL:', firebaseConfig.databaseURL);
    
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase app initialized');
    } else {
      app = getApps()[0];
      console.log('✅ Using existing Firebase app');
    }
    
    // Get database
    const database = getDatabase(app);
    console.log('✅ Database instance created');
    
    // Connect to emulator
    try {
      connectDatabaseEmulator(database, 'localhost', 9000);
      console.log('✅ Connected to Firebase emulator');
    } catch (error) {
      console.log('⚠️  Emulator connection warning:', error.message);
    }
    
    // Test 1: Simple write
    console.log('\n📝 Test 1: Simple write...');
    const simpleRef = ref(database, 'simple-test');
    await set(simpleRef, { message: 'Hello Firebase!', timestamp: new Date().toISOString() });
    console.log('✅ Simple write successful');
    
    // Test 2: Read back
    console.log('\n📖 Test 2: Read back...');
    const snapshot = await get(simpleRef);
    console.log('✅ Read successful:', snapshot.val());
    
    // Test 3: Log structure
    console.log('\n📋 Test 3: Log structure...');
    const sessionId = `session_${Date.now()}`;
    const logRef = ref(database, `logs/test/${sessionId}`);
    const logData = {
      sessionId: sessionId,
      timestamp: new Date().toISOString(),
      test: true,
      message: 'This is a test log entry'
    };
    
    await set(logRef, logData);
    console.log('✅ Log entry created');
    console.log('🔑 Session ID:', sessionId);
    
    // Test 4: Read log entry
    console.log('\n📖 Test 4: Read log entry...');
    const logSnapshot = await get(logRef);
    console.log('✅ Log entry read:', logSnapshot.val());
    
    console.log('\n🎉 All tests passed!');
    console.log('📊 Check Firebase Emulator UI: http://localhost:4000');
    console.log('🗂️  Look for: logs/test/' + sessionId);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('🔍 Error details:', {
      message: error.message,
      code: error.code
    });
  }
}

// Run the test
simpleTest();
