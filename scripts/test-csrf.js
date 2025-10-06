#!/usr/bin/env node

/**
 * CSRF Test Script
 * This script tests the CSRF token flow to help debug 403 errors
 */

const BASE_URL = 'http://localhost:3000';

async function testCSRF() {
  console.log('🧪 Testing CSRF Token Flow');
  console.log('==========================');
  
  try {
    // Step 1: Get CSRF token
    console.log('\n1️⃣ Fetching CSRF token...');
    const csrfResponse = await fetch(`${BASE_URL}/api/csrf`);
    
    if (!csrfResponse.ok) {
      console.error(`❌ Failed to fetch CSRF token: ${csrfResponse.status} ${csrfResponse.statusText}`);
      return;
    }
    
    const csrfData = await csrfResponse.json();
    console.log('✅ CSRF token received:', csrfData.csrfToken ? 'Present' : 'Missing');
    
    // Step 2: Test process-files endpoint with CSRF token
    console.log('\n2️⃣ Testing process-files endpoint with CSRF token...');
    
    const testFiles = [
      {
        id: 'test-1',
        name: 'test.js',
        size: 100,
        type: 'application/javascript',
        content: 'console.log("test");',
        order: 0
      }
    ];
    
    const processResponse = await fetch(`${BASE_URL}/api/process-files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfData.csrfToken
      },
      body: JSON.stringify({
        files: testFiles,
        sessionId: 'test-session',
        userLocation: {
          country: 'Test Country',
          region: 'Test Region',
          city: 'Test City',
          timezone: 'UTC'
        }
      })
    });
    
    console.log(`📊 Response status: ${processResponse.status}`);
    
    if (processResponse.ok) {
      const result = await processResponse.json();
      console.log('✅ Process files successful!');
      console.log('📄 Result ID:', result.id);
      console.log('📊 Compression ratio:', result.compressionRatio);
    } else {
      const error = await processResponse.text();
      console.error('❌ Process files failed:', error);
    }
    
    // Step 3: Test without CSRF token (should fail)
    console.log('\n3️⃣ Testing process-files endpoint without CSRF token (should fail)...');
    
    const noCsrfResponse = await fetch(`${BASE_URL}/api/process-files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: testFiles
      })
    });
    
    console.log(`📊 Response status: ${noCsrfResponse.status}`);
    
    if (noCsrfResponse.status === 403) {
      console.log('✅ Correctly rejected request without CSRF token');
    } else {
      console.log('⚠️  Request without CSRF token was not rejected');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the development server is running:');
    console.log('   npm run dev');
  }
}

// Run the test
testCSRF();
