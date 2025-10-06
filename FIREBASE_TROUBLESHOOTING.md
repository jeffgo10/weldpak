# Firebase Realtime Database Troubleshooting

## 🐛 **Issue: Database showing `null`**

### ✅ **Root Cause Found**
The Firebase connection is working correctly, but there might be issues with:
1. **Environment Configuration**: Placeholder values in `.env.local`
2. **Browser-side Connection**: Emulator connection not working in browser
3. **Data Persistence**: Data not persisting in emulator

### 🔧 **Fixes Applied**

1. **Updated Environment Configuration**:
   - Fixed `.env.local` with proper values for local development
   - Added fallback values in Firebase config
   - Added CSRF_SECRET configuration

2. **Enhanced Firebase Connection**:
   - Improved emulator connection logic
   - Added better error handling and logging
   - Added connection status checking

3. **Comprehensive Testing**:
   - Created debug scripts to test Firebase connection
   - Added browser-side testing functions
   - Enhanced logging with detailed error information

## 🧪 **Testing Steps**

### 1. **Verify Environment Setup**
```bash
# Check if environment file exists and has correct values
cat .env.local

# Should show:
NODE_ENV=development
NEXT_PUBLIC_FIREBASE_DATABASE_URL=http://localhost:9000?ns=demo-project-default-rtdb
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-project
CSRF_SECRET=development-csrf-secret-key-change-in-production
```

### 2. **Test Firebase Connection (Node.js)**
```bash
# Test Firebase connection with Node.js script
npm run debug:firebase

# Should show:
✅ Firebase app initialized
✅ Connected to Firebase emulator
✅ Test data written successfully
✅ Log data written successfully
```

### 3. **Start Development Server**
```bash
# Start both Firebase emulator and Next.js
npm run dev:local

# Or start them separately:
npm run firebase:emulators:db  # Terminal 1
npm run dev                    # Terminal 2
```

### 4. **Test in Browser**
1. Open http://localhost:3000
2. Open browser console (F12)
3. Look for Firebase connection messages:
   ```
   🔥 Firebase Config: { projectId: "demo-project", databaseURL: "..." }
   🔥 Connected to Firebase Realtime Database emulator
   📊 Database URL: http://localhost:9000
   🎛️  Emulator UI: http://localhost:4000
   ```

4. Use "Test Firebase Logging" button in debug panel
5. Check console for logging messages

### 5. **Verify Data in Firebase Emulator UI**
1. Open http://localhost:4000
2. Click "Realtime Database"
3. Look for data under:
   - `test/` - Test connections
   - `logs/user_activities/` - User activity logs
   - `logs/file_processing/` - File processing logs

## 🔍 **Debugging Commands**

### Check Firebase Emulator Status
```bash
# Check if emulator is running
lsof -i :9000

# Check if emulator UI is accessible
curl -s http://localhost:4000 | grep -i "firebase"

# Test direct database access
curl -s "http://localhost:9000/test.json"
```

### Check Next.js Server
```bash
# Check if Next.js server is running
curl -s http://localhost:3000/api/csrf

# Should return JSON with csrfToken
```

### Test Firebase Connection
```bash
# Run comprehensive Firebase test
npm run debug:firebase

# Run simple Firebase test
node scripts/simple-firebase-test.js

# Test CSRF and API
npm run test:csrf
```

## 🚨 **Common Issues & Solutions**

### Issue 1: Environment Variables Not Loaded
**Symptoms**: `undefined` values in Firebase config
**Solution**:
```bash
# Make sure .env.local exists and has correct values
cp env.example .env.local
# Edit .env.local with proper values
```

### Issue 2: Firebase Emulator Not Running
**Symptoms**: Connection refused errors
**Solution**:
```bash
# Start Firebase emulator
npm run firebase:emulators:db

# Or start all emulators
npm run firebase:emulators
```

### Issue 3: Browser Can't Connect to Emulator
**Symptoms**: Firebase connection fails in browser
**Solution**:
1. Check browser console for errors
2. Verify emulator is running on localhost:9000
3. Check for CORS issues
4. Try "Test Firebase Logging" button

### Issue 4: Data Not Persisting
**Symptoms**: Data appears briefly then disappears
**Solution**:
1. Check Firebase Emulator UI for data
2. Verify data is being written to correct path
3. Check for namespace issues

### Issue 5: CSRF Errors (403 Forbidden)
**Symptoms**: API calls return 403 errors
**Solution**:
```bash
# Make sure CSRF_SECRET is set in .env.local
echo "CSRF_SECRET=development-csrf-secret-key" >> .env.local

# Test CSRF flow
npm run test:csrf
```

## 📊 **Expected Data Structure**

When working correctly, you should see:

```
demo-project-default-rtdb/
├── test/
│   ├── browser-connection/
│   └── connection/
├── logs/
│   ├── file_processing/
│   │   └── session_1234567890_abc123def/
│   │       ├── sessionId: "session_1234567890_abc123def"
│   │       ├── timestamp: "2024-01-15T10:30:00.000Z"
│   │       ├── location: { country, region, city, timezone }
│   │       ├── files: [{ name, size, type }]
│   │       ├── processingResult: { compressionRatio, processingTime }
│   │       ├── userAgent: "Mozilla/5.0..."
│   │       └── ipAddress: "192.168.1.100"
│   └── user_activities/
│       └── session_1234567890_abc123def/
│           ├── sessionId, timestamp, location
│           ├── activity: "file_processing"
│           ├── details: { fileCount, totalSize }
│           ├── userAgent, ipAddress
```

## 🎯 **Success Indicators**

- ✅ Firebase emulator running on port 9000
- ✅ Firebase Emulator UI accessible at http://localhost:4000
- ✅ Next.js server running on port 3000
- ✅ Browser console shows Firebase connection messages
- ✅ "Test Firebase Logging" button works
- ✅ Data visible in Firebase Emulator UI
- ✅ File processing creates log entries
- ✅ Session IDs used as database keys

## 🚀 **Next Steps**

1. **Follow testing steps** above
2. **Check browser console** for Firebase messages
3. **Use debug tools** to identify specific issues
4. **Verify data structure** in Firebase Emulator UI
5. **Test file processing** to ensure logging works

The Firebase connection should now work correctly with proper data logging!
