# WeldPak Local Development

## Quick Start with Firebase Realtime Database Emulator

Yes! You can absolutely use Firebase Realtime Database locally using the Firebase Emulator Suite. This is perfect for development and testing.

## 🚀 One-Command Setup

```bash
# Install dependencies and start everything
npm install
npm run dev:local
```

This will:
- ✅ Start Firebase Realtime Database emulator (port 9000)
- ✅ Start Next.js development server (port 3000)
- ✅ Open Firebase Emulator UI (port 4000)
- ✅ Automatically connect your app to the local database

## 📍 Available URLs

- **WeldPak App**: http://localhost:3000
- **Firebase Emulator UI**: http://localhost:4000
- **Database**: http://localhost:9000

## 🔧 Manual Setup (Alternative)

If you prefer to run commands separately:

```bash
# Terminal 1: Start Firebase emulator
npm run firebase:emulators:db

# Terminal 2: Start Next.js dev server
npm run dev
```

## 🎯 What You Get

### ✅ **Full Logging Functionality**
- User location tracking (geolocation + IP fallback)
- File processing logs with compression stats
- User activity tracking (page visits, uploads, etc.)
- Session management

### ✅ **Local Database**
- No internet required
- No Firebase project needed
- No usage costs
- Fast local operations

### ✅ **Real-time Data Viewing**
- Browse logged data in Firebase Emulator UI
- Export/import test data
- Test database rules
- View real-time updates

### ✅ **Development-Only UI Features**
- **Location Badge**: Shows detected user location (top-left)
- **Debug Panel**: Detailed session info, location data, and test buttons
- **Emulator Links**: Direct links to Firebase Emulator UI
- **Test Logging**: Buttons to test logging functionality

**Note**: These UI elements only appear in development mode and will be hidden in production deployment.

## 🗄️ Database Structure

Your local database will contain:

```
logs/
├── file_processing/
│   └── [session-id]/
│       ├── sessionId, timestamp, location
│       ├── files: [{ name, size, type }]
│       ├── processingResult: { compressionRatio, processingTime }
│       └── userAgent, ipAddress
└── user_activities/
    └── [session-id]/
        ├── sessionId, timestamp, location
        ├── activity: "page_visit" | "file_upload" | etc.
        └── details: { custom data }
```

## 🔍 Viewing Your Data

1. **Open Firebase Emulator UI**: http://localhost:4000
2. **Click "Realtime Database"**
3. **Browse the `logs` node**
4. **See real-time updates** as you use the app

## 🧪 Testing Features

1. **Upload files** → Check `user_activities` for upload logs
2. **Process files** → Check `file_processing` for detailed logs
3. **Switch tabs** → Check `user_activities` for navigation logs
4. **Check location** → See location badge in top-left corner

## 💾 Data Persistence

### Keep Data Between Sessions
```bash
# Export data before stopping
firebase emulators:export ./emulator-data

# Import data when starting
firebase emulators:start --import ./emulator-data
```

### Start Fresh Each Time
```bash
# Just restart without importing
npm run dev:local
```

## 🐛 Troubleshooting

### Port Conflicts
```bash
# Check what's using port 9000
lsof -i :9000

# Kill process if needed
kill -9 <PID>
```

### Emulator Won't Start
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Try again
npm run dev:local
```

### App Can't Connect
1. Check browser console for Firebase connection messages
2. Verify emulator is running at http://localhost:4000
3. Ensure `NODE_ENV=development` in your environment

## 🔄 Production vs Local

| Feature | Local (Emulator) | Production (Firebase) |
|---------|------------------|----------------------|
| **Cost** | Free | Usage-based |
| **Internet** | Not required | Required |
| **Speed** | Very fast | Network dependent |
| **Data** | Memory only | Permanent |
| **Setup** | No project needed | Firebase project required |

## 📝 Environment Variables

For local development, create `.env.local`:

```env
NODE_ENV=development

# These can be dummy values for local development
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-project
NEXT_PUBLIC_FIREBASE_API_KEY=demo-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=http://localhost:9000?ns=demo-project-default-rtdb
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=demo-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

NEXT_PUBLIC_USE_FIREBASE_FUNCTIONS=false
```

The app automatically detects development mode and connects to the local emulator!

## 🎉 Benefits of Local Development

- ✅ **No Firebase project setup required**
- ✅ **No internet connection needed**
- ✅ **No usage costs or limits**
- ✅ **Fast development and testing**
- ✅ **Easy to reset and start fresh**
- ✅ **Perfect for CI/CD testing**
- ✅ **Identical to production behavior**

Start developing with Firebase Realtime Database locally in seconds! 🚀
